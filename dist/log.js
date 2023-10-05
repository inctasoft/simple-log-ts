"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const util_1 = require("util");
const logLevels = ["DEBUG", "INFO", "WARN", "ERROR", "CRIT"];
class Log {
    get correlation_id() {
        return this._correlation_id;
    }
    constructor(correlation) {
        this.allowedLogLevels = (logLevel) => logLevels.slice(logLevels.indexOf(logLevel || "WARN"));
        this.info = (...data) => this.logIfLevelInRange("INFO", console.info, ...data);
        this.debug = (...data) => this.logIfLevelInRange("DEBUG", console.log, ...data);
        this.warn = (...data) => this.logIfLevelInRange("WARN", console.warn, ...data);
        this.crit = (...data) => this.logIfLevelInRange("CRIT", console.error, ...data);
        this.error = (...data) => this.logIfLevelInRange("ERROR", console.error, ...data);
        if (correlation instanceof String || typeof correlation === 'string') {
            this._correlation_id = String(correlation);
        }
        else if (correlation?.correlation_token) {
            this._correlation_id = String(correlation?.correlation_token);
        }
        else {
            this._correlation_id = 'UNKNOWN';
        }
    }
    logIfLevelInRange(loglevel, logFn, ...data) {
        if (this.allowedLogLevels(process.env.LOGLEVEL).includes(loglevel)) {
            logFn.call(null, { loglevel, correlation: this._correlation_id, ...data.map((d) => (0, util_1.inspect)(d, false, 10, false)) });
        }
    }
}
exports.Log = Log;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBOEI7QUFFOUIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFNUQsTUFBYSxHQUFHO0lBR1osSUFBVyxjQUFjO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsWUFBWSxXQUF5RDtRQVc3RCxxQkFBZ0IsR0FBRyxDQUFDLFFBQTRCLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtRQVE1RyxTQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0UsVUFBSyxHQUFHLENBQUMsR0FBRyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hGLFNBQUksR0FBRyxDQUFDLEdBQUcsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvRSxTQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEYsVUFBSyxHQUFHLENBQUMsR0FBRyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBdEJyRixJQUFJLFdBQVcsWUFBWSxNQUFNLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO1lBQ2xFLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1NBQzdDO2FBQ0ksSUFBSSxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7WUFDckMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUE7U0FDaEU7YUFBTTtZQUNILElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFBO1NBQ25DO0lBQ0wsQ0FBQztJQUlPLGlCQUFpQixDQUFDLFFBQWdCLEVBQUUsS0FBZSxFQUFFLEdBQUcsSUFBUztRQUNyRSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNoRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLElBQUEsY0FBTyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQzNIO0lBQ0wsQ0FBQztDQVFKO0FBaENELGtCQWdDQyJ9