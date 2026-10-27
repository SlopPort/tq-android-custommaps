# Research tools

`compare-mod-records.py` compares two locally extracted ARZ v3 databases without changing them:

```text
python tools/compare-mod-records.py first.arz second.arz
python android/tests/ModOverlapTest.py
```

This is a trusted-input research parser, not a hardened importer. It resolves each database's string table before comparing shared records and lists differing fields. Zero overlapping records does not prove compatibility. It does not examine ARC files, scripts, references or gameplay and never merges or activates mods. See the [tested pair matrix](../reports/2026-10-27-mod-combinations.md).

`find-sentinels.py` reads local stock and LootPlus ARZ files and writes three differing numeric loot fields:

```text
python tools/find-sentinels.py path/to/stock.arz path/to/LootPlus.arz sentinels.json
```

Uses Python's standard library. It is a small trusted-input research parser, not a hardened validator for arbitrary archives.

`lootplus-proof.js` is the tested one-shot Frida probe for Titan Quest Ultimate **3.0.5339 ARM64** and the exact LootPlus 1.3 specimen documented in the report. It imports the database in memory at character selection and checks three numeric fields immediately and 300 menu updates later. It does not install a user-facing selector, mount ARC files, load the bounce map, or persist activation across restarts.

Prerequisites: back up saves, verify the game build and the report's mod SHA-256, and stage the mod at the exact path in the script. The probe only checks specimen size and baseline sentinel values, not the full binary or mod hash. Keep the game at character selection; do not launch a campaign during this database-only test.

The on-device experiment used the existing tq-android-perf single-injection add-on mechanism: a separate experimental module directory supplied `tq-addon.js`, then the game was restarted. Do not attach a second agent to an already-injected game. The probe refuses import when `GetMainPlayer` returns a player, but this is not a general save-safety guarantee.

The result is written to the game's private cache as `tq-custommaps-proof.json`. `verified-stable-record-overrides` means the three sampled database fields matched the mod immediately and at the delayed check. It does not mean gameplay or save compatibility was tested.

Disable the test add-on and restart the game to remove the runtime import. Staged CustomMaps files remain. No game binaries or mod archives are distributed here.
