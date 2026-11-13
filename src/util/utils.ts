/* eslint-disable @typescript-eslint/no-explicit-any */
    
export = {
    checkConfig(parameter: any, defaultValue: boolean): any {
        if (parameter !== undefined && parameter !== null) {
            return parameter as any;
        } else {
            return defaultValue;
        }
    },

    checkArrayConfig(parameter: any, defaultValue: any[]): any[] {
        if (Array.isArray(parameter)) {
            return parameter as any[];
        } else {
            return defaultValue;
        }
    },

    checkStringArrayConfig(parameter: any, defaultValue: string[]): string[] {
        if (Array.isArray(parameter) && parameter.every((value) => typeof value === 'string')) {
            return parameter as string[];
        } else {
            return defaultValue;
        }
    },

    checkStringConfig(parameter: any, defaultValue: string): string {
        if (typeof parameter === 'string' && parameter.length > 0) {
            return parameter as string;
        } else {
            return defaultValue;
        }
    },

    checkNumberConfig(parameter: any, defaultValue: number): number {
        if (typeof parameter === 'number' && Number.isFinite(parameter)) {
            return parameter as number;
        } else {
            return defaultValue;
        }
    },

    checkBooleanConfig(parameter: any, defaultValue: boolean): boolean {
        if (typeof parameter === 'boolean') {
            return parameter as boolean;
        } else if (typeof parameter === 'string') {
            switch (parameter.toLowerCase().trim()) {
                case 'true':
                case 'yes':
                    return true;
                case 'false':
                case 'no':
                case null:
                    return false;
                default:
                    return false;
            }
        } else {
            return defaultValue;
        }
    },
}
