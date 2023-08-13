# Firefox Add-on: Bookmarks Organizer (WebExtension)

<img src="src/images/logo-large.png" alt="Logo" width="400" border="0" />

## Support the development

**Please consider making [a donation](https://www.paypal.com/paypalme/agenedia/) to support the further development of
Bookmarks Organizer. Thank you very much!**

## Description

With the Bookmarks Organizer, it's easy to put order in your bookmarks. The Bookmarks Organizer finds no longer working
bookmarks, redirects, duplicates and more!

**Bookmarks Organizer is a WebExtension and compatible with Firefox Browser 60 and higher (Firefox Browser 115 or
higher is required for the latest version of Bookmarks Organizer).**

### Features

- Finds no longer working bookmarks
- Finds duplicate bookmarks
- Finds bookmarks without name
- Broken bookmarks can be edited or deleted
- Detects redirects and offers the automatic correction of individual or all redirects
- Whitelist feature to exclude bookmarks from future broken bookmark checks
- Internal skip list for domains that are known as not validatable for technical reasons

### Shortcuts

The interface can also be accessed via the keyboard. For this purpose the combination **Shift + F11** is reserved. Or
you can open the interface via a menu entry in the tools menu.

It is also possible to start individual tests directly via the address bar:

- **bookmarks organizer**: opens the interface
- **bookmarks duplicates**: search for duplicates
- **bookmarks empty-names**: search for bookmarks without name
- **bookmarks errors**: search for broken bookmarks
- **bookmarks redirects**: search for redirects

### Planned features

You can find the roadmap and request new features in the
[issues tracker](https://github.com/cadeyrn/bookmarks-organizer/issues).

### Languages

The add-on is currently available in the following languages:

- English
- German
- French (Thanks, Primokorn!)
- Italian (Thanks, MichelePezza!)
- Russian (Thanks, perdolka and Smollet777!)
- Japanese (Thanks, dlwe!)
- Chinese (simplified) (Thanks, yfdyh000!)
- Chinese (traditional) (Thanks, zhtw2013!)
- Spanish (Thanks, TarekJor!)
- Brazilian Portuguese (Thanks, pmichelazzo!)
- Dutch (Thanks, Tonnes!)
- Polish (Thanks, WaldiPL!)
- Czech (Thanks, MekliCZ!)
- Swedish (Thanks, Sopor- and iwconfig!)
- Ukrainian (Thanks, perdolka and Smollet777!)
- Upper Sorbian (Thanks, milupo!)
- Lower Sorbian (Thanks, milupo!)
- Turkish (Thanks, coffeemesh!)

### Note

- If you edit the URL of a bookmark or if you let Bookmarks Organizer fix a redirect Firefox will “lose” the tags
  associated with the bookmark because bookmark tags are bound to the URL and not to the bookmark. The tags are not
  really lost, they are still associated with the old URL. This is neither a bug of Bookmarks Organizer nor of Firefox,
  it's how Firefox works. Please see [Bugzilla #1440988](https://bugzilla.mozilla.org/show_bug.cgi?id=1440988#c2) for
  context.

### Permissions

Bookmarks Organizer needs several permissions to work properly. To give you full transparency this overview also lists
“silent“ permissions.

#### mandatory permissions

Bookmarks Organizer does not work without the following permissions:

##### read and modify bookmarks

You installed Bookmarks Organizer for checking and modifying broken bookmarks so it should be clear why the permission
is needed to read and modify the bookmarks.

##### access browser tabs

The permission to access the browser tabs is needed so that Bookmarks Organizer can jump to the already opened settings
page if the settings page is already opened in another tab and you click the button to open Bookmarks Organizer's
settings.

#### optional permissions

##### access your data for all sites

The add-on checks the bookmarks by sending a request to the appropriate URLs. This cannot work without the permission
to access these sites. Bookmarks Organizer asks at runtime for this permission if you want to execute this check.

#### silent permissions

Bookmarks Organizer needs some more permissions, but Firefox does not prompt for the following permissions:

##### menus
_(since 2.0.0)_

The menus permission is needed for providing an menu entry in the tools menu to access Bookmarks Organizer's user
interface.

##### storage

The storage permission is needed so that Bookmarks Organizer can store settings and exceptions.

## Download

[Download Bookmarks Organizer](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

## Release Notes

[Release Notes](CHANGELOG.md "Release Notes")
