### Version 4.0.2 (Work in Progress)

#### Translations

- updated Turkish translation (Thanks, r0tbra1n!)

#### Dependencies

- updated eslint from version 8.32.0 to 8.47.0
- updated eslint-plugin-compat from version 4.0.2 to 4.1.4
- updated gulp-eslint-new from version 1.7.1 to 1.8.3
- updated jsdoc from version 4.0.0 to 4.0.2
- updated stylelint from version 14.16.1 to 15.10.2 and updated configuration
- updated stylelint-csstree-validator from version 2.0.0 to 3.0.0
- updated stylelint-order from version 6.0.1 to 6.0.3

---

### Version 4.0.1 (2023-01-28)

#### Bugfixes

- Due to a behaviour change in Manifest v3, checking for broken bookmarks in Bookmarks Organizer 4.0 no longer worked
  for sites that are not available through https://. This issue was fixed, fixes
  [#201](https://github.com/cadeyrn/bookmarks-organizer/issues/201)

#### Translations

- updated Brazilian Portuguese translation (Thanks, pmichelazzo!)

#### Dependencies

- updated eslint from version 8.31.0 to 8.32.0
- updated web-ext from version 7.4.0 to 7.5.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v4.0.0...v4.0.1)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-4.0.1)

---

### Version 4.0.0 (2023-01-10)

#### Notable Changes

- **Bookmarks Organizer now uses Manifest v3**, fixes
  [#181](https://github.com/cadeyrn/bookmarks-organizer/issues/181)
- **Bookmarks Organizer now asks at runtime for permission** to access all website data if permission is not granted.
  The permission is technically needed to check for broken bookmarks. Therefore, the permission is no longer
  needed for installation as well as not for using the other modes. Bookmarks Organizer also reacts to permission
  changes via the add-ons manager, fixes [#190](https://github.com/cadeyrn/bookmarks-organizer/issues/190)
- bumped the minimum required Firefox version to Firefox 109, fixes
  [#170](https://github.com/cadeyrn/bookmarks-organizer/issues/170)
- the loading animation no longer appears if the Bookmarks Organizer takes less than 500ms to be ready, fixes
  [#189](https://github.com/cadeyrn/bookmarks-organizer/issues/189)
- the button to check for broken bookmarks is now disabled if there are no bookmarks, fixes
  [#191](https://github.com/cadeyrn/bookmarks-organizer/issues/191)
- removed input.mozilla.org and testpilot.firefox.com from internal skip list because these domains are no longer part
  of extensions.webextensions.restrictedDomains, fixes [#173](https://github.com/cadeyrn/bookmarks-organizer/issues/173)
- removed the outline from input fields because we have our own focus design, fixes
  [#175](https://github.com/cadeyrn/bookmarks-organizer/issues/175)
- changed copyright year from 2019 to 2023, fixes [#169](https://github.com/cadeyrn/bookmarks-organizer/issues/169)

#### Bugfixes

- If a bookmarks folder with more than one bookmark was removed the counter of the Bookmarks Organizer only decreased
  by one, fixes [#192](https://github.com/cadeyrn/bookmarks-organizer/issues/192)
- If a bookmark was added while a check for broken bookmarks was already in progress the check never finished, fixes
  [#112](https://github.com/cadeyrn/bookmarks-organizer/issues/112)

#### Code Quality

- replaced the translation mechanism with the newest version to share more code with other extensions and improve the
  maintainability, fixes [#174](https://github.com/cadeyrn/bookmarks-organizer/issues/174)
- removed code for Firefox below version 61, fixes [#172](https://github.com/cadeyrn/bookmarks-organizer/issues/172)
- replaced deprecated method call, fixes [#168](https://github.com/cadeyrn/bookmarks-organizer/issues/168)
- fixed some code style issues and typos, fixes [#171](https://github.com/cadeyrn/bookmarks-organizer/issues/171)
- removed -moz- vendor prefixes in CSS code where possible, fixes
  [#198](https://github.com/cadeyrn/bookmarks-organizer/issues/198)

#### Translations

- added Italian translation (Thanks, MichelePezza!)
- added Japanese translation (Thanks, dlwe!)
- added Brazilian Portuguese translation (Thanks, pmichelazzo!)
- added Turkish translation (Thanks, coffeemesh!)
- updated Swedish translation (Thanks, iwconfig!)

#### Dependencies

- replaced gulp-eslint 6.0.0 with gulp-eslint-new 1.3.0
- updated eslint from version 5.12.1 to 8.31.0 and updated configuration
- updated eslint-plugin-compat from version 2.6.3 to 4.0.2
- updated eslint-plugin-no-unsanitized from version 3.0.2 to 4.0.2
- updated eslint-plugin-promise from version 4.0.1 to 6.0.0
- updated eslint-plugin-xss from version 0.1.9 to 0.1.12
- updated gulp from version 4.0.0 to 4.0.2
- updated gulp-eslint-new from version 1.3.0 to 1.7.1
- updated gulp-htmllint from version 0.0.16 to 0.0.19
- updated gulp-jsdoc3 from version 2.0.0 to 3.0.0
- updated gulp-stylelint from version 8.0.0 to 13.0.0
- updated htmllint from version 0.7.3 to 0.8.0 and updated configuration
- updated jsdoc from version 3.5.5 to 4.0.0
- updated stylelint from version 9.10.1 to 14.6.1 and updated configuration
- updated stylelint-csstree-validator from version 1.3.0 to 2.0.0
- updated stylelint-order from version 2.0.0 to 6.0.1
- updated web-ext from version 2.9.3 to 7.4.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v3.1.0...v4.0.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-4.0.0)

---

### Version 3.1.0 (2019-01-26)

#### Enhancements

- changed native confirmation dialogs to a custom implementation which looks better and does not have the checkbox
  to prevent further dialogs. Checking this checkbox caused problems because it was not in sync with Bookmarks
  Organizer's internal state. The new implementation will also be the foundation for future improvements, fixes
  [#82](https://github.com/cadeyrn/bookmarks-organizer/issues/82)
- enabling or disabling the confirmation dialogs now has an immediate effect. It is no longer necessary to run the
  check for broken bookmarks again after changing this option, fixes
  [#103](https://github.com/cadeyrn/bookmarks-organizer/issues/103)

#### Bugfixes

- fixed a bug that caused newly created bookmarks not to appear in the results list when rechecking for broken bookmarks
  without reloading the user interface, fixes [#104](https://github.com/cadeyrn/bookmarks-organizer/issues/104)

#### Translations

- updated various translations

#### Dependencies

- updated eslint from version 5.11.1 to 5.12.1
- updated stylelint from version 9.9.0 to 9.10.1 and added one new rule

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v3.0.0...v3.1.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-3.1.0)

---

### Version 3.0.0 (2018-12-30)

#### Enhancements

- **added whitelist feature to exclude bookmarks from future broken bookmark checks!**, fixes
  [#11](https://github.com/cadeyrn/bookmarks-organizer/issues/11)
- added some Mozilla domains to the internal skip list because these domains cannot be checked for security reasons,
  fixes [#76](https://github.com/cadeyrn/bookmarks-organizer/issues/76)
- improved reliability of broken bookmark check
- added internal option to disable the skip list for testing purposes
- Firefox 61+: The number of bookmarks is now updated immediately when a bookmark is added. This feature was disabled
  since version 1.0.4 due to a bug in Firefox which has been fixed in Firefox 61. In Firefox 60 this feature is still
  disabled.
  
#### Bugfixes

- the mass action buttons for repairing all redirects or removing all broken bookmarks were not shown under some
  circumstances, fixes [#85](https://github.com/cadeyrn/bookmarks-organizer/issues/85)
- some of the address bar commands were broken, fixes [#74](https://github.com/cadeyrn/bookmarks-organizer/issues/74)
- fixed error in browser console "Unknown localization message omnibox_command_check_organizer" when using the
  address bar commands

#### Translations

- added Chinese (traditional) translation (Thanks, zhtw2013!)

#### Dependencies

- added eslint-plugin-promise 4.0.1 as new dependency
- migrated from gulp-html-lint 0.0.2 to gulp-htmllint 0.0.16 because gulp-html-lint is no longer maintained
- updated eslint from version 4.18.2 to 5.11.1 and updated eslint configuration
- updated eslint-plugin-compat from version 2.2.0 to 2.6.3
- updated eslint-plugin-no-unsanitized from version 3.0.0 to 3.0.2
- updated gulp from version 3.9.1 to 4.0.0
- updated gulp-eslint from version 4.0.2 to 5.0.0
- updated gulp-jsdoc3 from version 1.0.1 to 2.0.0
- updated gulp-stylelint from version 7.0.0 to 8.0.0
- updated htmllint from version 0.7.2 to 0.7.3 and updated htmllint configuration
- updated npm-run-all from version 4.1.2 to 4.1.5
- updated stylelint from version 9.1.1 to 9.9.0 and updated stylelint configuration
- updated stylelint-csstree-validator from version 1.2.2 to 1.3.0
- updated stylelint-order from version 0.8.1 to 2.0.0
- updated web-ext from version 2.4.0 to 2.9.3

**Minimum required Firefox version is Firefox 60 now.**

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v2.0.0...v3.0.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-3.0.0)

---

### Version 2.0.0 (2018-03-10)

#### Enhancements

- **Bookmarks Organizer no longer fails for some users to complete the check for broken bookmarks! A new mechanism has
  been implemented that terminates any request if it take too much time to get an answer from the server**. That's why
  Firefox 59 or higher is required beginning with version 2.0.0, fixes
  [#17](https://github.com/cadeyrn/bookmarks-organizer/issues/17)
- **a request throttling mechanism has been implemented to ensure that Firefox does not simultaneously execute too many
  requests at any time.** With many bookmarks, this can extend the duration of the check for broken bookmarks, but on
  the other hand it ensures that fewer working bookmarks will be reported as broken, fixes
  [#72](https://github.com/cadeyrn/bookmarks-organizer/issues/72)
- **the second bookmark check via another request method was not executed under certain circumstances, caused that some
  working bookmarks were reported as broken. This does not happen anymore**, fixes
  [#36](https://github.com/cadeyrn/bookmarks-organizer/issues/36)
- the check for duplicates and the check for bookmarks without name no longer list bookmark separators, fixes
  [#61](https://github.com/cadeyrn/bookmarks-organizer/issues/61)
- bookmark separators are no longer added to the total number of bookmarks, fixes
  [#70](https://github.com/cadeyrn/bookmarks-organizer/issues/70)
- added a menu item to the tools menu to open the user interface, fixes
  [#65](https://github.com/cadeyrn/bookmarks-organizer/issues/65)
- changed keyboard shortcut to Shift + F11 to avoid a conflict with a built-in shortcut, fixes
  [#67](https://github.com/cadeyrn/bookmarks-organizer/issues/67)
- when deleting a bookmark, not only the total number of bookmarks will be reduced, but also the number of checked
  bookmarks, so that the number of checked bookmarks can never be larger than the total number of bookmarks
- the performance of several parts of the add-on has been lightly improved
- reduced file size of the logo, fixes [#66](https://github.com/cadeyrn/bookmarks-organizer/issues/66)

#### Bugfixes

- **the progress animation didn't stop after checking for duplicates, caused that it was also not possible to delete
  duplicate bookmarks**, fixes [#48](https://github.com/cadeyrn/bookmarks-organizer/issues/48)
- setting for disabling confirmation prompts did not work for duplicates check, fixes
  [#68](https://github.com/cadeyrn/bookmarks-organizer/issues/68)
- filter checkboxes and search field were not resetted when checking for broken bookmarks a second time, fixes
  [#73](https://github.com/cadeyrn/bookmarks-organizer/issues/73)

#### Translations

- added Spanish translation (Thanks, TarekJor!)
- added Swedish translation (Thanks, Sopor-!)
- added Russian translation (Thanks, perdolka!)
- added Ukrainian translation (Thanks, perdolka!)

#### Code Quality

- refactored and simplified a few code pathes
- organized the script files in folders

#### Dependencies

- updated eslint from version 3.19.0 to 4.18.2 and updated configuration file
- updated eslint-plugin-compat from version 1.0.3 to 2.2.0
- updated eslint-plugin-no-unsanitized from version 2.0.1 to 3.0.0
- updated eslint-plugin-xss from version 0.1.8 to 0.1.9
- updated gulp-eslint from version 3.0.1 to 4.0.2
- updated gulp-html from version 0.0.1 to 0.0.2
- updated gulp-stylelint from version 3.9.0 to 7.0.0
- updated htmllint from version 0.6.0 to 0.7.2 and updated configuration file
- updated jsdoc from version 3.4.3 to 3.5.5
- updated npm-run-all from version 4.0.2 to 4.1.2
- updated stylelint from version 7.11.0 to 9.1.1 and updated configuration file
- updated stylelint-csstree-validator from version 1.1.1 to 1.2.2
- updated stylelint-order from version 0.5.0 to 0.8.1
- updated web-ext from version 1.9.1 to 2.4.0

**Minimum required Firefox version is Firefox 59 now.**

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.3.0...v2.0.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-2.0.0)

---

### [Version 1.3.0](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.3.0) (2017-06-21)

#### Enhancements

- new option to disable the confirmation dialogs (you can find it in the add-on's settings), fixes
  [#29](https://github.com/cadeyrn/bookmarks-organizer/issues/29)
- make HEAD requests instead of GET requests for better performance and fall back to GET,
  fixes [#33](https://github.com/cadeyrn/bookmarks-organizer/issues/33)

#### Dependencies

- updated stylelint from version 7.10.1 to 7.11.0 and added new stylelint rule
- updated stylelint-order from version 0.4.4 to 0.5.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.2.0...v1.3.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-1.3.0)

---

### [Version 1.2.0](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.2.0) (2017-06-03)

#### Enhancements

- refreshed design based on user feedback, including new logo, new header style and more compact header,
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

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.1.0...v1.2.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-1.2.0)

---

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

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.6...v1.1.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-1.1.0)

---

### [Version 1.0.6](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.6) (2017-05-20)

#### Bugfixes

- reverted "removed not needed permission from manifest"

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.5...v1.0.6)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/versions/?page=1#version-1.0.6)

---

### [Version 1.0.5](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.5) (2017-05-13)

#### Enhancements

- use Mozilla's new Zilla font for the logo
- removed not needed permission from manifest

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.4...v1.0.5)

---

### [Version 1.0.4](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.4) (2017-05-10)

#### Bugfixes

- Code, which recognizes bookmarks and immediately updates the number of bookmarks, temporarily disabled due
  to a bug in Firefox ([Bugzilla #1362863](https://bugzilla.mozilla.org/show_bug.cgi?id=1362863))

#### Translations

- added Czech translation (Thanks, MekliCZ!)
- added Polish translation (Thanks, WaldiPL!)

#### Code Quality

- added no-unsanitized plugin for ESLint

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.3...v1.0.4)

---

### [Version 1.0.3](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.3) (2017-05-04)

#### Bugfixes

- when deleting a bookmark, two bookmarks were subtracted from the total number of bookmarks

#### Dependencies

- updated stylelint-order from version 0.4.3 to 0.4.4
- updated web-ext from version 1.9.0 to 1.9.1

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.2...v1.0.3)

---

### [Version 1.0.2](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.2) (2017-05-01)

#### Code Quality

- added code documentation

#### Dependencies

- updated web-ext from version 1.8.1 to 1.9.0

[All Changes](https://github.com/cadeyrn/bookmarks-organizer/compare/v1.0.1...v1.0.2)

---

### [Version 1.0.1](https://github.com/cadeyrn/bookmarks-organizer/releases/tag/v1.0.1) (2017-04-19)

- initial release for [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

#### Features of the first version

- finds no longer working bookmarks
- finds duplicate bookmarks
- finds bookmarks without name
- broken bookmarks can be edited or deleted
- detects redirects and offers the automatic correction of individual or all redirects
- open the interface by keyboard  (Ctrl + Shift + L, macOS: Cmd + Shift + L)
- direct start of individual tests via address bar (see [README](README.md#shortcuts))
- translations: English, German, Dutch, Upper Sorbian, Lower Sorbian
