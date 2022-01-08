/* eslint-disable @typescript-eslint/no-explicit-any */
    
export = {
    checkConfig(parameter: any, defaultValue: boolean): any {
        if (parameter && typeof parameter !== undefined) {
            return parameter as any;
        } else {
            return defaultValue;
        }
    },

    checkArrayConfig(parameter: any, defaultValue: any[]): any[] {
        if (parameter && typeof parameter !== undefined && Array.isArray(parameter)) {
            return parameter as any[];
        } else {
            return defaultValue;
        }
    },

    checkStringArrayConfig(parameter: any, defaultValue: string[]): string[] {
        if (parameter && typeof parameter !== undefined && Array.isArray(parameter) && parameter.every((value) => typeof value === 'string')) {
            return parameter as string[];
        } else {
            return defaultValue;
        }
    },

    checkStringConfig(parameter: any, defaultValue: string): string {
        if (parameter && typeof parameter !== undefined && typeof parameter === 'string') {
            return parameter as string;
        } else {
            return defaultValue;
        }
    },

    checkNumberConfig(parameter: any, defaultValue: number): number {
        if (parameter && typeof parameter !== undefined && typeof parameter === 'number') {
            return parameter as number;
        } else {
            return defaultValue;
        }
    },

    checkBooleanConfig(parameter: any, defaultValue: boolean): boolean {
        if (parameter && typeof parameter !== undefined && typeof parameter === 'boolean') {
            return parameter as boolean;
        } else if (typeof parameter !== undefined && typeof parameter === 'string') {
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