import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function type(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Type extends DefaultCharacteristic {
        static readonly UUID = '3deb7456-5196-497e-8f4e-efc455516c96';

        constructor() {
            super('Type', Type.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}