import dotenv from 'dotenv'
import path from "path";

dotenv.config()

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

export type Build = 'development' | 'production' | 'test' | "local" | 'rpi';

export interface Config {
    build: Build,
    scanInterval: number;
    slackWebhookUrl: string;
    dbPath: string;
    resourcesUrls: string[];
    renotifyEvery: number;
    app: {
        name: string,
        port: number
    },
}


const config: Config = {
    build: process.env.NODE_ENV as Build,
    scanInterval: Number(process.env.SCAN_INTERVAL_IN_SECONDS),
    renotifyEvery: Number(process.env.RENOTIFY_EVERY_N_SECONDS),
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    resourcesUrls: process.env.RESOURCES_URLS.split(','),
    dbPath: path.join(__dirname, `../../data/database.db`),
    app: {
        name: process.env.APP_NAME,
        port: Number(process.env.APP_PORT)
    },
}

export default config
