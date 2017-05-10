# Firefox Add-on: Bookmarks Organizer

## Release Notes / Versionshinweise

### Version 1.0.4 (10. Mai 2017)

- ÜBERSETZUNG: Tschechische Übersetzung hinzugefügt (Danke, MekliCZ!)
- ÜBERSETZUNG: Polnische Übersetzung hinzugefügt (Danke, WaldiPL!)
- BUGFIX: Code, welcher Hinzufügen von Lesezeichen erkennt und die Anzahl der Lesezeichen umgehend aktualisiert,
  aufgrund eines Bugs in Firefox temporär deaktiviert (#1362863).
- CODE-QUALITÄT: no-unsanitized-Plugin für ESLint hinzugefügt

### Version 1.0.3 (04. Mai 2017)

- BUGFIX: Beim Löschen eines Lesezeichen wurden zwei Lesezeichen von der Gesamtzahl der Lesezeichen abgezogen
- ABHÄNGIGKEIT: Update web-ext Version 1.9.0 auf Version 1.9.1
- ABHÄNGIGKEIT: Update stylelint-order Version 0.4.3 auf Version 0.4.4

### Version 1.0.2 (01. Mai 2017)

- ABHÄNGIGKEIT: Update web-ext Version 1.8.1 auf Version 1.9.0
- CODE-QUALITÄT: Code-Dokumentation ergänzt

### Version 1.0.1 (19. April 2017)

- erste Veröffentlichung für [addons.mozilla.org](https://addons.mozilla.org/de/firefox/addon/bookmarks-organizer/)

**Features der ersten Version**

- Findet nicht mehr funktionierende Lesezeichen
- Findet doppelte Lesezeichen
- Findet Lesezeichen ohne Namen
- Fehlerhafte Lesezeichen können direkt bearbeitet oder gelöscht werden
- Erkennt Weiterleitungen und bietet die automatische Anpassung einzelner oder aller Weiterleitungen an
- Öffnen der Oberfläche per Tastatur-Kommando (Strg + Shift + L, macOS: Cmd + Shift + L)
- Direktes Starten einzelner Tests per Adressleiste (siehe [README](README.md "README"))
- Sprachen: Deutsch, Englisch, Niederländisch, Obersorbisch, Niedersorbisch
