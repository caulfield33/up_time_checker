# Simple up resource checker


### Configuration
| ENV                      | Description                                                                    |
|--------------------------|--------------------------------------------------------------------------------|
| NODE_ENV                 | Container version                                                              |
| APP_NAME                 | App name                                                                       |
| APP_PORT                 |                            App port for /healthcheck                           |
| SCAN_INTERVAL_IN_SECONDS | Scan interval in seconds                                                       |
| RENOTIFY_EVERY_N_SECONDS | Send new notification if container still offline after defined time in seconds |
| SLACK_WEBHOOK_URL        | Slack webhook url                                                              |
| RESOURCES_URLS           | Urls to check separated by coma                                                |

### Init
* Create `.env` file like `.env.example`
* Create Docker Image
 ```
    sudo docker build -t up_time_ckecker .
 ```
* Run Tele farm container
 ```
   sudo docker run -d --name up_time_ckecker --restart always up_time_ckecker:latest
 ```

### Info
* Sqlite3 DB with all down records located in `data/database.db`