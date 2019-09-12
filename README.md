# homebridge-kodi
Control any Kodi with HomeKit and Homebridge: https://github.com/nfarina/homebridge

![GitHub release (latest by date)](https://img.shields.io/github/v/release/DeutscheMark/homebridge-kodi?style=flat-square)
![GitHub Release Date](https://img.shields.io/github/release-date/DeutscheMark/homebridge-kodi?style=flat-square)
![GitHub](https://img.shields.io/github/license/DeutscheMark/homebridge-kodi?style=flat-square)
![node](https://img.shields.io/node/v/homebridge-kodi?style=flat-square)
![NPM](https://img.shields.io/npm/l/homebridge-kodi?style=flat-square)
![npm](https://img.shields.io/npm/dt/homebridge-kodi?style=flat-square)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/DeutscheMark/homebridge-kodi?style=flat-square)
![Kodi](https://img.shields.io/badge/Minimum%20Kodi%20Version-%5E16-important?style=flat-squared)

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) that features controls and information about any running [Kodi](https://kodi.tv) in your network.
You can download it via [npm](https://www.npmjs.com/package/homebridge-kodi).

Feel free to leave any feedback or suggested features [here](https://github.com/naofireblade/homebridge-homebridge-kodi/issues).

## Features
- Get controls for Kodi Player Play/Pause, Seek, Stop and Video Library Scan and Clean (Music Library not yet supported)
- You can add more than one platform to support more running Kodi instances (just give them a different name)
- See Information about the current playing show, season, episode and title in the Eve App (movies are not yet fully supported)
- See Information about the current playing item's time, totalTime and percentage Played (as brightness) in the Eve App (movies are not yet fully supported)

## Kodi Preparations

In order to use this plugin you have to enable **Allow remote control via HTTP** in Kodi first.

You can find a detailed tutorial on how to enable remote access in Kodi [here](https://www.addictivetips.com/media-streaming/kodi/control-kodi-internet-web-interface/).

## Installation

1. Install homebridge using: `npm install -g homebridge`.
2. Install this plugin using: `npm install -g homebridge-kodi`.
3. Allow remote control via HTTP in Kodi.
4. Update your configuration file. See the example below.

## Configuration

Below is an example for all available parameters of this plugin.

```json
"platforms": [
    {
        "platform": "Kodi",
        "name": "Kodi", // Optional - Default: "Kodi"
        "host": "192.168.2.100", // IP or Host - Optional - Default: "localhost"
        "port": "8080", // Optional - Default: "8080"
        "username": "kodi", // Optional - Default: "kodi"
        "password": "kodi", // Optional - Default: "kodi"
        "polling": 1, // In seconds - Optional - Default: 10
        "playerPlayPause": true, // Switch for Player Play/Pause - Optional - Default: true
        "playerSeek": true, // Lightbulb for Player Seek - Optional - Default: true
        "playerStop": true, // Switch for Player Stop - Optional - Default: true
        "applicationVolume": true, // Switch for Application Volume - Optional - Default: true
        "videoLibraryScan": true, // Switch for Video Library Scan - Optional - Default: true
        "videoLibraryClean": true // Switch for Video Library Clean - Optional - Default: true
    }
]
```

## Known Problems

The development of this plugin is in an very early stage. Only use it if you are aware of what you are doing. A wrong configuration can lead to crash of the whole homebridge.

- Only running Kodis are supported: If the Kodi that you configured is not running a lot of error logs could be written when reading the accessories in your app. Error handling is work in progress.
- Multiple running Kodis are support, but multiple platform configs are necessary: In this early stage of development you can use multipe running Kodis but you need to have multiple Kodi Platforms configured in your config file. That certainly changes in a future version of the plugin so that only one platform is needed.
- Only Video Player and Video Library is supported: If you use Kodi for Music or other TV this plugin is not yet for you.
- Bad logging: Right now any changes and informational updates are written to the logs. Therefor you might end up with large logs if you configure a low polling rate like every 1 second though it's of course possible.

## Contributors
Many thanks go to
- [Kodi-Team](https://kodi.tv) for their excellent work on Kodi and their JSON-RPC-API that makes this plugin possible
- [SmartApfel - HomeKit Community](necessary) for their interest in Smart Home Accessories and their motivation to develop and test great homebridge plugins
- [naofireblade](https://github.com/naofireblade) for his plugins, e.g. homebridge-weather-plus that helped me personally  developing this plugin
- [elpheria](https://github.com/elpheria) for their rpc-websockets library (the only working one I found to support notifications with the Kodi JSON-RPC-API that are needed to get aware of changes in Kodi outside from homebridge, e.g. from remote controls)

## Attribution
- [Powered by Kodi](https://kodi.tv)
