import { Router, Request, Response } from 'express';
import * as os from 'os';

export function createHealthRoutes(): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
        cpus: os.cpus().length,
        platform: os.platform(),
        nodeVersion: process.version,
      },
    });
  });

  router.get('/ready', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        ready: true,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
}
