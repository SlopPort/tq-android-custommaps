# Mobile map-save enumeration: static findings

Status: static finding and scoped device correction verified for two ModProbe world entries across separate processes. Full mod compatibility remains unverified.

For the locally examined 5364 library, LoadingScreen::GetSaveGame enumerates
saved games before comparing map-path suffix, character name and difficulty
(0xbe3298, 0xbe32ac, 0xbe32c4). A failed match leaves no selected save.

Game::AddSavedGames (0xc76c24) reads map.dat. It reads mapVersion and mapPath
at 0xc76d24 and 0xc76d50, and conditionally modName at 0xc76d88. However,
at 0xc76d98–0xc76da4 it assigns the literal Levels/World/World01.map
(string address 0xdcbcdb) to SaveGameInfoStruct +0x30. The previously read
mapPath is not assigned to that field in this function. The record is then
appended at 0xc76df8.

This establishes a static mismatch with the previous prototype, which asked
LoadingScreen to find maps/gladiators.map. It explains why changing only
GameInfo's level name cannot select the record produced by this path.
At that initial stage, runtime observation of the retained experimental save was still required;
this did not yet establish successful resumption or exclude other blockers.

A private read-only observer has been prepared for AddSavedGames. It records
only appended entries associated with the ModProbe save-directory path,
including map and difficulty. It does not alter records, arguments or saves.
At that initial stage it had not been installed or executed. The later device
checks and correction results are recorded below; no new APK was built.

Initial plan: confirm the emitted map identity, then test a narrowly scoped correction
using the actual saved mapPath and verified map assets, with an isolated copy
of ModProbe. Do not globally replace the campaign map constant or modify main
character records. Keep the original save backup and recovery procedure.

## Device enumeration evidence

A fresh backup before this experiment matched all 1,081 original files.
A read-only native enumeration in process 18605 returned four records overall,
including one ModProbe record for Levels/World/World01.map, difficulty 0.
After retaining the original ModProbe folder and copying only the experimental
ModProbe save into its place, process 18993 returned five records overall:
two ModProbe records, both labeled Levels/World/World01.map, difficulty 0.
The experimental map.dat itself contains mapPath = maps/gladiators.map.
No character was loaded during these enumeration checks.

The observer's direct native call did not produce its nested Interceptor events;
the evidence above comes from explicitly inspecting the returned vector before
calling its native destructor. This distinction avoids mistaking an empty hook
log for an empty saved-game list.

A laboratory correction was tested at the string-assignment call 0xc76da4.
It checks the original instruction bytes and is active only inside AddSavedGames
for ModProbe on the same thread. It substitutes the verified Gladiators path only
when the stored mapPath equals maps/gladiators.map and the assignment source is
the expected campaign literal. Other map paths and characters remain on stock
behavior. The results below cover runtime reload checks; this remains a laboratory prototype, not a product feature.

## Scoped correction and repeat test

Process 19288 recorded one corrected map assignment, followed by Game::LoadGame
receiving ModProbe and World::Load returning 1 for maps/gladiators.map. A screenshot
showed the rendered Gladiators interior. The save action produced the game's saved
confirmation. After returning to the menu, the process was stopped and restarted.

Process 19988 repeated the corrected assignment and successful world entry using
the newly saved files. Both runs still required the existing World::Load redirect:
its incoming path remained Levels/World/World01.map. Fixing enumeration alone is
therefore not a complete mobile custom-map implementation. These observations
confirm selection and world-entry resumption, not exhaustive restoration of quests,
spawn state, navigation, combat or progression. The missing tagCave_01 text remains.

The first post-save inventory contained 1,103 files; the 25 changed or added files
were all inside ModProbe. A second inventory also found no differences outside
that character. After stopping the second process, its experimental save was
retained separately and the original ModProbe folder restored. Readback matched
all 1,081 pre-test files by path and SHA-256. The original embedded script was
restored and its SHA-256 matched the prior recovery value. No main character was
loaded. No APK or GitHub release was produced.

Private evidence: save-map-observer-experimental.json,
gladiators-save-identity-first.json, gladiators-save-identity-second.json,
save-identity-save-comparison.json, save-identity-recovery.json and screenshots.
The prototype sources and game/save evidence remain local. Next work is a guarded,
manager-integrated map identity flow, isolated character storage, text registration
and actual gameplay testing before broader compatibility claims.

Localization follow-up: [one location label was displayed](2026-10-27-gladiators-localization.md) with a wide-text workaround; other tags and manager integration remain open.
