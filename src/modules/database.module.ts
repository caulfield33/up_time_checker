import sqlite3, {Database} from 'sqlite3';
import config from "../config";
import fs from "fs";
import moment from "moment";

export default class DatabaseModule {
    private readonly _database: Promise<Database>;

    constructor() {
        this._database = new Promise<Database>(((resolve, reject) => {
            this.initDb(resolve, reject);
        }))

        this.configureDataBase();
    }

    private initDb(resolve, reject) {
        if (!fs.existsSync(config.dbPath)) {
            fs.writeFileSync(config.dbPath, '')
        }

        const db = new sqlite3.Database(config.dbPath, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve(db);
                console.log('✌️ Database connected!')
            }
        })
    }

    private configureDataBase(): void {
        this._database.then((database) => {
            database.serialize(() => {

                database.run(`
                    CREATE TABLE IF NOT EXISTS "issue" (
                        "resource"    INTEGER NOT NULL,
                        "event"       TEXT    NOT NULL,
                        "date"        TEXT    NOT NULL
                    )`
                );

            });
        })
    }

    public async insertIssue(resource: string, event: string, date: Date): Promise<void> {
        const db = await this.database;

        db.run(
            `INSERT INTO issue(resource, event, date) VALUES (?, ?, ?)`,
            [resource, event, date.toISOString()],
            (err) => {
                if (err) {
                    return console.log(err.message);
                }
            });
    }

    public async getResourceIssuesFromStart(resource: string): Promise<number> {
        const db = await this.database;

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT COUNT(*) AS issues FROM issue WHERE resource = ?`,
                [resource],
                (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data.issues)
                });
        })
    }

    public async getResourceIssuesThisMount(resource: string): Promise<number> {
        const db = await this.database;

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT COUNT(*) AS issues FROM issue WHERE resource = ? AND date >= ? AND date <= ?`,
                [
                    resource,
                    moment(new Date()).startOf('months').toISOString(),
                    moment(new Date()).endOf('months').toISOString()
                ],
                (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data.issues)
                });
        })
    }

    get database(): Promise<Database> {
        return this._database;
    }
}
