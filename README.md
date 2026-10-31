# Titan Quest mods. On Android.

**A mod manager for Titan Quest on Android: add a PC mod from a file, tap Play, switch back to the original game with one tap.** Each mod gets its own copy of your characters, so your normal saves are not touched.

It is experimental and unofficial. It works on one game build (3.0.5364, ARM64) and still needs a locally prepared game APK — see [Can I use it?](#can-i-use-it).

### What it looks like to a player

1. Open **Titan Quest Mods**.
2. Tap **Add a mod from a file** and pick the mod's ZIP from Downloads. The new mod is chosen automatically.
3. Tap **Play**. The first time, the app makes a separate copy of your characters for this mod.
4. To go back, tap **Original game (no mods)** and **Play**. If the game is running, the app reminds you to save and restarts it for you.

The screen is in Polish on Polish phones and in English everywhere else. Backups of all characters and the optional Perf graphics module are under **Settings and backups**.

### Which mods work?

| Kind of mod | Status |
| --- | --- |
| Items, skills, masteries, balance, loot (database + resources, normal world) | **Loaded automatically.** Tested: Masteries 1.03 (new class names in game), LootPlus 1.3, Halloween 2012 (loaded at character selection) |
| Custom maps with their own world | Not yet. Mobile builds need navigation data that PC maps do not carry. Only Gladiators has an experimental adapter |
| Several mods at once | Not yet; one mod per game start |
| 7z or RAR downloads | Repack as ZIP on a computer for now; the app says so when you pick one |

"Loaded" means the files were mounted and the mod's records were found in the game database. It does not mean every part of a mod was played through. Evidence: [generic content mods](reports/2026-10-31-generic-content-mods.md), [LootPlus profile](reports/2026-10-28-lootplus-profile-background.md), [map roundtrip](reports/2026-10-28-integrated-profile-loader.md).

### Can I use it?

**Not as a one-tap install yet.** The manager and loader live inside the game app, so a game APK with them added has to be prepared locally. This repository never distributes game APKs, game files or mods. Tests ran on a rooted Redmi Note 8 (Android 16); setup from a Google Play copy on an unrooted phone is not verified, and a store build may refuse to run after being re-signed. Making installation possible without rebuilding the game is the main open problem.

Use a backup before trying it (**Settings and backups → Save a backup of my characters**).

## How it works

- **Manager** ([android/src](android/src/org/tqmods)): imports ZIP/ARZ files through Android's file picker into app-private storage, checks paths and sizes, records the choice and backs up or restores characters.
- **Startup** ([GameBootstrapActivity](android/bootstrap/GameBootstrapActivity.java)): prepares the mod's save copy, freezes the choice for this process and starts an embedded Frida Gadget script before the engine loads.
- **Loader** ([profile-loader.js](android/bootstrap/profile-loader.js)): checks the fingerprints of every engine function it uses, redirects the save folder to the mod's copy, keeps cloud sync off for mod saves, and activates the mod at character selection: [generic-mod-runtime.js](android/bootstrap/generic-mod-runtime.js) mounts ARCs, overlays the ARZ and registers mod text.

If anything does not match, the game is closed before a save can be written and the manager explains what happened in one sentence.

## Known issues

- With Perf enabled, labels in the in-game pause menu can be tiny ([investigation](reports/2026-10-29-pause-menu-investigation.md)).
- Database values that the engine read before character selection may stay at stock values.
- Custom-world navigation: see the [single-level experiment](reports/2026-10-30-single-level-navigation.md).

## Developers

Run the host tests with Node.js and a JDK:

```text
for f in android/tests/*.js; do node "$f"; done
python tools/check-publication.py
```

Build steps: [android/BUILD-TEST-APP.md](android/BUILD-TEST-APP.md). Research tools: [tools/README.md](tools/README.md). Open work: [TODO.md](TODO.md).

Unofficial and not endorsed by the publisher. Supply your own lawfully obtained game and get mods from their authors. Purchase-check removal and DLC unlocking are outside this project's scope. See [publication boundaries](PUBLICATION.md).
