# Firefox Add-on: Bookmarks Organizer (WebExtension)

## Release Notes

### Version 1.1.0 (2017-05-28)

- [ENHANCEMENT] preserve the hash for redirects, fixes #24
- [ENHANCEMENT] performance optimization for protocol check
- [TRANSLATION] added Chinese (simplified) translation (Thanks, yfdyh000!)
- [BUGFIX] when checking for bookmarks without a name for some users the default bookmark places were listed,
  fixes #3
- [BUGFIX] ignore old google groups urls in broken bookmark check because it's not possible to determine the correct
  redirect url for technical reasons, fixes #25
- [BUGFIX] don't get into a broken state if there are no bookmarks, fixes #17
- [BUGFIX] fixed broken debug setting, fixes #27
- [DEPENDENCY] updated eslint-plugin-compat from version 1.0.2 to 1.0.3

### Version 1.0.6 (2017-05-20)

- [BUGFIX] reverted "removed not needed permission from manifest"

### Version 1.0.5 (2017-05-13)

- [ENHANCEMENT] removed not needed permission from manifest
- [DESIGN] use Mozilla's new Zilla font for the logo

### Version 1.0.4 (2017-05-10)

- [TRANSLATION] added Czech translation (Thanks, MekliCZ!)
- [TRANSLATION] added Polish translation (Thanks, WaldiPL!)
- [BUGFIX] Code, which recognizes bookmarks and immediately updates the number of bookmarks, temporarily disabled due
  to a bug in Firefox (#1362863)
- [CODE QUALITY] added no-unsanitized plugin for ESLint

### Version 1.0.3 (2017-05-04)

- [BUGFIX] when deleting a bookmark, two bookmarks were subtracted from the total number of bookmarks
- [DEPENDENCY] updated web-ext from version 1.9.0 to 1.9.1
- [DEPENDENCY] updated stylelint-order from version 0.4.3 to 0.4.4 

### Version 1.0.2 (2017-05-01)

- [CODE QUALITY] added code documentation
- [DEPENDENCY] updated web-ext from version 1.8.1 to 1.9.0

### Version 1.0.1 (2017-04-19)

- initial release for [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

**Features of the first version**

- finds no longer working bookmarks
- finds duplicate bookmarks
- finds bookmarks without name
- broken bookmarks can be edited or deleted
- detects redirects and offers the automatic correction of individual or all redirects
- open the interface by keyboard  (Ctrl + Shift + L, macOS: Cmd + Shift + L)
- direct start of individual tests via address bar (see [README](README.md "README"))
- translations: English, German, Dutch, Upper Sorbian, Lower Sorbian
