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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatch = void 0;
const Batch_1 = __importDefault(require("../models/Batch/Batch"));
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, institute, batchType } = req.body;
        const createdBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming authentication middleware
        const batch = new Batch_1.default({
            name,
            description,
            createdBy,
            batchType,
            institute,
            membersList: [{ userId: createdBy, role: "admin" }],
        });
        yield batch.save();
        res.status(201).json({ success: true, data: batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating batch", error });
    }
});
exports.createBatch = createBatch;
