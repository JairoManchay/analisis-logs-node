import { z } from 'zod';

export const UploadLogSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number()
  })
});

export const FilterQuerySchema = z.object({
  dni: z.string().optional(),
  service: z.string().optional(),
  logId: z.string().uuid().optional(),
  endpoint: z.string().optional(),
  environment: z.string().regex(/^(QA|PRD|DEV)$/i).optional(),
  requestId: z.string().optional()
});

export type UploadLogInput = z.infer<typeof UploadLogSchema>;
export type FilterQueryInput = z.infer<typeof FilterQuerySchema>;
