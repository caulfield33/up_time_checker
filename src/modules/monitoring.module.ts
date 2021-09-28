import axios, {AxiosInstance, AxiosResponse} from 'axios';
import config from "../config";
import DatabaseModule from "./database.module";
import moment from "moment";

export default class MonitoringModule {
    private readonly instance: AxiosInstance;
    private readonly database: DatabaseModule;

    private downResources: { [key: string]: {start: Date, ignore: boolean} } = {};

    private readonly downMessage = (resource: string, thisMount: number, fromStart: number) => ({
        'username': 'Mr.Anderson',
        'text': `Resource ${resource} is down!!!`,
        'icon_emoji': ':boom:',
        'attachments': [{
            'color': '#ff0000',
            'fields': [
                {
                    'title': 'This mount',
                    'value': `${thisMount}`,
                    'short': true
                },
                {
                    'title': 'From start',
                    'value': `${fromStart}`,
                    'short': true
                }
            ]
        }]
    });
    private readonly upMessage = (resource: string, downFrom: Date, downTime: string) => ({
        'username': 'Mr.Anderson',
        'text': `Resource ${resource} is back online!!!`,
        'icon_emoji': ':tada:',
        'attachments': [{
            'color': '#00ff3c',
            'fields': [
                {
                    'title': 'Down from',
                    'value': `${moment(downFrom).format('HH:mm:ss DD/MM/YYY')}`,
                    'short': true
                },
                {
                    'title': 'Up at',
                    'value': `${moment(new Date()).format('HH:mm:ss DD/MM/YYY')}`,
                    'short': true
                },
                {
                    'title': 'Offline for',
                    'value': `${downTime}`,
                    'short': true
                },
            ]
        }]
    })

    constructor(db: DatabaseModule) {
        this.database = db;
        this.instance = axios.create();

        this.instance.interceptors.response.use(
            response => response,
            error => error
        );
    }

    public async starkTracking(): Promise<void> {
        console.log(`✌️ Start checking resources every ${config.scanInterval}s !`)

        await this.resourceChecker();

        setInterval(() => this.resourceChecker(), config.scanInterval * 1000);
    }

    private async resourceChecker(): Promise<void> {

        const requestPromises = config.resourcesUrls.map(resource => this.instance.get(resource));

        const responses = await Promise.all(requestPromises);

        responses.forEach(response => this.handleResponse(response))
    }

    private handleResponse(response: AxiosResponse | any): void {
        if (response?.statusText === 'OK') {
            if (this.downResources[response.config.url]) {
                this.upResourceNotify(response.config.url, this.downResources[response.config.url].start);
                delete this.downResources[response.config.url];
            }
        } else if (!this.downResources[response.config.url]) {
            this.downResources[response.config.url] = {start: new Date(), ignore: true};
            this.downResourceNotify(response.config.url);
        } else if (this.downResources[response.config.url] && !this.downResources[response.config.url].ignore) {
            this.downResources[response.config.url].ignore = true;
            this.downResourceNotify(response.config.url);
        }
    }

    private async upResourceNotify(resource: string, downFrom: Date): Promise<void> {

        const downTime = MonitoringModule.downTimeCalculator(downFrom);

        const msg = this.upMessage(resource, downFrom, downTime);

        await this.instance.post(config.slackWebhookUrl, msg);

        delete this.downResources[resource]

        console.log('up resource => ' + resource)
    }

    private async downResourceNotify(resource: string): Promise<void> {
        await this.database.insertIssue(resource, 'down', new Date())

        const [fromStart, thisMount] = await Promise.all([
            this.database.getResourceIssuesFromStart(resource),
            this.database.getResourceIssuesThisMount(resource),
        ])

        const msg = this.downMessage(resource, thisMount, fromStart);

        await this.instance.post(config.slackWebhookUrl, msg);

        console.log('down resource => ' + resource)

        setTimeout(() => {
            if (this.downResources[resource]) {
                this.downResources[resource].ignore = false;
            }
        }, config.renotifyEvery * 1000)
    }

    private static downTimeCalculator(downFrom: Date): string {
        const now = moment(new Date());
        const expiration = moment(downFrom);

        const diff = now.diff(expiration);

        const diffDuration = moment.duration(diff);

        if (Math.sign(diffDuration.days()) === -1 || Math.sign(diffDuration.hours()) === -1) {
            return '-';
        }

        let leftTime = '';

        if (diffDuration.days() !== 0) {
            leftTime = `${diffDuration.days()} days`;
        }

        if (diffDuration.hours() !== 0) {
            leftTime = `${leftTime} ${diffDuration.hours()} hours`;
        }

        if (diffDuration.minutes() !== 0) {
            leftTime = `${leftTime} ${diffDuration.minutes()} minutes`;
        }

        if (diffDuration.seconds() !== 0) {
            leftTime = `${leftTime} ${diffDuration.seconds()} seconds`;
        }

        return leftTime;
    }

}
