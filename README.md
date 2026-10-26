# Titan Quest Android CustomMaps research

An experimental investigation of PC-authored custom mods on Titan Quest Ultimate for Android. This is a research log, not a working mod loader or a compatibility promise.

## Current status

On Android build 3.0.5339, retained code references CustomMaps discovery and map loading. A public LootPlus 1.3 bounce mod has been copied to the expected CustomMaps directory on a rooted Redmi Note 8. Device file hashes were recorded.

**Successful discovery by the game, activation, and gameplay are not yet confirmed.** The observed mobile main menu showed no Custom Game button before staging or after the post-staging restart. The character-selection screen was subsequently inspected; no custom-map selector was visible in the observed view.

See [the initial staging report](reports/2026-10-26-lootplus.md).

## Scope

- Keep filesystem staging, engine discovery, activation, playable content, and save/reload results separate.
- Use a disposable test character for any activation attempt.
- Do not infer binary compatibility from ARZ/ARC filenames or a MAP header.
- Existing Perf and Traders runtime modules were present during the initial menu check; this is not a clean stock-game test.

No game binaries, save files, third-party mod archives, credentials, or decompiled game source are included. Download third-party mods from their authors.

## Next steps

1. Trace how the mobile character-selection menu selects its game mode.
2. If no selector is exposed, measure the retained discovery path separately from attempting activation.
3. Investigate mod-name propagation before implementing a launcher.
4. Test loading on a disposable character, followed by save/reload only if loading succeeds.
