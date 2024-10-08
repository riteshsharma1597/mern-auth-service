import app from './app';
import { Config } from './config';
import logger from './config/logger';
import { AppDataSource } from './config/data-source';

const startServer = async () => {
    const { PORT } = Config;
    try {
        await AppDataSource.initialize();
        logger.info(`Database connected successfully on port ${PORT}`);
        app.listen(PORT, () => {
            logger.info(`Listening on port ${PORT}`);
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            process.exit(1);
        }
    }
};

startServer();
