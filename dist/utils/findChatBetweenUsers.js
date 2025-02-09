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
exports.findChatBetweenUsers = void 0;
const Chat_1 = require("../models/Chat");
const findChatBetweenUsers = (senderId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield Chat_1.Chat.findOne({
            members: { $all: [senderId, receiverId] },
        });
        return chat;
    }
    catch (error) {
        console.error("Error finding chat:", error);
        return null;
    }
});
exports.findChatBetweenUsers = findChatBetweenUsers;
