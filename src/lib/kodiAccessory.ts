import { PlatformAccessory, PlatformConfig } from 'homebridge';

import { KodiPlatform, KodiLogger } from '../internal';

export abstract class KodiAccessory { }
export abstract class KodiCommandAccessory { }
export abstract class KodiTelevisionAccessory { }

export interface KodiSwitchAccessoryInterface {
    new(
        platform: KodiPlatform,
        accessory: PlatformAccessory,
        log: KodiLogger,
        config: PlatformConfig,
        name: string,
        version: string,
    ): KodiAccessory;
}
export interface KodiCommandSwitchAccessoryInterface {
    new(
        platform: KodiPlatform,
        accessory: PlatformAccessory,
        log: KodiLogger,
        config: PlatformConfig,
        name: string,
        version: string,
        interval: number,
        sequence: string,
    ): KodiCommandAccessory;
}
export interface KodiTelevisionAccessoryInterface {
    new(
        platform: KodiPlatform,
        accessory: PlatformAccessory,
        log: KodiLogger,
        config: PlatformConfig,
        name: string,
        version: string,
        type: TelevisionAccessoryType,
        inputNames: string[],
        inputIdentifiers: number[],
    ): KodiTelevisionAccessory;
}

export enum TelevisionAccessoryType {
    Controls = 'Controls',
    Channels = 'Channels'
}