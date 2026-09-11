"""Secure OTP service for e-waste collection transactions."""

from __future__ import annotations

import hashlib
import hmac
import re
import secrets
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Protocol
from uuid import uuid4

OTP_TTL_SECONDS = 600
MAX_VERIFY_ATTEMPTS = 3
RESEND_COOLDOWN_SECONDS = 60
MAX_RESENDS = 3
MOBILE_RE = re.compile(r"^\+[1-9]\d{7,14}$")


class OTPError(Exception):
    code = "otp_error"


class InvalidMobileError(OTPError):
    code = "invalid_mobile"


class ActiveTransactionError(OTPError):
    code = "active_transaction"


class OTPNotFoundError(OTPError):
    code = "otp_not_found"


class OTPExpiredError(OTPError):
    code = "otp_expired"


class OTPAttemptsExceededError(OTPError):
    code = "max_attempts_exceeded"


class InvalidOTPError(OTPError):
    code = "invalid_otp"


class ResendCooldownError(OTPError):
    code = "resend_cooldown"


class ResendLimitError(OTPError):
    code = "resend_limit_exceeded"


class InvalidTransitionError(OTPError):
    code = "invalid_transaction_state"


class NotificationService(Protocol):
    def send_sms(self, mobile: str, message: str) -> None:
        ...


@dataclass(frozen=True)
class OTPRecord:
    transaction_id: str
    user_id: str
    mobile: str
    collector_id: str
    handler_id: str
    status: str
    generated_at: int
    expires_at: int
    verify_attempts: int
    resend_count: int
    verified_at: Optional[int]


def utc_now() -> int:
    return int(datetime.now(timezone.utc).timestamp())


def validate_mobile(mobile: str) -> str:
    normalized = mobile.strip()
    if not MOBILE_RE.fullmatch(normalized):
        raise InvalidMobileError("mobile must be in E.164 format")
    return normalized


class OTPService:
    def __init__(self, database="otp.sqlite3", secret: Optional[bytes] = None,
                 notifier: Optional[NotificationService] = None,
                 ttl_seconds=OTP_TTL_SECONDS, now=utc_now):
        self.connection = sqlite3.connect(database, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA foreign_keys = ON")
        self.connection.execute("PRAGMA journal_mode = WAL")
        self.secret = secret or secrets.token_bytes(32)
        self.notifier = notifier
        self.ttl_seconds = ttl_seconds
        self.now = now
        self._create_schema()

    def close(self):
        self.connection.close()

    def _create_schema(self):
        self.connection.executescript("""
            CREATE TABLE IF NOT EXISTS otp_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT NOT NULL UNIQUE,
                user_id TEXT NOT NULL,
                mobile TEXT NOT NULL,
                collector_id TEXT NOT NULL,
                handler_id TEXT NOT NULL,
                otp_digest BLOB NOT NULL,
                generated_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                verify_attempts INTEGER NOT NULL DEFAULT 0,
                resend_count INTEGER NOT NULL DEFAULT 0,
                last_sent_at INTEGER NOT NULL,
                verified_at INTEGER,
                status TEXT NOT NULL CHECK (status IN
                  ('sent','verified','collected','payment_pending','completed','expired','revoked'))
            );
            CREATE INDEX IF NOT EXISTS idx_otp_active_user
              ON otp_records(user_id, status, expires_at);
            CREATE INDEX IF NOT EXISTS idx_otp_transaction
              ON otp_records(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_otp_expiry
              ON otp_records(expires_at, status);
            CREATE TABLE IF NOT EXISTS otp_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT NOT NULL,
                event TEXT NOT NULL,
                occurred_at INTEGER NOT NULL,
                success INTEGER NOT NULL,
                details TEXT,
                FOREIGN KEY(transaction_id) REFERENCES otp_records(transaction_id)
            );
            CREATE INDEX IF NOT EXISTS idx_otp_audit_transaction
              ON otp_audit_log(transaction_id, occurred_at);
        """)
        self.connection.commit()

    def _digest(self, otp):
        return hmac.new(self.secret, otp.encode("ascii"), hashlib.sha256).digest()

    def _new_otp(self):
        return f"{secrets.randbelow(1_000_000):06d}"

    def _audit(self, transaction_id, event, success, details=""):
        self.connection.execute(
            "INSERT INTO otp_audit_log(transaction_id,event,occurred_at,success,details) VALUES (?,?,?,?,?)",
            (transaction_id, event, self.now(), int(success), details))

    def _send(self, mobile, otp):
        if self.notifier:
            self.notifier.send_sms(mobile, f"Your e-waste collection OTP is {otp}. It expires soon.")

    def _row(self, transaction_id):
        row = self.connection.execute(
            "SELECT * FROM otp_records WHERE transaction_id = ?", (transaction_id,)).fetchone()
        if not row:
            raise OTPNotFoundError("transaction does not have an OTP session")
        return row

    def generate_otp(self, user_id, mobile, collector_id, handler_id, transaction_id=None):
        mobile = validate_mobile(mobile)
        transaction_id = transaction_id or str(uuid4())
        now = self.now()
        otp = self._new_otp()
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            active = self.connection.execute(
                """SELECT transaction_id FROM otp_records
                   WHERE user_id = ? AND expires_at > ?
                     AND status IN ('sent','verified','collected','payment_pending') LIMIT 1""",
                (user_id, now)).fetchone()
            if active:
                raise ActiveTransactionError("user already has an active collection transaction")
            self.connection.execute(
                """INSERT INTO otp_records
                (transaction_id,user_id,mobile,collector_id,handler_id,otp_digest,
                 generated_at,expires_at,last_sent_at) VALUES (?,?,?,?,?,?,?,?,?)""",
                (transaction_id, user_id, mobile, collector_id, handler_id,
                 self._digest(otp), now, now + self.ttl_seconds, now))
            self._audit(transaction_id, "generated", True)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        self._send(mobile, otp)
        return self.get_record(transaction_id)

    def validate_otp(self, transaction_id, otp):
        now = self.now()
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            row = self._row(transaction_id)
            if row["status"] != "sent":
                raise InvalidOTPError("OTP is no longer valid")
            if now >= row["expires_at"]:
                self.connection.execute("UPDATE otp_records SET status='expired' WHERE transaction_id=?", (transaction_id,))
                self._audit(transaction_id, "verify", False, "expired")
                self.connection.commit()
                raise OTPExpiredError("OTP has expired")
            if row["verify_attempts"] >= MAX_VERIFY_ATTEMPTS:
                self.connection.execute("UPDATE otp_records SET status='revoked' WHERE transaction_id=?", (transaction_id,))
                self.connection.commit()
                raise OTPAttemptsExceededError("maximum OTP attempts exceeded")
            valid = isinstance(otp, str) and re.fullmatch(r"\d{6}", otp) and hmac.compare_digest(
                row["otp_digest"], self._digest(otp))
            if not valid:
                attempts = row["verify_attempts"] + 1
                status = "revoked" if attempts >= MAX_VERIFY_ATTEMPTS else "sent"
                self.connection.execute(
                    "UPDATE otp_records SET verify_attempts=?, status=? WHERE transaction_id=?",
                    (attempts, status, transaction_id))
                self._audit(transaction_id, "verify", False, f"invalid attempt {attempts}")
                self.connection.commit()
                if attempts >= MAX_VERIFY_ATTEMPTS:
                    raise OTPAttemptsExceededError("maximum OTP attempts exceeded")
                raise InvalidOTPError("OTP is incorrect")
            self.connection.execute(
                "UPDATE otp_records SET status='verified', verified_at=? WHERE transaction_id=?",
                (now, transaction_id))
            self._audit(transaction_id, "verified", True)
            self.connection.commit()
            return self.get_record(transaction_id)
        except Exception:
            if self.connection.in_transaction:
                self.connection.rollback()
            raise

    def resend_otp(self, transaction_id):
        now = self.now()
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            row = self._row(transaction_id)
            if row["status"] != "sent":
                raise InvalidOTPError("OTP session is no longer resendable")
            if now >= row["expires_at"]:
                self.connection.execute("UPDATE otp_records SET status='expired' WHERE transaction_id=?", (transaction_id,))
                self.connection.commit()
                raise OTPExpiredError("OTP has expired; generate a new transaction OTP")
            if now - row["last_sent_at"] < RESEND_COOLDOWN_SECONDS:
                raise ResendCooldownError("please wait before requesting another OTP")
            if row["resend_count"] >= MAX_RESENDS:
                raise ResendLimitError("maximum OTP resends exceeded")
            otp = self._new_otp()
            self.connection.execute(
                """UPDATE otp_records SET otp_digest=?, generated_at=?, expires_at=?,
                   last_sent_at=?, resend_count=resend_count+1 WHERE transaction_id=?""",
                (self._digest(otp), now, now + self.ttl_seconds, now, transaction_id))
            self._audit(transaction_id, "resent", True)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        self._send(row["mobile"], otp)
        return self.get_record(transaction_id)

    def revoke_otp(self, transaction_id, reason="revoked by caller"):
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            self._row(transaction_id)
            self.connection.execute("UPDATE otp_records SET status='revoked' WHERE transaction_id=?", (transaction_id,))
            self._audit(transaction_id, "revoked", True, reason)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        return self.get_record(transaction_id)

    def transition(self, transaction_id, status):
        allowed = {"verified": {"collected"}, "collected": {"payment_pending"},
                    "payment_pending": {"completed"}}
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            row = self._row(transaction_id)
            if status not in allowed.get(row["status"], set()):
                raise InvalidTransitionError(f"cannot move {row['status']} to {status}")
            self.connection.execute("UPDATE otp_records SET status=? WHERE transaction_id=?", (status, transaction_id))
            self._audit(transaction_id, status, True)
            if status == "completed":
                self.connection.execute("UPDATE otp_records SET otp_digest=x'' WHERE transaction_id=?", (transaction_id,))
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        return self.get_record(transaction_id)

    def get_record(self, transaction_id):
        row = self._row(transaction_id)
        fields = ("transaction_id", "user_id", "mobile", "collector_id", "handler_id", "status",
                  "generated_at", "expires_at", "verify_attempts", "resend_count", "verified_at")
        return OTPRecord(*(row[field] for field in fields))