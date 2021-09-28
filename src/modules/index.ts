import {Application} from "express";
import ExpressModule from './express.module';
import DatabaseModule from "./database.module";
import MonitoringModule from "./monitoring.module";


export default async (app: Application): Promise<Application> => {

    new ExpressModule(app)

    const databaseModule = new DatabaseModule()

    const requestModule = new MonitoringModule(databaseModule)

    await requestModule.starkTracking();

    return app
}
