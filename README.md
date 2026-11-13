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
![Kodi](https://img.shields.io/badge/Latest%20Supported%20Kodi%20Version-21.3%20(Omega)-yellow?style=flat-square)

### Control [Kodi](https://kodi.tv) with HomeKit and [Homebridge](https://github.com/nfarina/homebridge)

This is a plugin for [Homebridge](https://github.com/nfarina/homebridge) that features controls and information about any running [Kodi](https://kodi.tv) in your network.
You can download it via [npm](https://www.npmjs.com/package/homebridge-kodi).

Feel free to leave feedback or suggest a feature [here](https://github.com/DeutscheMark/homebridge-kodi/issues).

## Features

- Get TV accessories for controlling the menus in Kodi and watching TV channels.
- Get a remote control for the Kodi GUI with every configured TV accessory.
- Get controls for the Kodi player, including play, pause, seek, stop, and audio and video library scans and cleanup.
- Set the volume of Kodi
- See information about the currently playing item's show, season, episode, title, artist, album, and media type in the Eve app.
- See the current playback time, total duration, and playback percentage in the Eve app.
- Supported Kodi media types include movies, TV shows, live TV, radio, music, and music videos.

## Kodi Preparations

To use this plugin, first enable **Allow remote control via HTTP** in Kodi.

You can find a detailed tutorial on how to enable the Kodi *remote control via HTTP* [here](https://www.addictivetips.com/media-streaming/kodi/control-kodi-internet-web-interface/).

## Installation

1. Install homebridge using: `npm install -g homebridge`.
2. Install this plugin using: `npm install -g homebridge-kodi`.
3. Allow *remote control via HTTP* in Kodi.
4. Update your configuration file. See the example below.

## Configuration

By default, the plugin exposes a light bulb accessory for controlling playback (on/off for play/pause and brightness for seeking) and viewing information about the current item in apps such as Eve. This is the plugin's main accessory; you can enable additional accessories in the configuration.

### Example Config

The example below includes all available configuration options and accessories.

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
            "power": {
                "on": "service kodi start",
                "off": "service kodi stop"
            },
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

- `name` is the prefix used for all accessories, **optional**, **default: "Kodi"**
- `host` is the IP address or hostname of the Kodi instance, **optional**, **default: "localhost"**
- `port` is the port used for Kodi's *remote control via HTTP*, **optional**, **default: "8080"**
- `username` is the username for Kodi's *remote control via HTTP*, **optional**, **default: "kodi"**
- `password` is the password for Kodi's *remote control via HTTP*, **optional**, **default: "kodi"**
- `polling` is the polling interval, in seconds, for updating accessories during playback, **optional**, **default: 10**
- `retrytime` is the retry interval, in seconds, when Kodi is stopped or cannot be found, **optional**, **default: 30**
- `debug` enables logging for all events and status updates, **optional**, **default: false**
- `television` > `controls` enables a TV accessory for navigating Kodi menus. It is active when Kodi is running and also provides an iOS/iPadOS remote for controlling the Kodi GUI, **optional**, **default: inactive**
- `television` > `controls` > `menuitems` is an array of Kodi menu items that can be opened. See the example configuration for the available options.
- `television` > `tv` enables a TV accessory for watching TV in Kodi. It is active while a TV channel is playing and also provides an iOS/iPadOS remote for controlling the Kodi GUI, **optional**, **default: inactive**
- `television` > `tv` > `channels` is a list of TV channels that can be selected in Kodi. Channel names must exactly match their names in Kodi.
- `power` > `switch` is a switch for starting and stopping the Kodi instance, **default true**
- `power` > `on` is the shell command used to start Kodi. It is used by the power switch and TV Controls accessory, **optional**
- `power` > `off` is the shell command used to stop Kodi. It is used by the power switch and TV Controls accessory, **optional**
- `player` > `main` enables the main light bulb accessory for controlling playback and viewing information about the current item in Eve, **optional**, **default: true**
- `player` > `play` enables an alternative switch for controlling playback, **optional**, **default: false**
- `player` > `pause` enables a switch for pausing playback, **optional**, **default: false**
- `player` > `stop` enables a switch for stopping playback, **optional**, **default: false**
- `application` > `volume` enables a light bulb for controlling Kodi's volume with a brightness slider, **optional**, **default: false**
- `videolibrary` > `scan` enables a switch for scanning the video library, **optional**, **default: false**
- `videolibrary` > `clean` enables a switch for cleaning the video library, **optional**, **default: false**
- `audiolibrary` > `scan` enables a switch for scanning the audio library, **optional**, **default: false**
- `audiolibrary` > `clean` enables a switch for cleaning the audio library, **optional**, **default: false**
- `commands` is a list of switches for running user-defined command sequences in Kodi, **optional**
- `commands` > `name` is the name of the switch for a command sequence.
- `commands` > `interval` is the delay, in milliseconds, between commands, **optional**, **default: 500**
- `commands` > `sequence` is the list of commands to send to Kodi. See the supported commands below.

## Power on / off

This works on any operating system where shell commands can start and stop applications, including Windows, macOS, and Linux (for example, on a Raspberry Pi).

### Examples for some operating systems

| OS | On Shell Command | Off Shell Command | When to use them? |
|---|---|---|---|
| Windows | `start /b "Kodi" "C:\Program Files\Kodi\kodi.exe"` | `taskkill /im kodi.exe` | Installed using the setup file |
| macOS | `open -a Kodi` | `killall Kodi` | Installed in the Applications folder |
| Linux | `kodi &` | `killall kodi` | Installed using apt |
| Linux | `service kodi start` | `service kodi stop` | Installed as a systemd service |

The exact commands depend on where and how you installed Kodi. These commands do not work on Apple TV, iPhone, or iPad. On those devices, you can use HomeKit automations to start Kodi after turning it on with this plugin. Turning Kodi off is not currently supported on those devices.

## Supported Commands

A variety of commands is supported, including all available Kodi inputs and executable actions.

Here is a list of all supported commands to date and how to use them:

| Command | What does it do and how to use it? |
|---------|------------------------------------|
| *home* | Goes to home window in GUI |
| *down* | Navigate down in GUI |
| *up* | Navigate up in GUI |
| *left* | Navigate left in GUI |
| *right* | Navigate right in GUI |
| *select* | Select current item in GUI |
| *back* | Goes back in GUI |
| *info* | Shows the information dialog |
| *contextmenu* | Shows the context menu |
| *showcodec* | Shows codec information for the playing item |
| *showosd* | Shows the on-screen display for the current player |
| *sendtext* | Sends Unicode text.<br>Add the text to send, for example, *"sendtext:Game of Thrones"*. |
| *executeaction* | Executes a specific action.<br>Add the action to perform, for example, *"executeaction:smallstepback"*.<br>See the available actions [here](https://kodi.wiki/view/JSON-RPC_API/v12#Input.Action) (expand *JSON Schema Description* under *6.10.1*). |

## Known Problems

- This plugin is a dynamic platform, so add only one Homebridge-Kodi platform per Homebridge instance and configuration. It currently supports one running Kodi instance.
- If you rename or add an input (a control or channel) to a TV accessory, or change the `name`, delete the TV accessory first. Otherwise, the input may appear as a new accessory inside the TV accessory.
- Library scan/cleanup switches cannot stop a scan or cleanup already in progress. Kodi reports scan status, and this plugin receives status changes while both Kodi and Homebridge are running. Kodi's API does not report cleanup status, so HomeKit may not always show the correct cleanup state.
- Only Kodi's internal players are currently supported.

- Play/pause controls may not work correctly for music.

## Contributors

Many thanks to:

- [Kodi-Team](https://kodi.tv) for their excellent work on Kodi and their JSON-RPC-API that makes this plugin possible
- [SmartApfel - HomeKit Community](https://smartapfel.de) for their interest in smart home accessories and their motivation to develop and test Homebridge plugins
- [naofireblade](https://github.com/naofireblade) for his plugins, e.g. homebridge-weather-plus that helped me personally developing this plugin
- [elpheria](https://github.com/elpheria) for the `rpc-websockets` library, which supports the Kodi JSON-RPC notifications this plugin uses to detect changes made outside Homebridge, such as with a remote control.

## Attribution

- Powered by [Homebridge](https://homebridge.io) and [Kodi](https://kodi.tv).
