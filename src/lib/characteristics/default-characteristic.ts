import type { Characteristic as CharacteristicClass, CharacteristicProps, Perms } from 'homebridge';

export default function defaultCharacteristic(Characteristic: typeof CharacteristicClass): typeof CharacteristicClass {
    return class DefaultCharacteristic extends Characteristic {
        constructor(
            displayName: string,
            UUID: string,
            props?: CharacteristicProps,
        ) {
            super(displayName, UUID, props!);
            this.setProps({
                format: 'string',
                perms: ['pr' as Perms, 'ev' as Perms],
                ...props,
            });
            this.value = this.getDefaultValue();
        }
    };
}
