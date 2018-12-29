# Firefox Add-on: Bookmarks Organizer (WebExtension)

<img src="src/images/logo-large.png" alt="Logo" width="400" border="0" />

## Description

With the Bookmarks Organizer, it's easy to put order in your bookmarks. The Bookmarks Organizer finds no longer working
bookmarks, redirects, duplicates and more!

**Bookmarks Organizer is a WebExtension and compatible with Firefox Quantum (Firefox 60 and later).**

### Features

- Finds no longer working bookmarks
- Finds duplicate bookmarks
- Finds bookmarks without name
- Broken bookmarks can be edited or deleted
- Detects redirects and offers the automatic correction of individual or all redirects

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

There are already some features planned for the future.

- Whitelist: create exceptions for bookmarks, which will no longer be objected to during further checks
- Features for bookmark folders, including empty folders
- & more…

Please suggest your feature requests in the [issues tracker](https://github.com/cadeyrn/bookmarks-organizer/issues).

### Languages

The add-on is currently available in the following languages:

- English
- German
- French (Thanks, Primokorn!)
- Russian (Thanks, perdolka!)
- Chinese (simplified) (Thanks, yfdyh000!)
- Chinese (traditional) (Thanks, zhtw2013!)
- Spanish (Thanks, TarekJor!)
- Dutch (Thanks, Tonnes!)
- Polish (Thanks, WaldiPL!)
- Czech (Thanks, MekliCZ!)
- Swedish (Thanks, Sopor-!)
- Ukrainian (Thanks, perdolka!)
- Upper Sorbian (Thanks, milupo!)
- Lower Sorbian (Thanks, milupo!)

### Notes / Known Issues

- Bookmarks Organizer  counts the number of existing bookmarks as soon as the interface of the add-on is opened.
  Subsequently, the add-on detects when a bookmark is deleted and immediately adjusts the number of existing bookmarks
  so that no reloading of the interface is required. The same thing doesn't work if you create a new bookmark. If a new
  bookmark is created, the interface of the add-on must be reloaded, because the functionality of Bookmarks Organizer
  depends on the correct number of bookmarks. There is a detection in the add-on but it has been disabled because of a
  bug in Firefox. Please follow [Bugzilla #1362863](https://bugzilla.mozilla.org/show_bug.cgi?id=1362863) for more
  information.
- If you edit the URL of a bookmark or if you let Boomarks Organizer fix a redirect Firefox will “loose” the tags
  associated with the bookmark because bookmark tags are bound to the URL and not to the bookmark. The tags are not
  really lost, they are still associated with the old URL. This is neither a bug of Bookmarks Organizer nor of Firefox,
  it's how Firefox works. Please see [Bugzilla #1440988](https://bugzilla.mozilla.org/show_bug.cgi?id=1440988#c2) for
  context.

### Permissions

Bookmarks Organizer needs several permissions to work properly. To give you full transparency this overview also lists
“silent“ permissions.

#### mandatory permissions

Bookmarks Organizer does not work without the following permissions:

##### access your data for all sites

The add-on checks the bookmarks by sending a request to the appropriate URLs. This cannot work without the permission
to access these sites.

##### read and modify bookmarks

You installed Bookmarks Organizer for checking and modifying broken bookmarks so it should be clear why the permission
is needed to read and modify the bookmarks.

##### access browser tabs

The permission to access the browser tabs is needed so that Bookmarks Organizer can jump to the already opened settings
page if the settings page is already opened in another tab and you click the button to open Bookmarks Organizer's
settings.

#### silent permissions

Bookmarks Organizer needs some more permissions, but Firefox does not prompt for the following permissions:

##### menus
_(since 2.0.0)_

The menus permission is needed for providing an menu entry in the tools menu to access Bookmarks Organizer's user
interface.

##### storage

The storage permission is needed so that Bookmarks Organizer can store settings and (in the future) bookmark exceptions.

## Download

[Download Bookmarks Organizer](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

## Release Notes

[Release Notes](CHANGELOG.md "Release Notes")
