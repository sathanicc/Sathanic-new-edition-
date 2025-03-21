const { Sequelize } = require('sequelize');
const { existsSync } = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const configPath = path.join(__dirname, './config.env');
const databasePath = path.join(__dirname, './database.db');

// Load environment variables from config.env if it exists
if (existsSync(configPath)) {
    dotenv.config({ path: configPath });
}

// Helper function to convert environment variables to boolean
const toBool = (x) => x === 'true';

// Default database URL if not defined
const DATABASE_URL = process.env.DATABASE_URL === undefined ? databasePath : process.env.DATABASE_URL;

module.exports = {
    VERSION: require('./package.json').version,
    SESSION_ID: (process.env.SESSION_ID || '').trim(),

    // Database Configuration (SQLite or PostgreSQL)
    DATABASE: DATABASE_URL === databasePath
        ? new Sequelize({
            dialect: 'sqlite',
            storage: DATABASE_URL,
            logging: false,
        })
        : new Sequelize(DATABASE_URL, {
            dialect: 'postgres',
            ssl: true,
            protocol: 'postgres',
            dialectOptions: {
                native: true,
                ssl: { require: true, rejectUnauthorized: false },
            },
            logging: false,
        }),

    // Bot command prefix (default: '^[.,!]')
    PREFIX: (process.env.PREFIX || '^[.,!]').trim(),

    // Admin Users (SUDO)
    SUDO: process.env.SUDO || '',

    // Heroku Configuration
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_API_KEY: process.env.HEROKU_API_KEY,

    // Branch for deployment
    BRANCH: 'master',

    // Sticker Pack Name
    STICKER_PACKNAME: process.env.STICKER_PACKNAME || '❤️,LyFE',

    // Bot's Online Presence
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || 'false',
    
    // Logging Configuration
    LOG_MSG: process.env.LOG_MSG || 'false',
    BAILEYS_LOG_LVL: process.env.BAILEYS_LOG_LVL || 'silent',

    // Language Configuration
    LANG: (process.env.LANGUAG || 'en').toLowerCase(),

    // Warning System
    WARN_LIMIT: process.env.WARN_LIMIT || 3,
    WARN_MESSAGE: process.env.WARN_MESSAGE || '⚠️WARNING⚠️\n*User :* &mention\n*Warn :* &warn\n*Remaining :* &remaining',
    WARN_RESET_MESSAGE: process.env.WARN_RESET_MESSAGE || 'WARN RESET\nUser : &mention\nRemaining : &remaining',
    WARN_KICK_MESSAGE: process.env.WARN_KICK_MESSAGE || '&mention kicked',

    // Auto Updates
    AUTO_UPDATE: process.env.AUTO_UPDATE || 'true',
    AUTO_UPDATE_FREQUENCY: process.env.AUTO_UPDATE_FREQUENCY || '24h', // Time interval for automatic updates

    // Anti-Spam & Anti-Word Features
    ANTILINK_MSG: process.env.ANTILINK_MSG || '_Antilink Detected &mention kicked_',
    ANTISPAM_MSG: process.env.ANTISPAM_MSG || '_Antispam Detected &mention kicked_',
    ANTIWORDS_MSG: process.env.ANTIWORDS_MSG || '_AntiWord Detected &mention kicked_',
    ANTIWORDS: process.env.ANTIWORDS || 'word',
    
    // Bot Moderation Features
    ANTI_BOT: (process.env.ANTI_BOT || 'off').trim(),
    ANTI_BOT_MESSAGE: process.env.ANTI_BOT_MESSAGE || '&mention removed',

    // Functionality Enhancements
    REJECT_CALL: process.env.REJECT_CALL || 'false', // Reject incoming calls if true
    AUTO_STATUS_VIEW: (process.env.AUTO_STATUS_VIEW || 'false').trim(), // Automatically view statuses
    SEND_READ: process.env.SEND_READ || 'false', // Automatically send read receipts (blue ticks)

    // Extra Features
    KOYEB: toBool(process.env.KOYEB),
    KOYEB_NAME: (process.env.KOYEB_NAME || '').trim(),
    KOYEB_API: (process.env.KOYEB_API || '').trim(),
    GPT: (process.env.GPT || 'free').trim(), // GPT Model version
    MODEL: (process.env.MODEL || 'gpt-3.5-turbo').trim(), // Model selection (GPT-3.5 or GPT-4)
    
    // Additional Configurations
    GROUP_ADMINS: process.env.GROUP_ADMINS || '',
    PERSONAL_MESSAGE: (process.env.PERSONAL_MESSAGE || 'null').trim(),
    DISABLE_START_MESSAGE: process.env.DISABLE_START_MESSAGE || 'false', // Disable start message
    
    // AI Integration for Bot Learning and Response
    AI_MODERATION: toBool(process.env.AI_MODERATION || 'false'), // Enable AI-based moderation
    AI_API_KEY: process.env.AI_API_KEY || '', // API Key for AI services
    
    // Timezone Configuration for Bot
    TIMEZONE: process.env.TIMEZONE || 'UTC',

    // Command Reaction Settings (Bot reacts to commands)
    CMD_REACTION: process.env.CMD_REACTION || 'true',

    // White List Users/Group that the bot doesn't moderate
    WHITE_LIST: process.env.WHITE_LIST || '',

    // Enhanced Bot Language Support (English by default)
    BOT_LANG: process.env.BOT_LANG || 'english',

    // Extra Configuration for Advanced Features
    BACKUP_FREQUENCY: process.env.BACKUP_FREQUENCY || '24', // Frequency of backups in hours
    ENABLE_2FA: process.env.ENABLE_2FA || 'false', // Two-factor authentication for enhanced security
    CUSTOM_COMMANDS: process.env.CUSTOM_COMMANDS || 'null', // Custom commands for admins

    // Custom API Integrations
    BING_COOKIE: (process.env.BING_COOKIE || '').trim(), // Cookie for Bing API integration
    GEMINI_API_KEY: (process.env.GEMINI_API_KEY || '').trim(), // API Key for Gemini
    RENDER_NAME: (process.env.RENDER_NAME || '').trim(), // Render API service name
    RENDER_API_KEY: (process.env.RENDER_API_KEY || '').trim(), // Render API Key
    TRUECALLER: process.env.TRUECALLER || '', // Truecaller integration (if applicable)

    // New Features for Error Handling & Bot Performance
    ERROR_LOGGING: process.env.ERROR_LOGGING || 'true', // Enable detailed error logging
    RATE_LIMIT: process.env.RATE_LIMIT || '1000', // Max API requests per minute (to avoid spamming)
    PERFORMANCE_LOGGING: process.env.PERFORMANCE_LOGGING || 'true', // Log performance metrics
};
