# Changelog

## 0.3.3

**ATTENTION - NEW CONFIGURATION NEEDED - PLEASE UPDATE BEFORE UPDATING FROM 0.2.x!**

* Setting a unique serial number for all accessories to fix problems with Eve v4.2. [homebridge/homebridge#2503](https://github.com/homebridge/homebridge/issues/2503).

## 0.3.2

**ATTENTION - NEW CONFIGURATION NEEDED - PLEASE UPDATE BEFORE UPDATING FROM 0.2.x!**

* Added `player` > `main` for hiding the main light bulb accessory. [#13](https://github.com/DeutscheMark/homebridge-kodi/issues/13)

## 0.3.1

**ATTENTION - NEW CONFIGURATION NEEDED - PLEASE UPDATE BEFORE UPDATING FROM 0.2.x!**

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
* New `debug` config to enable/disable logging.
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
