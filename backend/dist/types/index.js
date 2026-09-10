"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutMethodType = exports.TransactionType = exports.DisputeStatus = exports.DisputeReason = exports.FulfillmentType = exports.BookingStatus = exports.BidStatus = exports.InventoryStatus = exports.ListingStatus = exports.Actor = void 0;
var Actor;
(function (Actor) {
    Actor["SOURCE"] = "source";
    Actor["COLLECTOR"] = "collector";
    Actor["ADMIN"] = "admin";
    Actor["MODERATOR"] = "moderator";
    Actor["AUDITOR"] = "auditor";
})(Actor || (exports.Actor = Actor = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["CREATING"] = "CREATING";
    ListingStatus["AI_CLASSIFYING"] = "AI_CLASSIFYING";
    ListingStatus["CONFIRMING"] = "CONFIRMING";
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["MATCHED"] = "MATCHED";
    ListingStatus["BOOKED"] = "BOOKED";
    ListingStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ListingStatus["COMPLETED"] = "COMPLETED";
    ListingStatus["PAID"] = "PAID";
    ListingStatus["LOW_CONFIDENCE"] = "LOW_CONFIDENCE";
    ListingStatus["EXPIRED"] = "EXPIRED";
    ListingStatus["CANCELLED"] = "CANCELLED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var InventoryStatus;
(function (InventoryStatus) {
    InventoryStatus["DRAFT"] = "DRAFT";
    InventoryStatus["ACTIVE"] = "ACTIVE";
    InventoryStatus["BIDDING"] = "BIDDING";
    InventoryStatus["NEGOTIATING"] = "NEGOTIATING";
    InventoryStatus["ACCEPTED"] = "ACCEPTED";
    InventoryStatus["BOOKED"] = "BOOKED";
    InventoryStatus["IN_TRANSIT"] = "IN_TRANSIT";
    InventoryStatus["COMPLETED"] = "COMPLETED";
    InventoryStatus["PAID_OUT"] = "PAID_OUT";
    InventoryStatus["EXPIRED"] = "EXPIRED";
    InventoryStatus["REJECTED"] = "REJECTED";
})(InventoryStatus || (exports.InventoryStatus = InventoryStatus = {}));
var BidStatus;
(function (BidStatus) {
    BidStatus["PENDING"] = "PENDING";
    BidStatus["ACCEPTED"] = "ACCEPTED";
    BidStatus["REJECTED"] = "REJECTED";
    BidStatus["COUNTERED"] = "COUNTERED";
    BidStatus["EXPIRED"] = "EXPIRED";
})(BidStatus || (exports.BidStatus = BidStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["BOOKED"] = "BOOKED";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["IN_TRANSIT"] = "IN_TRANSIT";
    BookingStatus["ARRIVED"] = "ARRIVED";
    BookingStatus["VERIFIED"] = "VERIFIED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["DISPUTED"] = "DISPUTED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var FulfillmentType;
(function (FulfillmentType) {
    FulfillmentType["PICKUP"] = "PICKUP";
    FulfillmentType["DELIVERY"] = "DELIVERY";
})(FulfillmentType || (exports.FulfillmentType = FulfillmentType = {}));
var DisputeReason;
(function (DisputeReason) {
    DisputeReason["ITEM_MISMATCH"] = "ITEM_MISMATCH";
    DisputeReason["NO_SHOW"] = "NO_SHOW";
    DisputeReason["PAYMENT_ISSUE"] = "PAYMENT_ISSUE";
    DisputeReason["DAMAGE"] = "DAMAGE";
    DisputeReason["OTHER"] = "OTHER";
})(DisputeReason || (exports.DisputeReason = DisputeReason = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPEN"] = "OPEN";
    DisputeStatus["IN_REVIEW"] = "IN_REVIEW";
    DisputeStatus["RESOLVED_COLLECTOR"] = "RESOLVED_COLLECTOR";
    DisputeStatus["RESOLVED_SOURCE"] = "RESOLVED_SOURCE";
    DisputeStatus["RESOLVED_SPLIT"] = "RESOLVED_SPLIT";
    DisputeStatus["ESCALATED"] = "ESCALATED";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["ESCROW_HOLD"] = "ESCROW_HOLD";
    TransactionType["ESCROW_RELEASE"] = "ESCROW_RELEASE";
    TransactionType["PLATFORM_FEE"] = "PLATFORM_FEE";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["PAYOUT"] = "PAYOUT";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
    TransactionType["DEPOSIT"] = "DEPOSIT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var PayoutMethodType;
(function (PayoutMethodType) {
    PayoutMethodType["BANK_ACCOUNT"] = "BANK_ACCOUNT";
    PayoutMethodType["UPI"] = "UPI";
    PayoutMethodType["CARD"] = "CARD";
    PayoutMethodType["WALLET"] = "WALLET";
})(PayoutMethodType || (exports.PayoutMethodType = PayoutMethodType = {}));
