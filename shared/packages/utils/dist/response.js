"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, data, message) => {
    const response = {
        success: statusCode < 400,
        data,
        message,
    };
    res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendError = (res, statusCode, error, message) => {
    const response = {
        success: false,
        error,
        message,
    };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
