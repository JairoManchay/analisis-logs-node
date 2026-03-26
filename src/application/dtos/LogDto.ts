import { z } from 'zod';

export const UploadLogFileDtoSchema = z.object({
  source: z.enum(['file', 'text']).optional().default('file'),
  fileName: z.string().optional(),
});

export const UploadLogTextDtoSchema = z.object({
  content: z.string().min(1, 'Log content cannot be empty'),
  fileName: z.string().optional(),
});

export const AnalyzeLogDtoSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
});

export const GetTopErrorsDtoSchema = z.object({
  n: z.coerce.number().int().min(1).max(100).optional().default(10),
  category: z.string().optional(),
});

export const GetErrorsByDateDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
});

export const GetRootCauseDtoSchema = z.object({
  patternId: z.string().uuid().optional(),
});

export const FilterEntriesDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  transactionId: z.string().optional(),
  errorCategory: z.string().optional(),
  severity: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type UploadLogFileDto = z.infer<typeof UploadLogFileDtoSchema>;
export type UploadLogTextDto = z.infer<typeof UploadLogTextDtoSchema>;
export type AnalyzeLogDto = z.infer<typeof AnalyzeLogDtoSchema>;
export type GetTopErrorsDto = z.infer<typeof GetTopErrorsDtoSchema>;
export type GetErrorsByDateDto = z.infer<typeof GetErrorsByDateDtoSchema>;
export type GetRootCauseDto = z.infer<typeof GetRootCauseDtoSchema>;
export type FilterEntriesDto = z.infer<typeof FilterEntriesDtoSchema>;
