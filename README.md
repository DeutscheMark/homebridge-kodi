# homebridge-kodi
Control any Kodi with HomeKit and Homebridge: https://github.com/nfarina/homebridge

![GitHub release (latest by date)](https://img.shields.io/github/v/release/DeutscheMark/homebridge-kodi?style=flat-square)
![GitHub Release Date](https://img.shields.io/github/release-date/DeutscheMark/homebridge-kodi?style=flat-square)
![npm](https://img.shields.io/npm/dt/homebridge-kodi?style=flat-square)
![GitHub](https://img.shields.io/github/license/DeutscheMark/homebridge-kodi?style=flat-square)

![node](https://img.shields.io/node/v/homebridge-kodi?style=flat-square)
![homebridge](https://img.shields.io/badge/homebridge->=0.4.50-green?style=flat-squared)
![Kodi](https://img.shields.io/badge/Minimum%20Kodi%20Version-12.0%20(Frodo)-informational?style=flat-squared)
![Kodi](https://img.shields.io/badge/Latest%20Kodi%20Version-18.4%20(Leia)-informational?style=flat-squared)

<img src= "https://user-images.githubusercontent.com/19808920/58770949-bd9c7900-857f-11e9-8558-5dfaffddffda.png" alt="Homebridge-Logo" width="150"><img src="https://upload.wikimedia.org/wikipedia/commons/2/25/Kodi-logo-Thumbnail-light-transparent.png" alt="Kodi-Logo" width="150">

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) that features controls and information about any running [Kodi](https://kodi.tv) in your network.
You can download it via [npm](https://www.npmjs.com/package/homebridge-kodi).

Feel free to leave any feedback or suggested features [here](https://github.com/naofireblade/homebridge-homebridge-kodi/issues).

## Features
- Get controls for Kodi Player Play, Pause, Seek, Stop and Video Library Scan and Clean (Music Library not yet supported) and Volume
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

By default a lightbulb accessory for controlling the current playback (on/off for Play/Pause and brightness for Seek) and getting information (e.g. in Eve) of the current playing item is exposed. This is the main accessory of this plugin but you can enable additional accessories in your config.

Below is an example for all available parameters and accessories of this plugin.

```json
"platforms": [
    {
        "platform": "Kodi",
        "name": "Kodi",
        "host": "192.168.2.100",
        "port": "8080",
        "username": "kodi",
        "password": "kodi",
        "polling": 10,
        "playerPlay": true,
        "playerStop": true,
        "applicationVolume": true,
        "videoLibraryScan": true,
        "videoLibraryClean": true
    }
]
```

* `name` is the name of the Kodi instance, optional, default "Kodi"
* `host` is the host or IP of the Kodi instance, optional, default "localhost"
* `port` is the port set for the Kodi remote control, optional, default "8080"
* `username` is the username set for the Kodi remote control, optional, default "kodi"
* `password` is the password set for the Kodi remote control, optional, default "kodi"
* `polling` is the polling rate in seconds for updating all accessories, optional, default 10
* `playerPlay` is an alternative switch for controlling the playback in Kodi, optional, default false
* `playerPause` is a switch for pausing the current playback in Kodi, optional, default false
* `playerStop` is a switch for stopping the current playback in Kodi, optional, default false
* `applicationVolume` is a light bulb for controlling the volume in Kodi and controlling the current volume via a brightness slider, optional, default false
* `videoLibraryScan` is a switch for starting a scanning of the video library in Kodi, optional, default false
* `videoLibraryClean` is a switch for starting a cleaning of the video library in Kodi, optional, default false

## Known Problems

The development of this plugin is in an very early stage. Only use it if you are aware of what you are doing. A wrong configuration can lead to crash of the whole homebridge.

- Only running Kodis are supported: If the Kodi that you configured is not running a lot of error logs could be written when reading the accessories in your app. Error handling is work in progress.
- Multiple running Kodis are support, but multiple platform configs are necessary: In this early stage of development you can use multipe running Kodis but you need to have multiple Kodi Platforms configured in your config file. That certainly changes in a future version of the plugin so that only one platform is needed.
- Only Video Player and Video Library is supported: If you use Kodi for Music or other this plugin is not yet for you. But stay tuned.
- Bad logging: Right now any changes and informational updates are written to the logs. Therefor you might end up with large logs if you configure a low polling rate like every 1 second though it's of course possible.
- videoLibraryScan does not abort the scanning when currently scanning and setting the switch to off. The API is missing this feature unfortunately.
- videoLibraryClean does not abort the cleaning when currently cleaning and setting the switch to off. The API is missing this feature unfortunately.

## Contributors
Many thanks go to
- [Kodi-Team](https://kodi.tv) for their excellent work on Kodi and their JSON-RPC-API that makes this plugin possible
- [SmartApfel - HomeKit Community](necessary) for their interest in Smart Home Accessories and their motivation to develop and test great homebridge plugins
- [naofireblade](https://github.com/naofireblade) for his plugins, e.g. homebridge-weather-plus that helped me personally  developing this plugin
- [elpheria](https://github.com/elpheria) for their rpc-websockets library (the only working one I found to support notifications with the Kodi JSON-RPC-API that are needed to get aware of changes in Kodi outside from homebridge, e.g. from remote controls)

## Attribution
- [Powered by Kodi](https://kodi.tv)
