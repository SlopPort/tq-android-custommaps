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
A follow-up restarted the same profile in process 20656. Its runtime report
confirmed the saved custom-map identity and World::Load returned 1. The custom
interior appeared again. A post-run SHA-256 comparison found all 1,081 original
save files unchanged. Within the separate profile, 25 added or changed files
were all under ModProbe; no other copied character or shared file differed
from the prepared snapshot. Item-transfer persistence has not been tested.

Source-only manager messages now distinguish import from activation and show the
experimental map status when the current-process report confirms it. A standalone
APK build with bootstrap classes compiled successfully. Those message changes
are not yet installed in the game APK.

Private evidence: fresh-map-startup.json, fresh-map-world.json,
fresh-map-character.png, fresh-map-world.png, fresh-map-save.png,
fresh-map-reloaded.json, fresh-map-reloaded.png, fresh-map-save-comparison.json,
fresh-map-profile-comparison.json.
Google Play installation remains unverified.

## Movement limitation reported afterwards

The user reports that the character cannot move in Gladiators. Earlier automated
movement attempts had no visible effect; this must not be attributed solely to
ADB. World entry, rendering and save/reload remain observed, but playable map
support is unproven. The cause is not yet identified. A copied stock-world
character's position/save data is one hypothesis, not an established diagnosis.
