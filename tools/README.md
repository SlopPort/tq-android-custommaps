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

### Integrated profile/map test (developers only)

`embed-bootstrap-probe.py --enable-profile-lab` bundles the profile loader instead
of the diagnostic/database-only script. Include the current bootstrap Java classes
when building locally. This mode reads the startup snapshot, requires a prepared
separate save copy for a selected mod, and limits character loading to **ModProbe**.
It is not the general-user release: character-list isolation, stash transfers and
the final recovery workflow still need acceptance testing. Selecting vanilla
starts without profile hooks. Keep all APKs, Gadget inputs, mods and saves local.

## Combination database preflight

Run `python tools/plan-mod-combination.py first.arz second.arz --map-input 0`
on trusted, extracted local databases. The optional zero-based map input identifies
the sole custom-map provider. Two map inputs, duplicate database contents or fewer
than two inputs are rejected. Different definitions of a shared normalized record
produce `refused-record-conflicts` and exit code 1; invalid arguments exit 2.
Identical record definitions are reported separately.

The JSON binds each input to its SHA-256, records the comparisons and lists
remaining resource/runtime checks. `activationAllowed` is always false: this is
read-only planning, not a merger, engine compatibility test or manager activation.
The underlying research parser is intended for trusted local files, not arbitrary
untrusted uploads. Run `python tools/test-mod-combination.py` for synthetic
conflict, path-normalization, string-index and map/duplicate policy tests.

## Optional Perf launch module

For local profile-loader builds, `embed-bootstrap-probe.py --enable-profile-lab
--perf-script /path/to/trusted-perf.js ...` wraps a supplied Perf runtime script
and captures its initialization callback. The manager's persistent Perf switch is
copied into the startup snapshot and controls the next process. Perf is off by
default; the build must actually include the module to enable it. Add-ons already
included in that trusted script are retained. Do not supply untrusted JavaScript.
This option does not download modules or distribute a game APK.
