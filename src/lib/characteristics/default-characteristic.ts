import { Perms, Formats } from 'hap-nodejs';
import type { Characteristic as CharacteristicClass, CharacteristicProps } from 'homebridge';

export default function defaultCharacteristic(Characteristic: typeof CharacteristicClass): typeof CharacteristicClass {
    return class DefaultCharacteristic extends Characteristic {
        constructor(
            displayName: string,
            UUID: string,
            props?: CharacteristicProps,
        ) {
            super(displayName, UUID, props!);
            this.setProps({
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
                ...props,
            });
            this.value = this.getDefaultValue();
        }
    };
}