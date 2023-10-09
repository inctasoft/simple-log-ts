import { formatWithOptions, inspect } from "util";

const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRIT'];

export type CorrelationId = undefined | string
export class Log {
    private _correlation_id: string;

    private allowedLogLevels = (logLevel: string | undefined) => logLevels.slice(logLevels.indexOf(logLevel ?? 'WARN'))

    private logIfLevelInRange(loglevel: string, logFn: Function, data: any) {
        if (this.allowedLogLevels(process.env.LOGLEVEL).includes(loglevel)) {
            let logData;
            if (typeof data === 'object') {
                logData = data;
            } else {
                logData = { data }
            }
            logFn(formatWithOptions({ colors: true, depth: 10, showHidden: false }, '%j', {
                timestamp: new Date().getTime(),
                level: loglevel,
                correlation: this._correlation_id,
                ...logData
            }));
        }
    }

    constructor(correlation?: CorrelationId | { correlation_id?: CorrelationId, [x: string]: unknown }) {
        if (correlation instanceof String || typeof correlation === 'string') {
            this._correlation_id = String(correlation)
        }
        else if (correlation?.correlation_id) {
            this._correlation_id = String(correlation?.correlation_id)
        } else {
            this._correlation_id = 'UNKNOWN'
        }
    }

    public get correlation_id() {
        return this._correlation_id;
    }

    public info = (data: any) => this.logIfLevelInRange('INFO', console.info, data);
    public debug = (data: any) => this.logIfLevelInRange('DEBUG', console.log, data);
    public warn = (data: any) => this.logIfLevelInRange('WARN', console.warn, data);
    public crit = (data: any) => this.logIfLevelInRange('CRIT', console.error, data);
    public error = (data: any) => this.logIfLevelInRange('ERROR', console.error, data);

}
