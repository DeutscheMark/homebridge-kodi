# Changelog

## 1.1.0

* New `power` switch accessory. It shows the current availability of your Kodi instance. You can optionally set `on` and `off` commands for your shell to start and stop Kodi in Windows, macOS and Linux, please see README for some examples on how to do that. These commands will also be used for the TV Controls accessory.
* With the new power capabilities all accessories now check if Kodi is running first and just reset their status to false if not, so they do only show possible errors only during the action the switches are performing.
* The video and audio library scan switches now correctly reflect the status of a scan in Kodi. The video and audio clean switches continue to work as usual and use the status change notifications from Kodi to determine their status.
* Use new `onGet` and `onSet` methods introduced with Homebridge v1.3.0.

## 1.0.1

**ATTENTION - ALL ACCESSORIES WILL BE RESET!**

* The plugin was completely rewritten in TypeScript.
* Attention: This is now a dynamic plugin so unfortunately all accessories will be reset upon start!
* No changes need to be made in the config file.
* TV accessories now need to be added as separate devices to support more than one remote control per homebridge instance and config.

## 0.4.0

* New command sequence accessories for `commands`: Add accessories to run command sequences in Kodi.
* Added `retrytime` to specify the time between connection retries when Kodi is not running or not found.
* Fixed not setting the audio and video library accessories to off on errors. [#15](https://github.com/DeutscheMark/homebridge-kodi/issues/15)
* Fixed setting the control tv accessory falsely to off when stopping the playback. [#16](https://github.com/DeutscheMark/homebridge-kodi/issues/16)
* Fixed playback seek with the player accessory with Kodi 19. [#17](https://github.com/DeutscheMark/homebridge-kodi/issues/17)
* Fixed setting the on/off status for tv controls. [#18](https://github.com/DeutscheMark/homebridge-kodi/issues/18)

## 0.3.3

* Setting a unique serial number for all accessories to fix problems with Eve v4.2. [homebridge/homebridge#2503](https://github.com/homebridge/homebridge/issues/2503)

## 0.3.2

* Added `player` > `main` for hiding the main light bulb accessory. [#13](https://github.com/DeutscheMark/homebridge-kodi/issues/13)

## 0.3.1

* Added support for Config UI X settings GUI.
* Fixed optional configuration parameters not being optional. [#9](https://github.com/DeutscheMark/homebridge-kodi/issues/9)

## 0.3.0

**ATTENTION - NEW CONFIGURATION NEEDED - PLEASE UPDATE BEFORE UPDATING!**

* New and changed configuration parameters. Please see [readme](https://github.com/DeutscheMark/homebridge-kodi/blob/master/README.md).
* New TV accessory `television` > `controls`: Add any menu items you want as inputs. Includes the TV Remote for controlling Kodi.
* New TV accessory `television` > `tv`: Add any TV channels you want as inputs. Includes the TV Remote for controlling Kodi.
* Fixes a bug when switching play and pause while automating. [#7](https://github.com/DeutscheMark/homebridge-kodi/issues/7)

## 0.2.2

* Playback of any video and audio is now supported (even web and live content e.g. YouTube).
* Audio library (`audioLibraryScan` & `audioLibraryClean`) is now supported.
* New `debug` config to enable/disable Logger.
* Non running Kodi's are now supported (accessories will all just be off).
* Fixed the warnings on startup.
* Much better error handling.
* Many many bugfixes for all available accessories.

## 0.1.4

* Fixed error messages when using minimal config.

## 0.1.3

* Fixed playerPause & playerStop & applicationVolume.

## 0.1.2

* Added support for movies.
* Fixed videoLibraryScan & videoLibraryClean.
* Added type as new information.
* Some small fixes for all informations.

## 0.1.1

* Fixed minimal requirements for node.js and homebridge.

## 0.1.0

* Initial Version with 7 available accessories (see README.md).
