import { formatWithOptions } from "util";
import { transform } from "./transform";

const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRIT'];

export type LogConfig = {
    correlation_id: string,
    printMapSetTypes: boolean,
    printCorrelation: boolean,
    [x: string]: unknown
}
export class Log {
    public get config() {
        return this._config;
    }
    public debug = (data: any) => this.logIfLevelInRange('DEBUG', console.log, data);
    public info = (data: any) => this.logIfLevelInRange('INFO', console.info, data);
    public warn = (data: any) => this.logIfLevelInRange('WARN', console.warn, data);
    public error = (data: any, error?: Error) => this.logIfLevelInRange('ERROR', console.error, data, error);
    public crit = (data: any, error?: Error) => this.logIfLevelInRange('CRIT', console.error, data, error);

    private _config: LogConfig;
    private allowedLogLevels = (logLevel: string | undefined) => logLevels.slice(logLevels.indexOf(logLevel ?? 'WARN'))

    constructor(config?: Partial<LogConfig>) {
        this._config = {
            correlation_id: String(config?.correlation_id),
            printMapSetTypes: config?.printMapSetTypes ?? false,
            printCorrelation: config?.printCorrelation ?? true
        }
    }

    private logIfLevelInRange(loglevel: string, logFn: Function, data: any, error?: Error) {
        if (this.allowedLogLevels(process.env.LOGLEVEL).includes(loglevel)) {
            const logData = {
                timestamp: new Date().toISOString(),
                level: loglevel,
                message: transform(data, this._config.printMapSetTypes)
            };
            if (this.config.printCorrelation) {
                Object.assign(logData, { correlation: this._config.correlation_id })
            }
            if (error) {
                const t = transform(error, true);
                Object.assign(logData, t);
            }
            logFn(formatWithOptions({ colors: true, depth: 10, showHidden: false }, '%j', logData));
        }
    }
}
