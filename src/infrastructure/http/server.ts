import { app } from './controllers/LogController';
import { Logger } from '../../shared/Logger';

const PORT = process.env.PORT || 3000;
const logger = Logger.getInstance();

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
