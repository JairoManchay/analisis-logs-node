"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterQuerySchema = exports.UploadLogSchema = void 0;
const zod_1 = require("zod");
exports.UploadLogSchema = zod_1.z.object({
    file: zod_1.z.object({
        originalname: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        size: zod_1.z.number()
    })
});
exports.FilterQuerySchema = zod_1.z.object({
    dni: zod_1.z.string().optional(),
    service: zod_1.z.string().optional(),
    logId: zod_1.z.string().uuid().optional(),
    endpoint: zod_1.z.string().optional(),
    environment: zod_1.z.string().regex(/^(QA|PRD|DEV)$/i).optional(),
    requestId: zod_1.z.string().optional()
});
//# sourceMappingURL=LogValidators.js.map