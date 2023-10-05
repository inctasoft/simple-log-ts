export declare class Log {
    private _correlation_id;
    get correlation_id(): string;
    constructor(correlation: string | {
        correlation_token: string;
    } & any);
    private allowedLogLevels;
    private logIfLevelInRange;
    info: (...data: any) => void;
    debug: (...data: any) => void;
    warn: (...data: any) => void;
    crit: (...data: any) => void;
    error: (...data: any) => void;
}
//# sourceMappingURL=log.d.ts.map