# Firefox Add-on: Bookmarks Organizer (WebExtension)

<img src="src/images/logo-large.png" alt="Logo" width="400" border="0" />

## Description

With the Bookmarks Organizer, it's easy to put order in your bookmarks. The Bookmarks Organizer finds no longer working
bookmarks, redirects, duplicates and more!

**Bookmarks Organizer is a WebExtension and compatible with Firefox Quantum (Firefox 59 and later).**

### Features

- Finds no longer working bookmarks
- Finds duplicate bookmarks
- Finds bookmarks without name
- Broken bookmarks can be edited or deleted
- Detects redirects and offers the automatic correction of individual or all redirects

### Shortcuts

The interface can also be accessed via the keyboard. For this purpose the combination **Shift + F11** is reserved.

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

The extension is currently available in the following languages:

- English
- German
- French (Thanks, Primokorn!)
- Russian (Thanks, perdolka!)
- Chinese (simplified) (Thanks, yfdyh000!)
- Spanish (Thanks, TarekJor!)
- Dutch (Thanks, Tonnes!)
- Polish (Thanks, WaldiPL!)
- Czech (Thanks, MekliCZ!)
- Swedish (Thanks, Sopor-!)
- Ukrainian (Thanks, perdolka!)
- Upper Sorbian (Thanks, milupo!)
- Lower Sorbian (Thanks, milupo!)

### Notes / Known Issues

- Bookmarks Organizer  counts the number of existing bookmarks as soon as the interface of the add-on is opened. Subsequently,
  the add-on detects when a bookmark is deleted and immediately adjusts the number of existing bookmarks so that no reloading
  of the interface is required. The same thing doesn't work if you create a new bookmark. If a new bookmark is created, the
  interface of the add-on must be reloaded, because the functionality of Bookmarks Organizer depends on the correct number of
  bookmarks. There is a detection in the add-on but it has been disabled because of a bug in Firefox. Please follow
  [Bugzilla #1362863](https://bugzilla.mozilla.org/show_bug.cgi?id=1362863) for more information.
- If you edit the URL of a bookmark or if you let Boomarks Organizer fix a redirect Firefox will “loose” the tags associated
  with the bookmark because bookmark tags are bound to the URL and not to the bookmark. The tags are not really lost, they are
  still associated with the old URL. This is neither a bug of Bookmarks Organizer nor of Firefox, it's how Firefox works. Please
  see [Bugzilla #1440988](https://bugzilla.mozilla.org/show_bug.cgi?id=1440988#c2) for context.

## Compatibility

Bookmarks Organizer requires at least Firefox 59. Because the add-on makes use of modern web technologies and the latest
WebExtension APIs, support for older versions of Firefox is not possible for technical reasons.

## Download

[Download Bookmarks Organizer](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

## Release Notes

[Release Notes](CHANGELOG.md "Release Notes")
