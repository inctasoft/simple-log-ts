import { formatWithOptions, inspect } from "util";
import { transform } from "./transform";

const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRIT'];

export type CorrelationId = undefined | string
export type LogConfig = {
    correlation_id?: CorrelationId,
    printTypes?: boolean,
    skipCorrelation?: boolean,
    [x: string]: unknown
}
export class Log {
    private _correlation_id: string;
    private _printTypes: boolean;
    private _skipCorrelation: boolean;
    private allowedLogLevels = (logLevel: string | undefined) => logLevels.slice(logLevels.indexOf(logLevel ?? 'WARN'))

    constructor(correlation?: CorrelationId | LogConfig) {
        if (correlation instanceof String || typeof correlation === 'string') {
            this._correlation_id = String(correlation);
            this._printTypes = false;
            this._skipCorrelation = false;
        }
        else if (typeof correlation === 'object') {
            this._printTypes = correlation.printTypes ?? false;
            this._skipCorrelation = correlation?.skipCorrelation ?? false;
            this._correlation_id = String(correlation?.correlation_id);
        } else {
            this._correlation_id = 'UNKNOWN';
            this._printTypes = false;
            this._skipCorrelation = false;
        }
    }

    private logIfLevelInRange(loglevel: string, logFn: Function, data: any) {
        if (this.allowedLogLevels(process.env.LOGLEVEL).includes(loglevel)) {
            const logData = {
                timestamp: new Date().toISOString(),
                level: loglevel,
                message: transform(data, this._printTypes)
            };
            if (! this._skipCorrelation) {
                Object.assign(logData, { correlation: this._correlation_id })
            }
            logFn(formatWithOptions({ colors: true, depth: 10, showHidden: false }, '%j', logData));
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
