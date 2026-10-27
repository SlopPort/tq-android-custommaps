# Engine-owned ARC mount and restart round trip

## Measured on Android 5364

The diagnostic ran inside the existing PlayMenu update callback, after checking
that no main player was loaded. Function exports and complete byte fingerprints
were verified before calls. It used the FileSystem returned by the live engine,
not a separately constructed test object.

Before registration, group counts were `[0, 163]`, and all three names under the
unique `tq_global_probe/` prefix were absent. LootPlus, Gladiators and Halloween
map archives were then registered in group 0. All three registrations returned 1;
counts became `[3, 163]`.

| Lookup | Extracted size | FNV-1a | Expected result |
| --- | ---: | --- | --- |
| `tq_global_probe/main.map` | 164 | `24eca960` | Match |
| `tq_global_probe/gladiators.map` | 2,866,820 | `1f214379` | Match |
| `tq_global_probe/activate.map` | 164 | `fb5f3bc3` | Match |

The selected database remained vanilla. Its three existing sentinel values were
3, 4 and 4; no database mutation was attempted. This checks those sentinels, not
the entire database or every stock source's contents.

## Restart control

A new process ran the same lookup diagnostic with registration disabled. Counts
were `[0, 163]`, and all three names were absent again. A later menu-callback
recheck also passed, with unchanged counts. Thus these runtime registrations did
not survive process restart.

The first mount run did not receive its intended delayed recheck: the original
callback gated rechecks on a database-mutating experiment, whereas this run used
vanilla verification. The local generator was corrected for the restart-control
run. Do not interpret the mount run as a long-duration stability test.

## Automation and cleanup

A brief injected tap did not navigate the main menu. A 180 ms same-position
touch gesture succeeded and was used again for the restart control. This is
device evidence for those two attempts, not a general input reliability claim.

Root installed the temporary diagnostic scripts; runtime registration itself
used the embedded runtime in the game process. This does not establish a non-root
installation workflow. The original script was restored and its SHA-256 checked:
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The manager was reopened. No character was loaded or save operation requested.
A fresh local backup was read and inventoried: 1,081 save files, 10,293,441 bytes.
Game content and backup files are not publication artifacts.

## World-entry work and limitations

No custom world was entered. The unique prefix deliberately avoided stock-name
overrides. Textures, quests, NPCs and mod databases were not activated by this
experiment; it does not establish gameplay compatibility among the three mods.

Static inspection identified `LoadingScreen::GetSaveGame` at `0xbe31a8`. It reads
GameInfo's player name, level name and difficulty, searches saved-game records,
and can reach `Game::CreateNewPlayer` when no matching record is found and its
creation flag is enabled (`0xbe32d8` through the call at `0xbe3330`).
`Game::LoadGame` uses the map path from its SaveGameInfoStruct. Consequently,
setting a map path alone is not sufficient evidence of correct character/save
selection. The next world-entry prototype must establish that relationship and
restrict itself to the test character before attempting gameplay.
