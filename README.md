# Titan Quest Android CustomMaps research

An experimental investigation of PC-authored custom mods on Titan Quest Ultimate for Android. This is a research log, not a general-purpose mod loader or a compatibility promise.

Unofficial project; no publisher endorsement. We publish original tools, not game APKs or assets. Users must supply their own lawfully obtained game copy. The supported scope excludes purchase-check removal and DLC unlocking. See [publication boundaries](PUBLICATION.md).

The [rootless importer prototype](android/README.md) now compiles and has been embedded in an unsigned local APK. It has not been installed or connected to engine activation. Compatibility with a legitimate store installation remains unverified.

Start with the [plain-language usage guide](USAGE.md) and [importer test results](reports/2026-10-27-importer-tests.md).

## Current status

On Android build 3.0.5339, retained code references CustomMaps discovery and map loading. A public LootPlus 1.3 bounce mod has been copied to the expected CustomMaps directory on a rooted Redmi Note 8. Device file hashes were recorded.

**Runtime database overrides were confirmed on build 3.0.5339 through an experimental loader.** Mod activation on 5364 has not been demonstrated. The unmodified LootPlus 1.3 ARZ changed three live loot fields from 3/4/4 to the expected 35/60/40 in two fresh game processes. The normal mobile menu still has no observed mod selector; ARC/map loading, gameplay effects, and save/reload remain untested.

See the [activation report](reports/2026-10-26-database-activation.md) and the [initial staging report](reports/2026-10-26-lootplus.md). This is a database-loading proof, not a complete Custom Game port.

## Scope

- Keep filesystem staging, engine discovery, activation, playable content, and save/reload results separate.
- Use a disposable test character for any activation attempt.
- Do not infer binary compatibility from ARZ/ARC filenames or a MAP header.
- Existing Perf and Traders runtime modules were present during the initial menu check; this is not a clean stock-game test.

No game binaries, save files, third-party mod archives, credentials, or decompiled game source are included. Download third-party mods from their authors.

## Next steps

1. Test database overrides during gameplay on a disposable character.
2. Check cache invalidation and save/reload behavior.
3. Investigate ARC/map mounting and mod-name propagation separately.
4. Design a reversible selector only after those results.
