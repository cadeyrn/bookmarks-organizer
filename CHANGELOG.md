# Firefox Add-on: Bookmarks Organizer (WebExtension)

## Release Notes

### (Work in Progress) Version 2.0.0 (2018-02-xx)

- **[ENHANCEMENT] the tracking protection feature of Firefox no longer causes that some working bookmarks are
  reported as broken!** That's why Bookmarks Organizer needs the permission to read and modify the privacy
  settings beginning with version 2.0.0, fixes [#26](https://github.com/cadeyrn/bookmarks-organizer/issues/26)
- **[ENHANCEMENT] second bookmark check via another request method was not always executed, caused that some
  working bookmarks were reported as broken. This does not happen anymore**, fixes
  [#36](https://github.com/cadeyrn/bookmarks-organizer/issues/36)
- [ENHANCEMENT] added a menu item to the tools menu to open the user interface, fixes
  [#65](https://github.com/cadeyrn/bookmarks-organizer/issues/65)
- [ENHANCEMENT] reduced file size of the logo, fixes [#66](https://github.com/cadeyrn/bookmarks-organizer/issues/66)
- **[BUGFIX] progress animation didn't stop after checking for duplicates**, fixes
  [#48](https://github.com/cadeyrn/bookmarks-organizer/issues/48)
- [BUGFIX] setting for disabling confirmation prompts did not work for duplicates check, fixes
  [#68](https://github.com/cadeyrn/bookmarks-organizer/issues/68)
- [BUGFIX] changed keyboard shortcut to Shift + F11 to fix a conflict with a built-in shortcut, fixes
  [#67](https://github.com/cadeyrn/bookmarks-organizer/issues/67)
- [TRANSLATION] added Spanish translation (Thanks, TarekJor!)
- [TRANSLATION] added Russian translation (Thanks, perdolka!)
- [TRANSLATION] added Ukrainian translation (Thanks, perdolka!)
- [CODE QUALITY] organized the script files in folders
- [DEPENDENCY] updated eslint from version 3.19.0 to 4.18.1 and updated configuration file
- [DEPENDENCY] updated eslint-plugin-compat from version 1.0.3 to 2.2.0
- [DEPENDENCY] updated eslint-plugin-no-unsanitized from version 2.0.1 to 3.0.0
- [DEPENDENCY] updated eslint-plugin-xss from version 0.1.8 to 0.1.9
- [DEPENDENCY] updated gulp-eslint from version 3.0.1 to 4.0.2
- [DEPENDENCY] updated gulp-html from version 0.0.1 to 0.0.2
- [DEPENDENCY] updated gulp-stylelint from version 3.9.0 to 6.0.0
- [DEPENDENCY] updated htmllint from version 0.6.0 to 0.7.2
- [DEPENDENCY] updated jsdoc from version 3.4.3 to 3.5.5
- [DEPENDENCY] updated npm-run-all from version 4.0.2 to 4.1.2
- [DEPENDENCY] updated stylelint from version 7.11.0 to 9.1.1 and updated configuration file
- [DEPENDENCY] updated stylelint-csstree-validator from version 1.1.1 to 1.2.2
- [DEPENDENCY] updated stylelint-order from version 0.5.0 to 0.8.1
- [DEPENDENCY] updated web-ext from version 1.9.1 to 2.4.0

**Minimum required Firefox version is Firefox 58 now.**

### Version 1.3.0 (2017-06-11)

- [ENHANCEMENT] new option to disable the confirmation dialogs (you can find it in the add-on's settings), fixes
  [#29](https://github.com/cadeyrn/bookmarks-organizer/issues/29)
- [ENHANCEMENT] make HEAD requests instead of GET requests for better performance and fall back to GET,
  fixes [#33](https://github.com/cadeyrn/bookmarks-organizer/issues/33)
- [DEPENDENCY] updated stylelint from version 7.10.1 to 7.11.0 and added new stylelint rule
- [DEPENDENCY] updated stylelint-order from version 0.4.4 to 0.5.0

### Version 1.2.0 (2017-06-03)

- [DESIGN] refreshed design, based on user feedback, including new logo, new header style and more compact header,
  fixes [#13](https://github.com/cadeyrn/bookmarks-organizer/issues/13),
  [#20](https://github.com/cadeyrn/bookmarks-organizer/issues/20),
  [#21](https://github.com/cadeyrn/bookmarks-organizer/issues/21) and
  [#22](https://github.com/cadeyrn/bookmarks-organizer/issues/22)
- [TRANSLATION] added French translation (Thanks, Primokorn!)
- [TRANSLATION] fixed typo in Polish translation (Thanks, WaldiPL!)
- [DEPENDENCY] updated eslint-plugin-no-unsanitized from version 2.0.0 to 2.0.1

**Thanks to [Ura Design](https://ura.design/) for the new logo!**

### Version 1.1.0 (2017-05-28)

- [ENHANCEMENT] preserve the hash for redirects, fixes [#24](https://github.com/cadeyrn/bookmarks-organizer/issues/24)
- [ENHANCEMENT] performance optimization for protocol check
- [TRANSLATION] added Chinese (simplified) translation (Thanks, yfdyh000!)
- [BUGFIX] when checking for bookmarks without a name for some users the default bookmark places were listed,
  fixes [#3](https://github.com/cadeyrn/bookmarks-organizer/issues/3)
- [BUGFIX] ignore old google groups urls in broken bookmark check because it's not possible to determine the correct
  redirect url for technical reasons, fixes [#25](https://github.com/cadeyrn/bookmarks-organizer/issues/25)
- [BUGFIX] don't get into a broken state if there are no bookmarks, fixes
  [#17](https://github.com/cadeyrn/bookmarks-organizer/issues/17)
- [BUGFIX] fixed broken debug setting, fixes [#27](https://github.com/cadeyrn/bookmarks-organizer/issues/27)
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
