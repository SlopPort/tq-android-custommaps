# Titan Quest Mods for Android

**A mod loader for Titan Quest on Android (Magisk): add a PC mod from a file, tap Play, switch back to the original game with one tap.** Each mod gets its own copy of your characters, so your normal saves are not touched.

It is experimental and unofficial. It works on one game build (3.0.5364, ARM64).

**[Download Titan Quest Mods 1.0](https://github.com/SlopPort/tq-android-mods/releases/latest)**: the app (`titan-quest-mods-1.0.apk`) and the Magisk module (`tq-mods-magisk-1.0.zip`).

> **Requirement: a rooted phone (Magisk) for the game from Google Play.**
> The Android game cannot load mods by itself: its PC mod-loading code is switched off, and it reads no game content from folders you can reach without root ([evidence](reports/2026-10-31-data-only-mods.md)). Mods therefore need a small loader running inside the game. The only ways to put it there without root are to rebuild the game APK or wrap it in a container app, and both mean defeating the publisher's license protection. **We will not do that.** With Magisk, the loader is injected into your unmodified game, so your purchased copy, its files and its signature stay as they are.
>
> We are sorry that this leaves out phones without root. A loader for everyone would need the developers to add mod support to the Android version.

### Install (once)

1. Install Titan Quest from Google Play as usual, and make a backup of your characters.
2. In Magisk: **Modules → Install from storage** → `tq-mods-magisk-1.0.zip`, then restart the phone.
3. Install `titan-quest-mods-1.0.apk` (allow installing from your browser or file manager when Android asks).
4. Open **Titan Quest Mods**, tap **Allow root access**, then tap **Allow** in the Magisk window.

**Perf and Traders are optional and not included.** This download contains only the mod loader. [TQ Android Perf](https://github.com/SlopPort/tq-android-perf) (graphics and speed) and [TQ Traders](https://github.com/SlopPort/tq-traders) (traders and respec) are separate Magisk modules that you install only if you want them. If you already use them, update them to 2.4 and 1.4. The game closes itself when something is injected into it twice, so when they are installed the mods module loads them in its own single injection, and the new versions stand back.

### Play

1. Open **Titan Quest Mods**.
2. Tap **Add a mod from a file** and pick the mod's ZIP from Downloads. The new mod is chosen automatically.
3. Tap **Play**. The first time, the app makes a separate copy of your characters for this mod.
4. Wait a few seconds in the game's main menu, then open the character list as usual.
5. To go back, tap **Original game (no mods)** and **Play**. If the game is running, the app reminds you to save and restarts it for you.

Always start the game with **Play** in the app after changing your choice; the game icon starts whatever you played last. The screen is in Polish on Polish phones and in English everywhere else. Backups of all characters and the Perf switch are under **Settings and backups**. Step-by-step guide: [USAGE.md](USAGE.md).

### Which mods work?

| Kind of mod | Status |
| --- | --- |
| Items, skills, masteries, balance, loot (database + resources, normal world) | **Loaded automatically.** Tested: Masteries 1.03 (new class names in game), LootPlus 1.3, Halloween 2012 (loaded at character selection) |
| Custom maps with their own world | Not yet. Mobile builds need navigation data that PC maps do not carry. Only Gladiators has an experimental adapter |
| Several mods at once | Not yet; one mod per game start |
| 7z or RAR downloads | Repack as ZIP on a computer for now; the app says so when you pick one |

"Loaded" means the files were mounted and the mod's records were found in the game database. It does not mean every part of a mod was played through. Evidence: [generic content mods](reports/2026-10-31-generic-content-mods.md), [LootPlus profile](reports/2026-10-28-lootplus-profile-background.md), [map roundtrip](reports/2026-10-28-integrated-profile-loader.md).

### Status

Version 1.0 is the first release of the Magisk route ([test report](reports/2026-10-31-magisk-route.md)). It was tested on one rooted Redmi Note 8 (Android 16) with game build 3.0.5364. That phone runs a third-party repack of the game, so a Google Play copy has not been tested yet; reports are welcome. This repository never distributes game APKs, game files or mods.

Make a backup before trying it (**Settings and backups → Save a backup of my characters**).

## How it works

- **App** ([android/src](android/src/org/tqmods)): imports ZIP/ARZ files through Android's file picker into its own storage, checks paths and sizes, records the choice and backs up or restores characters. It talks to the module through one root shell ([RootLink](android/src/org/tqmods/RootLink.java)).
- **Magisk module** ([magisk/module](magisk/module)): `tqmods.sh` copies the chosen mod into the game's private folder, makes the mod's copy of the characters once and starts the game. `service.sh` injects the loader into every game start about half a second after the process appears, together with Perf or Traders when they are installed. The game app itself is never changed.
- **Loader** ([profile-loader.js](android/bootstrap/profile-loader.js)): checks the fingerprints of every engine function it uses, redirects the save folder to the mod's copy, keeps cloud sync off for mod saves, and activates the mod at character selection: [generic-mod-runtime.js](android/bootstrap/generic-mod-runtime.js) mounts ARCs, overlays the ARZ and registers mod text.

If anything does not match, the game is closed before a save can be written and the app explains what happened in one sentence. The engine reads the save folder only when the character list opens, many seconds after the injection; if the list was somehow read before the loader was ready, the loader refuses instead of mixing characters.

An older development route embeds the same loader as a Frida Gadget in a locally rebuilt APK ([GameBootstrapActivity](android/bootstrap/GameBootstrapActivity.java)); it is not distributed.

## Known issues

- With Perf enabled, labels in the in-game pause menu can be tiny ([investigation](reports/2026-10-29-pause-menu-investigation.md)).
- Database values that the engine read before character selection may stay at stock values.
- Custom-world navigation: see the [single-level experiment](reports/2026-10-30-single-level-navigation.md).

## Developers

Build the module with `python magisk/build.py` and the app with `python tools/build-import-test.py --manager --jdk ... --sdk ... --out ...` (sign it with your own key). Run the host tests with Node.js and a JDK:

```text
for f in android/tests/*.js; do node "$f"; done
python tools/check-publication.py
```

Build steps: [android/BUILD-TEST-APP.md](android/BUILD-TEST-APP.md). Research tools: [tools/README.md](tools/README.md). Open work: [TODO.md](TODO.md).

Third-party components: [THIRD-PARTY.md](THIRD-PARTY.md). Unofficial and not endorsed by the publisher. Supply your own lawfully obtained game and get mods from their authors. Purchase-check removal and DLC unlocking are outside this project's scope. See [publication boundaries](PUBLICATION.md).
