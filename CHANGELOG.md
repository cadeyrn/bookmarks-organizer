# Firefox Add-on: Bookmarks Organizer (WebExtension)

## Release Notes

### (Work in Progress) Version 2.0.0 (2018-02-xx)

#### Enhancements

- **the tracking protection feature of Firefox no longer causes that some working bookmarks are reported as broken!** That's why
  Bookmarks Organizer needs the permission to read and modify the privacy settings beginning with version 2.0.0, fixes
  [#26](https://github.com/cadeyrn/bookmarks-organizer/issues/26)
- **second bookmark check via another request method was not always executed, caused that some working bookmarks were reported as
  broken. This does not happen anymore**, fixes [#36](https://github.com/cadeyrn/bookmarks-organizer/issues/36)
- check for duplicates and check for bookmarks without name no longer list bookmark separators, fixes
  [#61](https://github.com/cadeyrn/bookmarks-organizer/issues/61)
- bookmark separators are no longer added to the total number of bookmarks, fixes
  [#70](https://github.com/cadeyrn/bookmarks-organizer/issues/70)
- added a menu item to the tools menu to open the user interface, fixes
  [#65](https://github.com/cadeyrn/bookmarks-organizer/issues/65)
- reduced file size of the logo, fixes [#66](https://github.com/cadeyrn/bookmarks-organizer/issues/66)

#### Bugfixes

- **progress animation didn't stop after checking for duplicates**, fixes
  [#48](https://github.com/cadeyrn/bookmarks-organizer/issues/48)
- setting for disabling confirmation prompts did not work for duplicates check, fixes
  [#68](https://github.com/cadeyrn/bookmarks-organizer/issues/68)
- changed keyboard shortcut to Shift + F11 to fix a conflict with a built-in shortcut, fixes
  [#67](https://github.com/cadeyrn/bookmarks-organizer/issues/67)
  
  #### Translations
  
- added Spanish translation (Thanks, TarekJor!)
- added Swedish translation (Thanks, Sopor-!)
- added Russian translation (Thanks, perdolka!)
- added Ukrainian translation (Thanks, perdolka!)

#### Code Quality

- organized the script files in folders

#### Dependencies

- updated eslint from version 3.19.0 to 4.18.1 and updated configuration file
- updated eslint-plugin-compat from version 1.0.3 to 2.2.0
- updated eslint-plugin-no-unsanitized from version 2.0.1 to 3.0.0
- updated eslint-plugin-xss from version 0.1.8 to 0.1.9
- updated gulp-eslint from version 3.0.1 to 4.0.2
- updated gulp-html from version 0.0.1 to 0.0.2
- updated gulp-stylelint from version 3.9.0 to 6.0.0
- updated htmllint from version 0.6.0 to 0.7.2 and added one rule
- updated jsdoc from version 3.4.3 to 3.5.5
- updated npm-run-all from version 4.0.2 to 4.1.2
- updated stylelint from version 7.11.0 to 9.1.1 and updated configuration file
- updated stylelint-csstree-validator from version 1.1.1 to 1.2.2
- updated stylelint-order from version 0.5.0 to 0.8.1
- updated web-ext from version 1.9.1 to 2.4.0

**Minimum required Firefox version is Firefox 58 now.**

### [Version 1.3.0](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.3.0) (2017-06-21)

#### Enhancements

- new option to disable the confirmation dialogs (you can find it in the add-on's settings), fixes
  [#29](https://github.com/cadeyrn/bookmarks-organizer/issues/29)
- make HEAD requests instead of GET requests for better performance and fall back to GET,
  fixes [#33](https://github.com/cadeyrn/bookmarks-organizer/issues/33)
  
#### Dependencies

- updated stylelint from version 7.10.1 to 7.11.0 and added new stylelint rule
- updated stylelint-order from version 0.4.4 to 0.5.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.2.0...v1.3.0)

### [Version 1.2.0](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.2.0) (2017-06-03)

#### Enhancements

- refreshed design, based on user feedback, including new logo, new header style and more compact header,
  fixes [#13](https://github.com/cadeyrn/bookmarks-organizer/issues/13),
  [#20](https://github.com/cadeyrn/bookmarks-organizer/issues/20),
  [#21](https://github.com/cadeyrn/bookmarks-organizer/issues/21) and
  [#22](https://github.com/cadeyrn/bookmarks-organizer/issues/22)
  
#### Translations
  
- added French translation (Thanks, Primokorn!)
- fixed typo in Polish translation (Thanks, WaldiPL!)

#### Dependencies

- updated eslint-plugin-no-unsanitized from version 2.0.0 to 2.0.1

**Thanks to [Ura Design](https://ura.design/) for the new logo!**

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.1.0...v1.2.0)

### [Version 1.1.0](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.1.0) (2017-05-28)

#### Enhancements

- preserve the hash for redirects, fixes [#24](https://github.com/cadeyrn/bookmarks-organizer/issues/24)
- performance optimization for protocol check

#### Bugfixes

- when checking for bookmarks without a name for some users the default bookmark places were listed,
  fixes [#3](https://github.com/cadeyrn/bookmarks-organizer/issues/3)
- ignore old google groups urls in broken bookmark check because it's not possible to determine the correct
  redirect url for technical reasons, fixes [#25](https://github.com/cadeyrn/bookmarks-organizer/issues/25)
- don't get into a broken state if there are no bookmarks, fixes
  [#17](https://github.com/cadeyrn/bookmarks-organizer/issues/17)
- fixed broken debug setting, fixes [#27](https://github.com/cadeyrn/bookmarks-organizer/issues/27)

#### Translations

- added Chinese (simplified) translation (Thanks, yfdyh000!)

#### Dependencies

- updated eslint-plugin-compat from version 1.0.2 to 1.0.3

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.6...v1.1.0)

### [Version 1.0.6](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.6) (2017-05-20)

#### Bugfixes

- reverted "removed not needed permission from manifest"

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.5...v1.0.6)

### [Version 1.0.5](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.5) (2017-05-13)

#### Enhancements

- use Mozilla's new Zilla font for the logo
- removed not needed permission from manifest

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.4...v1.0.5)

### [Version 1.0.4](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.4) (2017-05-10)

#### Bugfixes

- Code, which recognizes bookmarks and immediately updates the number of bookmarks, temporarily disabled due
  to a bug in Firefox (#1362863)
  
#### Translations

- added Czech translation (Thanks, MekliCZ!)
- added Polish translation (Thanks, WaldiPL!)

#### Code Quality

- added no-unsanitized plugin for ESLint

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.3...v1.0.4)

### [Version 1.0.3](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.3) (2017-05-04)

#### Bugfixes

- when deleting a bookmark, two bookmarks were subtracted from the total number of bookmarks

#### Dependencies

- updated web-ext from version 1.9.0 to 1.9.1
- updated stylelint-order from version 0.4.3 to 0.4.4

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.2...v1.0.3)

### [Version 1.0.2](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.2) (2017-05-01)

#### Code Quality

- added code documentation

#### Dependencies

- updated web-ext from version 1.8.1 to 1.9.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.1...v1.0.2)

### [Version 1.0.1](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.1) (2017-04-19)

- initial release for [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

#### Features of the first version

- finds no longer working bookmarks
- finds duplicate bookmarks
- finds bookmarks without name
- broken bookmarks can be edited or deleted
- detects redirects and offers the automatic correction of individual or all redirects
- open the interface by keyboard  (Ctrl + Shift + L, macOS: Cmd + Shift + L)
- direct start of individual tests via address bar (see [README](README.md "README"))
- translations: English, German, Dutch, Upper Sorbian, Lower Sorbian
