# Fresh map import and profile preparation through the UI

Using installed experimental build e8f1a46, the manager imported the existing
Gladiators test ZIP through Android's document picker into a new library entry.
The entry was selected and its separate save copy prepared through the manager's
confirmation dialog. No selection or profile file was manually edited.

Process 18248 then opened from the manager. Its startup request used the new
entry and its prepared profile. The runtime verified 54 unique native functions,
activated the map, and reported ready before loading ModProbe. The custom interior
and its location label appeared. Saving produced the game confirmation dialog.

This closes a gap in the earlier test, which reused an existing prepared profile.
It does not establish arbitrary mod compatibility, fresh download handling or a
stock-phone installation. The ZIP was already in Downloads, and ADB automated UI
input and collected evidence. Only ModProbe entered gameplay; the prepared copy
also contains the other original characters, which were not loaded.

All 1,081 original save files matched the baseline before this fresh-map run.
A post-run comparison and restart of this new profile remain pending.

Source-only manager messages now distinguish import from activation and show the
experimental map status when the current-process report confirms it. A standalone
APK build with bootstrap classes compiled successfully. Those message changes
are not yet installed in the game APK.

Private evidence: fresh-map-startup.json, fresh-map-world.json,
fresh-map-character.png, fresh-map-world.png, fresh-map-save.png.
Google Play installation remains unverified.
