import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from otp_service import OTPError, OTPService


class ConsoleSms:
    def send_sms(self, mobile, message):
        print(f"[SMS GATEWAY] {mobile}: {message}", flush=True)


service = OTPService(database="otp.sqlite3", notifier=ConsoleSms())


def record_json(record):
    return {
        "pickupJobId": record.transaction_id,
        "mobileLastFour": record.mobile[-4:],
        "eKartHandlerId": record.handler_id,
        "collectorId": record.collector_id,
        "status": record.status,
        "expiresAt": record.expires_at,
        "attempts": record.verify_attempts,
        "resendCount": record.resend_count,
    }


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.end_headers()

    def do_GET(self):  # noqa: N802
        if self.path == "/api/health":
            self.send_json(200, {"success": True, "service": "ewaste-otp", "status": "ok"})
            return
        self.send_json(404, {"success": False, "error": "not_found"})

    def do_POST(self):  # noqa: N802
        try:
            size = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(size) or b"{}")
            if self.path == "/api/handover/generate-otp":
                record = service.generate_otp(
                    user_id=body.get("mobileNumber", ""),
                    mobile=body.get("mobileNumber", ""),
                    collector_id=body.get("collectorId", "UNASSIGNED"),
                    handler_id=body.get("eKartHandlerId", ""),
                    transaction_id=body.get("pickupJobId"),
                )
                self.send_json(201, {"success": True, "message": "OTP generated and sent", **record_json(record)})
                return
            if self.path == "/api/handover/verify-otp":
                pickup_id = body["pickupJobId"]
                record = service.validate_otp(pickup_id, body.get("enteredOtp"))
                service.transition(pickup_id, "collected")
                service.transition(pickup_id, "payment_pending")
                service.transition(pickup_id, "completed")
                self.send_json(200, {
                    "success": True,
                    "message": "OTP verified and handover completed",
                    "connectionStatus": "DISCONNECTED",
                    "transaction": {
                        "transactionId": f"TXN_{pickup_id}",
                        "amountCredited": body.get("paymentAmount", 0),
                        "userMobile": record.mobile,
                        "status": "SETTLED",
                    },
                })
                return
            if self.path == "/api/handover/resend-otp":
                record = service.resend_otp(body["pickupJobId"])
                self.send_json(200, {"success": True, "message": "A new OTP was sent", **record_json(record)})
                return
            if self.path == "/api/handover/revoke-otp":
                record = service.revoke_otp(body["pickupJobId"], body.get("reason", "revoked by caller"))
                self.send_json(200, {"success": True, **record_json(record)})
                return
            self.send_json(404, {"success": False, "error": "not_found"})
        except OTPError as exc:
            self.send_json(409, {"success": False, "error": exc.code, "message": str(exc)})
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"success": False, "error": "invalid_request", "message": str(exc)})


if __name__ == "__main__":
    print("ReCircuit OTP backend running at http://localhost:3000", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 3000), Handler).serve_forever()