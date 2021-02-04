import { Logger } from 'homebridge';

export class KodiLogger {

    private logger: Logger;
    private debugMode: boolean;

    constructor(logger: Logger, debugMode: boolean) {
        this.logger = logger;
        this.debugMode = debugMode;
    }

    debug(msg: string, ...parameters: any[]) {
        if (this.debugMode) {
            if (parameters.length > 0) {
                this.logger.info(msg, parameters);
            } else {
                this.logger.info(msg);
            }
        } else {
            if (parameters.length > 0) {
                this.logger.debug(msg, parameters);
            } else {
                this.logger.debug(msg);
            }
        }
    }

    info(msg: string, ...parameters: any[]) {
        if (parameters.length > 0) {
            this.logger.info(msg, parameters);
        } else {
            this.logger.info(msg);
        }
    }

    warn(msg: string, ...parameters: any[]) {
        if (parameters.length > 0) {
            this.logger.warn(msg, parameters);
        } else {
            this.logger.warn(msg);
        }
    }

    error(msg: string, ...parameters: any[]) {
        if (parameters.length > 0) {
            this.logger.error(msg, parameters);
        } else {
            this.logger.error(msg);
        }
    }

}