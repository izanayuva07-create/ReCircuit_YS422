"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_js_1 = require("../lib/logger.js");
class AppError extends Error {
    status;
    type;
    details;
    constructor(title, status = 400, type = 'about:blank', details) {
        super(title);
        this.status = status;
        this.type = type;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const problem = {
        type: err.type || (status === 500 ? 'https://recircuit.org/errors/internal-server-error' : 'https://recircuit.org/errors/bad-request'),
        title: err.message || 'An unexpected error occurred',
        status,
        detail: err.details?.message || err.message,
        instance: req.originalUrl,
    };
    if (err.details?.errors) {
        problem.invalidParams = err.details.errors;
    }
    logger_js_1.logger.error({
        trace_id: req.headers['x-request-id'] || 'no-trace',
        method: req.method,
        url: req.originalUrl,
        status,
        msg: problem.title,
        stack: status === 500 ? err.stack : undefined,
    });
    res.status(status).contentType('application/problem+json').json(problem);
};
exports.errorHandler = errorHandler;
