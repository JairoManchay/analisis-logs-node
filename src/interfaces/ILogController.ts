export interface ILogController {
  upload(req: Request, res: Response): Promise<void>;
  analyze(req: Request, res: Response): Promise<void>;
  getErrors(req: Request, res: Response): Promise<void>;
}

import { Request, Response } from 'express';
