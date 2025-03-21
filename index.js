const { Client, logger } = require('./lib/client');
const { DATABASE, VERSION } = require('./config');
const { stopInstance } = require('./lib/pm2');

const start = async () => {
  logger.info(`levanter ${VERSION}`);

  // Step 1: Database Authentication with retries
  try {
    await DATABASE.authenticate({ retry: { max: 3 } });
    logger.info('Database connection successful');
  } catch (error) {
    const databaseUrl = process.env.DATABASE_URL || 'N/A';
    logger.error({ msg: 'Unable to connect to the database', error: error.message, databaseUrl });
    // Stop the instance if database connection fails
    return stopInstance();
  }

  // Step 2: Bot Initialization
  try {
    const bot = new Client();
    await bot.connect();
    logger.info('Bot successfully connected');
  } catch (error) {
    logger.error({ msg: 'Failed to start the bot', error: error.message });
  }

  // Optional: Add graceful shutdown (SIGINT, SIGTERM)
  process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    stopInstance();
  });

  process.on('SIGTERM', () => {
    logger.info('Received termination signal, shutting down...');
    stopInstance();
  });
};

// Check that essential environment variables are set
const validateEnvVariables = () => {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set!');
    stopInstance();
  }
  if (!process.env.SESSION_ID) {
    logger.error('SESSION_ID is not set!');
    stopInstance();
  }
};

validateEnvVariables();
start();
