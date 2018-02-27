# Firefox Add-on: Bookmarks Organizer (WebExtension)

<img src="src/images/logo-large.png" alt="Logo" width="400" border="0" />

## Description

With the Bookmarks Organizer, it's easy to put order in your bookmarks. The Bookmarks Organizer finds no longer working
bookmarks, redirects, duplicates and more!

**The Bookmarks Organizer is a WebExtension and compatible with Firefox Quantum (Firefox 59 and later).**

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

### Known Issues

There are some known issues because of platform bugs in Firefox. Please see the list below.

- For some users the Bookmarks Organizer is not able to finish the check for broken bookmarks. This is
  because if Firefox can't reach a server the request does not abort. There is already an enhancement ready for
  Bookmarks Organizer to cancel the request after a few seconds which will solve the issue but it causes
  Firefox to crash so the fix can't be released until Mozilla has fixed the cause of the crash. Please follow
  [issue #23](https://github.com/cadeyrn/bookmarks-organizer/issues/23) and
  [this Bugzilla ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1440941) for more information.
- If you edit the URL of a bookmark within Bookmarks Organizer or if you let Boomarks Organizer fix a redirect
  Firefox will loose the tags of the bookmark. This is a WebExtension bug of Firefox. Most user don't use
  bookmark tags and are not affected. But if you use bookmark tags please be prepared. Please follow
 [issue #47](https://github.com/cadeyrn/bookmarks-organizer/issues/47) and
 [this Bugzilla ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1440988) for more information.
- Bookmarks Organizer counts the number of total bookmarks when opening the user interface of the add-on. Bookmarks
  Organizer detects if you remove a bookmark and immediately adjusts the number of total bookmarks. But Bookmarks
  Organizer does not detect if you add a bookmark, so please reload the user interface of the add-on before
  executing a check because Bookmarks Organizer will not correctly work with the wrong number of bookmarks. This
  is because of a bug in Firefox. Please follow
  [this Bugzilla ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1362863) for more information.

## Compatibility

The extension requires at least Firefox 59. Because the extension makes use of modern web technologies and the latest
WebExtension APIs, support for older versions of Firefox is not possible for technical reasons.

## Download

[Download Bookmarks Organizer](https://addons.mozilla.org/en-US/firefox/addon/bookmarks-organizer/)

## Release Notes

[Release Notes](CHANGELOG.md "Release Notes")
