# LootPlus database activation: verified on Android

Date: 2026-10-26. Target: Titan Quest Ultimate 3.0.5339, ARM64, Redmi Note 8.

## Result

The unmodified PC LootPlus 1.3 ARZ was imported into the running game's database at character selection using `DatabaseArchive::Deserialize`. Three numeric loot fields read through the engine's record API changed from their stock values to the values independently extracted from the mod archive. This confirms runtime database overrides, not just file copying or a status flag.

| Record suffix | Field | Stock | Mod / runtime after import |
|---|---|---:|---:|
| sword/mi_l_potamoiwarrior.dbr | bothPrefixSuffix | 3 | 35 |
| torso/mastertables/monster/e_ratmanchampion.dbr | lootWeight2 | 4 | 60 |
| head/mastertables/monster/l_ratmanchampion.dbr | lootWeight2 | 4 | 40 |

The test succeeded in two fresh game processes. In the repeat, all three overrides were still present 300 menu updates after import. Existing Perf 2.3.1 and Traders modules remained installed. These are not stock-game results.

## Method

1. Extract numeric sentinels from local stock and mod ARZ files using `tools/find-sentinels.py`.
2. Append the one-shot probe to the existing Perf injection. Do not inject a second agent into the same process.
3. At `PlayMenu::Update`, wait 60 updates and refuse the import if `GetMainPlayer` reports a player. Read the stock records and require all three baseline values.
4. Read the staged 6,075,026-byte `LootPlus.arz`, keep its memory buffer alive, and call the engine's `DatabaseArchive::Deserialize(archive, bytes, length, false)` on the menu update thread.
5. Retrieve each record with `GetRecordIndexFromString` and `GetRecord`. Compare numeric fields at offsets independently established from both archives. `GetRecord` selects the appropriate compressed/uncompressed path; calling `GetUncompressedRecord` directly failed on the stock database.

The tested ARZ SHA-256 is `c9fc86f1229b1f0270c71a6df6338d01b3c5177a580352b2942681aeb7dd7b0c`. No archive content was rewritten. The probe is specimen-specific; its size check is not a cryptographic identity check. Verify the hash separately before running it.

## What did not work

- Static inspection shows `MenuManager::GetModsInternal` at RVA `0xd01244` is a single `ret` in the inspected binary. Retained outer discovery code does not establish functional discovery.
- Calling `LoadCustomMapDatabase` set the observed flag to 1, while the three sampled values remained stock. That flag alone is not evidence of success.
- The inspected `android_fopen` implementation tries Android assets and returns null when that route fails. An experimental exact-path external-file fallback did not produce sentinel changes in our attempts. The successful probe does not depend on that hook. The complete reason for the wrapper-path failure remains unresolved.
- Direct import changed the records while the custom-database flag remained 0. That further demonstrates why the flag is not the acceptance criterion.

## Limits

This is a database activation proof, not a complete Android Custom Game implementation. The mod's ARC and bounce map were not loaded, no custom menu was added, and no combat/drop-rate or save/reload test was performed. No campaign was intentionally launched during these tests. The original author intended activation through PC Custom Game; our experiment supplies a different activation route.

No claim is made that all records, other mods, custom maps, textures, or scripts are compatible. Changing the active archive can also leave already-instantiated objects with old cached data; gameplay integration requires a separate test.

## Artifacts

- `evidence/lootplus-sentinels.json`: independently extracted expectations.
- `evidence/lootplus-first-load.json`: first successful runtime result, with process identifiers and unrelated file traces omitted.
- `evidence/lootplus-repeat.json`: second successful import and delayed record readback.
- `tools/lootplus-proof.js`: experimental single-process proof, not a permanent mod manager.

The test add-on is disabled for subsequent launches. Restarting the game without this probe removes its runtime database import; the staged mod files remain in CustomMaps.

Validation: JavaScript syntax check passed; the published offline extractor reproduced the same three sentinels. The probe status `armed-at-character-selection` means only that the menu hook is installed; the later record readback is the acceptance evidence.
