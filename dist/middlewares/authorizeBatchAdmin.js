"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeBatchAdmin = void 0;
const Batch_1 = require("../models/Batch/Batch");
const authorizeBatchAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { batchId } = req.params; // Get batchId from request params
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        // Check if the user is an admin or moderator
        const member = batch.membersList.find((m) => m.userId.toString() === userId);
        if (!member || (member.role !== "admin" && member.role !== "moderator")) {
            return res.status(403).json({ success: false, message: "Forbidden: Admin or Moderator access required" });
        }
        next();
    }
    catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.authorizeBatchAdmin = authorizeBatchAdmin;
