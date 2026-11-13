import type { Characteristic, Perms, WithUUID } from 'homebridge';

export default function type(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Type extends DefaultCharacteristic {
        static readonly UUID = '3deb7456-5196-497e-8f4e-efc455516c96';

        constructor() {
            super('Type', Type.UUID, {
                format: 'string',
                perms: ['pr' as Perms, 'ev' as Perms],
            });
        }
    };
}
