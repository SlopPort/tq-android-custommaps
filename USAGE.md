# How to use this project

## Can I install mods on my phone today?

**Not through a finished app from this repository yet.** There is no ready-to-install game APK here. The local 5364 test build imports mods and activates one recognized LootPlus specimen through the embedded manager. Other imported mods are not automatically supported.

You do not need to uninstall or change your game to read this project. Keep your existing installation and back up your characters before trying any future test build.

## What the prototype does

The mod manager offers **Add mod (ZIP / ARZ)**. It lets you select a file with Android's normal file picker, checks its basic structure, and stores a copy inside the importing application's private storage (game-private storage when embedded). Embedded LootPlus import, selection and activation have passed the laboratory checks. Runtime uses no root injection; installation and diagnostic readback used a rooted test phone.

**Imported means copied and checked. It does not mean enabled or compatible.** Select this mod saves a choice for the next fresh start. The runtime message separately reports whether the monitored database changes were verified.

## Local test-build workflow - not a complete release

These steps assume your locally prepared game already contains both the manager and embedded loader. Installing the standalone importer does not enable game activation. The tested input is LootPlus 1.3, identified by its size and SHA-256 in the [specimen report](reports/2026-10-27-lootplus-5364-activation.md).

1. Obtain a mod from its author's page. This repository does not supply third-party mods.

2. Open **Titan Quest Mods**, then tap **Add mod (ZIP / ARZ)**.

3. Choose the downloaded file, normally from Downloads. Do not manually copy it into Android/data.

4. If the ZIP contains separate variants, choose one and check the import result. XMAX variants can be imported, but activation is not supported. Only the recognized LootPlus specimen currently has an activation profile.

5. Save your character and return to character selection before switching. Open Titan Quest Mods, choose **Select this mod** or **Select vanilla (no mod)**, and wait for the selection-saved message.

6. Tap **Close app for a fresh start** and confirm only after saving. Reopen Titan Quest Mods and tap **Open game**. Choosing vanilla does not remove an active mod from a running process.

7. Enter character selection and wait about 15 seconds. Press Android Home, then tap the **Titan Quest Mods** launcher icon to read the runtime result while the game remains running. Do not close the app just to inspect this result. A verified database message covers three monitored fields, not the whole mod. If activation fails, close the app and select vanilla before a fresh start.

8. Test with a disposable character first. Saves are not separated by mod. Keep your main characters backed up.

The first setup will require a locally prepared copy of a lawfully obtained game. We have not verified that process against an unmodified store release. A ready-made patched game APK is not distributed here.

## Back up and restore characters (local test build)

Save your character, close the app, and reopen **Titan Quest Mods** without tapping **Open game**. Tap **Export character backup (ZIP)** and choose a location such as Downloads. Wait for the successful export message. Keep an additional copy on your computer: uninstalling the game or losing the phone must not be your only recovery option.

To restore, start the manager with the game stopped and tap **Restore character backup**. This replaces **all characters in SaveData**, not just the selected character. Choose a ZIP previously exported by this manager. Checksums are verified before replacement; the previous folder is retained under `Preferences/.SaveData-before-restore-...`. Keep that folder until you have checked your characters in the game. Do not start through the original game shortcut during backup or restore.

The test restored the same freshly exported saves without intervening gameplay: all 1,081 files matched their SHA-256 checksums after readback, and the user confirmed the character list was correct. Entering gameplay with restored characters remains unverified. Interruption recovery was tested on the host, not by killing the Android process. Backups do not provide separate character lists for different mods. See the [hardening report](reports/2026-10-27-release-hardening.md).

## Files accepted by the current importer

- A standalone `.arz` database, or a ZIP containing exactly one `.arz` database.

- ZIPs may also contain `.arc` resources, `.map` data and `.txt`/`.md` instructions.

- Current limits: 512 MiB expanded data and 4,096 entries.

- Multi-variant ZIPs such as XMAX are supported when each variant has its own database folder with one ARZ. Choose one variant; only that folder tree is imported. Ambiguous or nested layouts are rejected. Shared files outside the selected tree are not imported.

- Executables, source-record collections and other unsupported files are rejected.

## Common messages

| Message | Meaning |

| --- | --- |

| Imported; compatibility not tested | The file was copied. The game has not loaded it. |

| Exactly one ARZ database required | The archive layout cannot be imported as one mod. |

| Unsupported file in archive | This prototype does not accept one of the packaged file types. |

| Unsupported ARZ header | The database does not match the preliminary format check. |

| Unsafe archive path | The archive contains a path that the importer refuses to extract. |

## Reporting a problem

Include your game version, Android version, mod name/version, author-page link, exact message and the step that failed. Do not upload game APKs, saves, signing keys or third-party mod archives to issues. See [test results](reports/2026-10-27-importer-tests.md) and [publication boundaries](PUBLICATION.md).

## Perf in a locally prepared build

**Known issue:** tiny or missing labels have been observed with Perf enabled in the
in-game pause menu, including the Save game controls. Selecting vanilla does not
disable Perf. If this occurs, save when possible, close the game completely and
turn off the manager's Perf launch switch before starting a fresh process.
This is a temporary workaround; the overlay regression remains unresolved.
See the [investigation](reports/2026-10-29-pause-menu-investigation.md).

This option requires a build that includes the trusted Perf module. It is separate
from selecting a database or map mod. The public repository does not include a
ready-to-install game APK. A build without the module refuses a Perf-enabled start.

1. Open **Titan Quest Mods** on the Home screen. You can also request an optional
   **TQ Mods + Perf** shortcut with **Add manager to Home screen** and confirm
   Android's prompt. If it does not appear, drag **Titan Quest Mods** from the app
   drawer to the Home screen.
2. Turn on **Perf - engine optimizations and graphics menu**.
3. For the normal campaign, choose **Select vanilla (no mod)**. This keeps the
   Perf choice enabled while selecting the ordinary game database and saves.
4. Press **Open game**. With a supported custom map, Perf starts after the map
   adapter finishes activation at character selection. The **Perf** button at the top opens the in-game graphics
   and optimization menu. The locally included Traders add-on uses that overlay.
5. To change the launch choice, save your character, return to the manager, use
   **Close app for a fresh start**, then reopen the shortcut and choose again.
   Turning off the launch switch affects the next process, not the running game.

Use this manager shortcut when you want the configured Perf launch. Starting the
original game activity directly does not run the manager's bootstrap. Old root
injection must remain paused to avoid installing the same hooks twice. Each
native optimization still checks its own compatibility; an enabled launch switch
does not prove that every individual patch installed successfully.
