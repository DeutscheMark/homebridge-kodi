import { API } from 'homebridge';

import { PLATFORM_NAME, KodiPlatform } from './internal';

export = (api: API) => {
    api.registerPlatform(PLATFORM_NAME, KodiPlatform);
}