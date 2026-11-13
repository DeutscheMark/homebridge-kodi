# Changelog

## 1.2.0

* Updated the plugin for current Homebridge and Node.js versions, with Kodi 21.3 support.

## 1.1.0

* Added a `power` switch accessory to show whether your Kodi instance is available. Optionally, set `on` and `off` shell commands to start and stop Kodi on Windows, macOS, or Linux. See the README for examples. These commands are also used by the TV Controls accessory.
* All accessories now check whether Kodi is running and reset their status when it is not. Errors are reported only when an accessory action fails.
* Video and audio library scan switches now correctly reflect the status of scans in Kodi. The cleanup switches continue to use Kodi status change notifications.
* Switched to the `onGet` and `onSet` methods introduced in Homebridge 1.3.0.

## 1.0.1

**Attention: All accessories will be reset.**

* Rewrote the plugin in TypeScript.
* This is now a dynamic plugin, so all accessories will be reset on startup.
* No configuration file changes are required.
* TV accessories must now be added as separate devices to support multiple remote controls per Homebridge instance and configuration.

## 0.4.0

* Added command sequence accessories for `commands`, allowing you to run command sequences in Kodi.
* Added `retrytime` to set the interval between connection attempts when Kodi is stopped or cannot be found.
* Fixed audio and video library accessories not turning off after errors. [#15](https://github.com/DeutscheMark/homebridge-kodi/issues/15)
* Fixed the TV Controls accessory incorrectly turning off when playback stops. [#16](https://github.com/DeutscheMark/homebridge-kodi/issues/16)
* Fixed playback seeking with the player accessory in Kodi 19. [#17](https://github.com/DeutscheMark/homebridge-kodi/issues/17)
* Fixed the on/off status of TV Controls. [#18](https://github.com/DeutscheMark/homebridge-kodi/issues/18)

## 0.3.3

* Set unique serial numbers for all accessories to fix issues with Eve 4.2. [homebridge/homebridge#2503](https://github.com/homebridge/homebridge/issues/2503)

## 0.3.2

* Added `player` > `main` to hide the main light bulb accessory. [#13](https://github.com/DeutscheMark/homebridge-kodi/issues/13)

## 0.3.1

* Added support for Config UI X settings GUI.
* Fixed optional configuration parameters not being treated as optional. [#9](https://github.com/DeutscheMark/homebridge-kodi/issues/9)

## 0.3.0

**Attention: A new configuration is required. Update your configuration before upgrading.**

* Added and changed configuration parameters. See the [README](https://github.com/DeutscheMark/homebridge-kodi/blob/master/README.md).
* Added the `television` > `controls` TV accessory. Add menu items as inputs; it includes a TV remote for controlling Kodi.
* Added the `television` > `tv` TV accessory. Add TV channels as inputs; it includes a TV remote for controlling Kodi.
* Fixed a bug that occurred when switching between play and pause during automation. [#7](https://github.com/DeutscheMark/homebridge-kodi/issues/7)

## 0.2.2

* Added support for all video and audio playback, including web and live content such as YouTube.
* Added support for the audio library (`audioLibraryScan` and `audioLibraryClean`).
* Added the `debug` option to enable or disable logging.
* Added support for stopped Kodi instances; all accessories remain off.
* Fixed startup warnings.
* Improved error handling.
* Fixed many issues across the accessories.

## 0.1.4

* Fixed error messages when using a minimal configuration.

## 0.1.3

* Fixed `playerPause`, `playerStop`, and `applicationVolume`.

## 0.1.2

* Added support for movies.
* Fixed `videoLibraryScan` and `videoLibraryClean`.
* Added the media type to the item information.
* Made several small fixes to item information.

## 0.1.1

* Fixed the minimum requirements for Node.js and Homebridge.

## 0.1.0

* Initial version with seven available accessories (see README.md).
