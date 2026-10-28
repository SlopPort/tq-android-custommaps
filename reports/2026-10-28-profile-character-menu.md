# Separate-profile character selection on Android

Build 5364, Redmi Note 8: a temporary native save-root redirect was exercised by
normal menu navigation, beyond explicit probe calls. No world or mod was loaded.

With the game stopped, a fresh backup captured 1,081 original SaveData files.
A new app-private laboratory directory received only a copy of ModProbe and Sys.
No primary character was copied into that test profile. The directory was made
readable by the game UID. This laboratory setup used root; it does not validate
installation or profile creation on an unrooted device.

A delayed hook verified the getter export and its first 16 bytes, then replaced
GetUserSaveDataFolder results with the fixed test profile path. Process 21924
reported five substitutions and no hook errors. Character selection displayed
ModProbe with no character-navigation arrows. This supports separate-profile menu
enumeration; it does not prove complete read/write isolation.

An additional observer on Game::GetSavedGames captured no calls during the run.
Its empty log is not an empty-character-list result; the UI supplied the evidence
for the visible selection. Other enumeration paths were not traced in this run.

The process was stopped and the original loader restored. Its SHA-256 matched
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
Independent SHA-256 comparison of the original SaveData tree matched every one
of the 1,081 pre-test files, with no changed, added or missing files. The game was
launched again using the original loader. The private test profile is retained.

## Remaining limits

This hook is a laboratory prototype, not a production safety boundary. Errors
are recorded rather than reliably blocking native I/O. It has no complete
caravan/cloud routing, player-load guard or production startup synchronization.
The menu-only procedure was enforced by the operator; it is not a code-enforced
restriction. Do not use this result to enable general profile activation.

Next: implement guarded caravan-path binding, then test world entry and save/reload
with the disposable profile and compare original saves again. UI and runtime
integration remain unpublished as user-ready features.
