import multer from 'multer';
import { AppConfig } from '../config/AppConfig';

const config = AppConfig.getInstance();

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes = [
    'text/plain',
    'application/octet-stream',
    'application/x-log',
  ];

  const allowedExtensions = ['.log', '.txt', '.logcat'];
  const fileExtension = file.originalname.toLowerCase().substring(
    file.originalname.lastIndexOf('.')
  );

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
    files: 1,
  },
  fileFilter,
});
