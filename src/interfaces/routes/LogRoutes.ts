import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { uploadMiddleware } from '../../shared/middleware/UploadMiddleware';
import { validateBody, validateQuery } from '../../shared/middleware/ValidationMiddleware';
import {
  UploadLogTextDtoSchema,
  GetTopErrorsDtoSchema,
  GetErrorsByDateDtoSchema,
  GetRootCauseDtoSchema,
  FilterEntriesDtoSchema,
} from '../../application/dtos/LogDto';
import { z } from 'zod';

export function createLogRoutes(controller: LogController): Router {
  const router = Router();

  router.post(
    '/upload',
    uploadMiddleware.single('file'),
    controller.uploadFile
  );

  router.post(
    '/upload-text',
    validateBody(UploadLogTextDtoSchema),
    controller.uploadText
  );

  router.post(
    '/analyze/:batchId',
    validateBody(z.object({})),
    controller.analyze
  );

  router.get(
    '/errors/top/:batchId',
    validateQuery(GetTopErrorsDtoSchema),
    controller.getTopErrors
  );

  router.get(
    '/errors/by-date/:batchId',
    validateQuery(GetErrorsByDateDtoSchema),
    controller.getErrorsByDate
  );

  router.get(
    '/errors/root-cause/:batchId',
    validateQuery(GetRootCauseDtoSchema),
    controller.getRootCause
  );

  router.get(
    '/filter/:batchId',
    validateQuery(FilterEntriesDtoSchema),
    controller.filterEntries
  );

  router.get('/batches', controller.getBatches);

  return router;
}
