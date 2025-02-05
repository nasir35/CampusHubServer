"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Wraps async functions to catch errors & forward them to error handler
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.default = asyncHandler;
