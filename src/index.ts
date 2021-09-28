import express, {Application} from 'express';
import config from "./config";
import loadModules from './modules';

class Server {
    public static app: Application;

    public static createServer(): void {
        this.app = express();

        loadModules(this.app).then(() => {
            this.app.listen(config.app.port)

            console.log(`\n[${config.build}] App '${config.app.name}' ready!`);
        }).catch(e => {

            console.log(`Initialization failed!`)
            console.log(e)
        })
    }
}

Server.createServer();
