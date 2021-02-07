<p align="center">
    <img src= "https://user-images.githubusercontent.com/7172176/70864582-aa695d80-1f53-11ea-8b7b-0ebcb567ed7a.png" alt="Homebridge-Kodi-Logo" height="200px" />
</p>

# Homebridge Kodi

## homebridge-kodi

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple?style=flat-square)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

![npm](https://img.shields.io/npm/v/homebridge-kodi?color=green&style=flat-square)
![npm](https://img.shields.io/npm/dw/homebridge-kodi?color=success&style=flat-square)
![npm](https://img.shields.io/npm/dt/homebridge-kodi?color=success&style=flat-square)
[![PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=flat-square)](https://www.paypal.me/DeutscheMark/5)

![Kodi](https://img.shields.io/badge/Minimum%20Kodi%20Version-12.0%20(Frodo)-orange?style=flat-square)
![Kodi](https://img.shields.io/badge/Latest%20Kodi%20Version-19.0%20(Matrix)-yellow?style=flat-square)

### Control [Kodi](https://kodi.tv) with HomeKit and [Homebridge](https://github.com/nfarina/homebridge)

This is a plugin for [Homebridge](https://github.com/nfarina/homebridge) that features controls and information about any running [Kodi](https://kodi.tv) in your network.
You can download it via [npm](https://www.npmjs.com/package/homebridge-kodi).

Feel free to leave any feedback or suggested features [here](https://github.com/naofireblade/homebridge-homebridge-kodi/issues).

## Features

- Get TV accessories for controlling the menus in Kodi and watching TV channels.
- Get a remote control for the Kodi GUI with every configured TV accessory.
- Get controls for Kodi Player including Play, Pause, Seek, Stop and Audio/Video Library Scan and Clean
- Set the volume of Kodi
- See Information about the current playing show, season, episode, title, artist, album and type in the Eve App
- See Information about the current playing item's current time, total time and the percentage played in the Eve App
- Supported playing items in Kodi are movies, TV shows, TV, radio, music and music videos

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

### Example Config

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
            "retrytime": 30,
            "debug": true,
            "television": {
                "controls": {
                    "menuitems": [
                        "home",
                        "settings",
                        "movies",
                        "tvshows",
                        "tv",
                        "music",
                        "musicvideos",
                        "radio",
                        "games",
                        "addons",
                        "pictures",
                        "videos",
                        "favorites",
                        "weather"
                    ]
                },
                "tv": {
                    "channels": [
                        "Das Erste HD",
                        "ZDF HD",
                        "RTL",
                        "SAT.1",
                        "VOX",
                        "kabel eins",
                        "ProSieben",
                        "RTL II"
                    ]
                }
            },
            "player": {
                "main": true,
                "play": true,
                "pause": true,
                "stop": true
            },
            "application": {
                "volume": true
            },
            "videolibrary": {
                "scan": true,
                "clean": true
            },
            "audiolibrary": {
                "scan": true,
                "clean": true
            },
            "commands": [
                {
                    "name": "Play Star Wars",
                    "interval": 500,
                    "sequence": [
                        "home",
                        "pageup",
                        "up",
                        "right",
                        "right",
                        "select",
                        "select",
                        "sendtext:star wars",
                        "select",
                        "select",
                        "select"
                    ]
                },
                {
                    "name": "Open YouTube Add-on",
                    "interval": 500,
                    "sequence": [
                        "home",
                        "pageup",
                        "up",
                        "right",
                        "right",
                        "select",
                        "down",
                        "select",
                        "sendtext:youtube",
                        "select",
                        "select"
                    ]
                },
                {
                    "name": "Next Chapter",
                    "interval": 500,
                    "sequence": [
                        "executeaction:chapterorbigstepforward"
                    ]
                }
            ]
        }
]
```

### Settings

- `name` is the name of the Kodi instance, optional, default "Kodi"
- `host` is the IP address or hostname of the Kodi instance, optional, default "localhost"
- `port` is the port set for the Kodi remote control, optional, default "8080"
- `username` is the username set for the Kodi remote control, optional, default "kodi"
- `password` is the password set for the Kodi remote control, optional, default "kodi"
- `polling` is the polling rate in seconds for updating all accessories when playing, optional, default 10
- `retrytime` is the time in seconds to retry when the Kodi instance is stopped or not found, optional, default 30
- `debug` enables Logger for all events and status updates, default false
- `television` > `controls` is a TV accessory for changing the current menu in Kodi, it also enables remote control in iOS/iPadOS for controlling the GUI, optional, default false
- `television` > `controls` > `menuitems` is an array of menu items that can be opened in Kodi. See example config for all available menu items
- `television` > `tv` is a TV accessory for watching TV in Kodi, it also enables remote control in iOS/iPadOS for controlling the GUI, optional, default false
- `television` > `tv` > `channels` is an array of TV channels that can be switched to in Kodi. Channel names must be exactly the same as in Kodi for them to work
- `player` > `main` is the main lightbulb accessory of this plugin for controlling the playback in Kodi, shows extra information of the playing item in Eve, optional, default true
- `player` > `play` is an alternative switch for controlling the playback in Kodi, optional, default false
- `player` > `pause` is a switch for pausing the current playback in Kodi, optional, default false
- `player` > `stop` is a switch for stopping the current playback in Kodi, optional, default false
- `application` > `volume` is a light bulb for controlling the volume in Kodi and controlling the current volume via a brightness slider, optional, default false
- `videolibrary` > `scan` is a switch for starting a scanning of the video library in Kodi, optional, default false
- `videolibrary` > `clean` is a switch for starting a cleaning of the video library in Kodi, optional, default false
- `audiolibrary` > `scan` is a switch for starting a scanning of the audio library in Kodi, optional, default false
- `audiolibrary` > `clean` is a switch for starting a cleaning of the audio library in Kodi, optional, default false
- `commands` is a list of switches for user defined sequences of commands sent to Kodi
- `commands` > `name` is the name of the switch for the user defined sequence of commands
- `commands` > `interval` is the number of milliseconds between each command to wait, optional, default 500
- `commands` > `sequence` is the sequence of commands sent to Kodi as array, see supported commands below

## Supported Commands

A variety of commands are supported: First and foremost all available inputs in Kodi and all actions that can be executed.

Here is a list of all supported commands to date and how to use them:

| Command | What does it do and how to use it? |
|---------|------------------|
| *home* | Goes to home window in GUI |
| *down* | Navigate down in GUI |
| *up* | Navigate up in GUI |
| *left* | Navigate left in GUI |
| *right* | Navigate right in GUI |
| *select* | Select current item in GUI |
| *back* | Goes back in GUI |
| *info* | Shows the information dialog |
| *contextmenu* | Shows the context menu |
| *showcodec* | Show codec information of the playing item | |
| *showosd* | Show the on-screen display for the current player | |
| *sendtext* | Send a generic (unicode) text.<br>Just add the text you want to send, e.g. *"sendtext:Game of Thrones"* |
| *executeaction* | Execute a specific action<br>Just add the action you want to perform, e.g. *"executeaction:smallstepback".*<br>You can find all the possible actions [here](https://kodi.wiki/view/JSON-RPC_API/v12#Input.Action) (Expand *JSON Schema Description* under *6.10.1*). |

## Known Problems

- This plugin is a dynamic platform so please only add one platform of Homebridge-Kodi per instance and config. As of right now it only supports one running Kodi instance. This feature might be added in a future update.
- Library scan & clean: Though the current scan/clean status is displayed and saved in HomeKit, it can't get the current status from Kodi. It can only get status changes (when this plugin and Kodi are running at the same time). So there's no guarantee it always shows the right status. Also the switches cannot abort the currently running scan/clean when setting them to off. The API is missing some of those features unfortunately but it should still work pretty well.
- Only internal players are supported right now.

## Contributors

Many thanks go to

- [Kodi-Team](https://kodi.tv) for their excellent work on Kodi and their JSON-RPC-API that makes this plugin possible
- [SmartApfel - HomeKit Community](necessary) for their interest in smart home accessories and their motivation to develop and test great homebridge plugins
- [naofireblade](https://github.com/naofireblade) for his plugins, e.g. homebridge-weather-plus that helped me personally developing this plugin
- [elpheria](https://github.com/elpheria) for their rpc-websockets library (the only working one I found to support notifications with the Kodi JSON-RPC-API that are needed to get aware of changes in Kodi outside from homebridge, e.g. from remote controls)

## Attribution

- Powered by [Kodi](https://kodi.tv)

