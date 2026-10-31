# Player guide

You need a rooted phone with Magisk and Titan Quest installed (game build 3.0.5364, 64-bit phones). You do not need a computer.

## Install (once)

1. Download `tq-mods-magisk-1.0.zip` and `titan-quest-mods-1.0.apk` from the [Releases page](https://github.com/SlopPort/tq-android-mods/releases/latest).
2. Open **Magisk** → **Modules** → **Install from storage** → choose `tq-mods-magisk-1.0.zip`. Restart the phone when Magisk asks.
3. Open `titan-quest-mods-1.0.apk` from your downloads and install it. Android may ask you to allow installing apps from your browser or file manager first.
4. Open **Titan Quest Mods**. Tap **Allow root access**, then within a few seconds tap **Allow** (Grant) in the Magisk window.

If Magisk refused because the window closed by itself: open **Magisk** → **Superuser**, switch on **Titan Quest Mods**, and tap **Allow root access** again.

TQ Android Perf and TQ Traders are not needed and not included. Already using them? Update them to 2.4 and 1.4. Older versions would inject the game a second time, so the app shows "Mods are paused" until you update. Without Perf installed, the Perf switch in the app stays off and greyed out.

## Before the first try

**Settings and backups** → **Save a backup of my characters**. Save the file somewhere you can find again (for example Downloads) and copy it to a computer too.

## Play a mod

1. Download the mod on your phone. Mods usually come as a ZIP file and land in **Downloads**.
2. Open **Titan Quest Mods** and tap **Add a mod from a file**. Pick the ZIP.
3. If the ZIP has several versions of the mod, the app asks which one to add.
4. The mod appears in the list and is chosen (gold frame). Tap **Play**.
5. The first time, the app copies your characters for this mod. This takes a few seconds and happens once per mod.
6. In the game, wait a few seconds in the main menu, then open the character list as usual and pick a character.

Your original characters are not used by mods. Progress made with a mod stays with that mod.

Start the game with **Play** after you change your choice. The game's own icon starts whatever you played last.

## Go back to the original game

Open **Titan Quest Mods**, tap **Original game (no mods)**, then the green button.

If the game is still running, the button says **Restart the game with: …**. Save in the game first (game menu → Save), then confirm. The game closes and starts again with your choice.

## What the labels mean

| Label | Meaning |
| --- | --- |
| Tested | This exact mod file has been checked on a phone |
| Experimental | The app will load it; not every feature of the mod has been checked |
| Custom map – not supported yet | The mod has its own world, which cannot be played on Android yet |

## When something goes wrong

The top of the app shows one sentence about what happened, for example "the character list was opened before the mod loader was ready". The game is closed before it can save, so your characters are safe. Usually starting again with **Play** and waiting a few seconds in the main menu is enough.

| Message | What to do |
| --- | --- |
| The loader module is not installed | Install `tq-mods-magisk-1.0.zip` in Magisk and restart the phone |
| Mods are paused: update … | Update TQ Android Perf or TQ Traders, then restart the phone |
| This is a 7z or RAR archive | On a computer, unpack it and pack the folder again as ZIP |
| This game version is not supported | The loader only knows game build 3.0.5364 |
| This mod could not be loaded on Android | The mod's files did not load; choose another mod |

## Restore characters from a backup

**Settings and backups** → **Restore characters from a backup** → choose the ZIP. The game must be closed (**Settings and backups → Close the game**). Your current characters are kept in a hidden folder next to them (`Preferences/.SaveData-before-restore-…`).

## Uninstall

Remove the module in Magisk and restart, then uninstall the app. Mod copies of your characters stay in the game's private storage until you uninstall or clear the game; your original characters are never changed.

## Reporting a problem

Include the game version, Android version, mod name and version, the link to the mod's page and the exact message. Magisk's **Action** button on the module shows the last game start. Do not upload game APKs, saves or mod files.
