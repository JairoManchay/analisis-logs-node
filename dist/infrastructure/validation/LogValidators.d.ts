import { z } from 'zod';
export declare const UploadLogSchema: z.ZodObject<{
    file: z.ZodObject<{
        originalname: z.ZodString;
        mimetype: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        originalname: string;
        mimetype: string;
        size: number;
    }, {
        originalname: string;
        mimetype: string;
        size: number;
    }>;
}, "strip", z.ZodTypeAny, {
    file: {
        originalname: string;
        mimetype: string;
        size: number;
    };
}, {
    file: {
        originalname: string;
        mimetype: string;
        size: number;
    };
}>;
export declare const FilterQuerySchema: z.ZodObject<{
    dni: z.ZodOptional<z.ZodString>;
    service: z.ZodOptional<z.ZodString>;
    logId: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    requestId?: string | undefined;
    service?: string | undefined;
    dni?: string | undefined;
    logId?: string | undefined;
    endpoint?: string | undefined;
    environment?: string | undefined;
}, {
    requestId?: string | undefined;
    service?: string | undefined;
    dni?: string | undefined;
    logId?: string | undefined;
    endpoint?: string | undefined;
    environment?: string | undefined;
}>;
export type UploadLogInput = z.infer<typeof UploadLogSchema>;
export type FilterQueryInput = z.infer<typeof FilterQuerySchema>;
//# sourceMappingURL=LogValidators.d.ts.map