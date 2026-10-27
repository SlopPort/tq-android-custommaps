# Titan Quest Android CustomMaps research

An experimental investigation of PC-authored custom mods on Titan Quest Ultimate for Android. This is a research log, not a general-purpose mod loader or a compatibility promise.

Unofficial project; no publisher endorsement. We publish original tools, not game APKs or assets. Users must supply their own lawfully obtained game copy. The supported scope excludes purchase-check removal and DLC unlocking. See [publication boundaries](PUBLICATION.md).

The [rootless importer prototype](android/README.md) imports and selects mods through Android's file picker. In the local 5364 test build, the embedded loader activated the recognized LootPlus specimen, returned monitored values to vanilla after a fresh start, and activated LootPlus again through the manager. Compatibility with a legitimate store installation or setup on a stock unrooted phone remains unverified.

Start with the [plain-language usage guide](USAGE.md) and [importer test results](reports/2026-10-27-importer-tests.md).

The 5364 results apply to a locally prepared third-party APK specimen tested on a rooted phone. Preparation from an unmodified store release remains unverified.

## Current status

On Android build 3.0.5339, retained code references CustomMaps discovery and map loading. A public LootPlus 1.3 bounce mod has been copied to the expected CustomMaps directory on a rooted Redmi Note 8. Device file hashes were recorded.

**Runtime database overrides were confirmed on builds 3.0.5339 and 3.0.5364.** On 5364, the selected LootPlus 1.3 specimen changed three monitored fields from 3/4/4 to 35/60/40, including delayed reads. The user reported that a short test-character gameplay/save check worked. This does not establish full gameplay compatibility. The manager is a separate launcher screen; ARC/map loading and save isolation are not implemented in the manager-integrated loader. See the [manager workflow evidence](reports/2026-10-27-manager-workflow.md).

See the [activation report](reports/2026-10-26-database-activation.md) and the [initial staging report](reports/2026-10-26-lootplus.md). This is a database-loading proof, not a complete Custom Game port.

## Laboratory map progress

Separate local prototypes mounted resource archives, entered Gladiators, saved,
and resumed world entry in two processes with a scoped save-identity correction.
A wide-text workaround displayed one location label. These experiments are not
selectable features in the manager and do not establish gameplay compatibility.
See [save resumption](reports/2026-10-27-map-save-enumeration.md) and
[localization](reports/2026-10-27-gladiators-localization.md).

## Scope

- Keep filesystem staging, engine discovery, activation, playable content, and save/reload results separate.

- Use a disposable test character for any activation attempt.

- Do not infer binary compatibility from ARZ/ARC filenames or a MAP header.

- Existing Perf and Traders runtime modules were present during the initial menu check; this is not a clean stock-game test.

No game binaries, save files, third-party mod archives, credentials, or decompiled game source are included. Download third-party mods from their authors.

## Next steps

1. Perform documented gameplay and save/reload tests beyond the user-reported short check.

2. Check cache invalidation and save/reload behavior.

3. Investigate ARC/map mounting and mod-name propagation separately.

4. Extend the guarded selection workflow only to mod/version combinations with separate evidence. XMAX activation remains unsupported; the inspected x2 engine record also changes unrelated mobile settings; see the [comparison](reports/2026-10-27-xmax-compatibility.md).
