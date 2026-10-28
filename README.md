# Titan Quest mods. On Android.

**PC-authored mods can do more than sit in a folder on your phone.** In our Android tests, LootPlus changed the game's database, and Gladiators loaded a custom map with its resources, saved a test character, and resumed after a restart.

This project is turning those results into a practical mod manager: **pick a mod, play with separate saves, then switch back to vanilla.** Parts of that workflow already work in an installed test build. It is still experimental—not a finished mod loader or a promise that every PC mod will work.

### What has actually worked?

- **A database mod:** LootPlus activated from the manager, with three checked database values confirming the changes. ModProbe entered the world and saved into a separate profile.
- **A custom map:** Gladiators mounted seven resource archives, entered its custom world, saved and reloaded through the manager on the same installed APK.
- **Separate characters:** Creating and deleting a disposable character affected its mod profile. All **1,081 original save files** remained unchanged in that test.
- **Switching back:** Selecting vanilla restored the monitored stock database values after a fresh start. That check covered character selection, not a full vanilla playthrough.

Evidence: [manager-to-map roundtrip](reports/2026-10-28-integrated-profile-loader.md) · [profile character creation/deletion](reports/2026-10-28-profile-character-lifecycle.md) · [LootPlus profile test](reports/2026-10-28-lootplus-profile-background.md).

### Can I use it yet?

**Only as a locally prepared experimental build; no ready-to-install game APK is provided.** Use disposable characters, not your main save. The integrated gameplay tests are restricted to ModProbe. A current cloud-save guard can close the game when it goes into the background; that is an unresolved release blocker. Item persistence in stashes, combined-mod gameplay and the complete installation workflow still need validation.

The recent results come from a locally prepared third-party **3.0.5364 APK tested on a rooted Redmi Note 8**. Setup from an unmodified Google Play copy and operation on a stock, unrooted phone remain unverified. The manager uses Android's file picker, but that alone does not prove a root-free installation.

Start with the [plain-language guide](USAGE.md), explore the [Android prototype](android/README.md), or follow the [release checklist](RELEASE_MILESTONE.md).

Unofficial and not endorsed by the publisher. This repository contains original tools and documentation—not the game, APKs or mod assets. Supply your own lawfully obtained game copy and get mods from their authors. Purchase-check removal and DLC unlocking are outside the project's scope. See [publication boundaries](PUBLICATION.md).

## Scope

- Keep filesystem staging, engine discovery, activation, playable content, and save/reload results separate.

- Use a disposable test character for any activation attempt.

- Do not infer binary compatibility from ARZ/ARC filenames or a MAP header.

- Existing Perf and Traders runtime modules were present during the initial menu check; this is not a clean stock-game test.

No game binaries, save files, third-party mod archives, credentials, or decompiled game source are included. Download third-party mods from their authors.

## Next steps

1. Fix background/cloud handling while keeping mod saves isolated.
2. Verify deliberate stash and relic-item persistence across save/restart/reload.
3. Test a combined-mod gameplay package and explain conflicts clearly.
4. Finish fresh-import, setup and recovery checks through the user interface.

XMAX activation remains unsupported; the inspected x2 engine record also changes unrelated mobile settings. See the [comparison](reports/2026-10-27-xmax-compatibility.md).
