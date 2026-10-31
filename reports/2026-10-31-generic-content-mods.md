# Generic content mods and the simplified manager

Date: 2026-10-31. Device: rooted Redmi Note 8, Android 16, game build 3.0.5364.
Root was used only to install the test build and read reports; the tested
runtime path ran inside the game process without root injection.

## What changed

- **No allowlist for content mods.** A mod that is not one of the recorded
  specimens is now loaded as a *content mod*: its ARC resources are mounted in
  the engine's first resource group, its ARZ is overlaid on the loaded database
  and the tags in `Text\modstrings.txt` are registered. The stock world is
  kept. Mods with their own world map (a `.map` larger than 4 KiB in
  `Maps.arc`) are still refused unless an adapter exists (Gladiators).
- **Any character.** The ModProbe-only test scope was removed. Every mod has
  its own copy of the save folder, so all characters in that copy belong to it.
- **Activation on a fast start.** If the player opens a character before the
  menu hook has activated the mod, activation now runs at the start of
  `LoadGame` instead of closing the game.
- **Save copy created on first start.** The manager no longer has a separate
  "prepare copy" step; the startup screen creates the copy once.
- **One-button switching.** When the game is running and a different mod is
  chosen, the Play button restarts the process into the new choice after a
  save reminder.
- **Importer.** Loose PC-install extras (textures, images) are skipped instead
  of rejecting the whole ZIP; program files are still rejected. 7z/RAR
  archives get a plain explanation. Imported mods can be removed. A newly
  added playable mod is selected automatically.
- **Manager UI.** Rebuilt for non-technical players: one large Play button,
  mod cards with a plain status label, short instructions, settings and
  backups folded away. Polish on Polish phones, English otherwise.

## Device results

| Test | Result |
| --- | --- |
| Import Masteries 1.03 ZIP (two variants) through the Android picker | Variant dialog shown; base variant imported and auto-selected |
| Start with Masteries (unknown to the loader) | First-start save copy made; 5 ARCs mounted, 1,878 records loaded (16 sampled names resolved), 641 text tags registered |
| Load an existing character copy with Masteries | Entered the world; class title changed from the stock name to the mod's "Animalist"; health changed with the replaced skills |
| Switch to vanilla from the running game | New process started without a mod; game in front |
| Start with Halloween 2012 (unknown to the loader) | 7 ARCs mounted, 2,727 records loaded, 1 text tag registered; gameplay not checked |
| Import a 7z archive renamed to `.zip` | Refused with the 7z/RAR explanation |
| Original saves after all runs | 1,081 files compared by SHA-256 with the pre-test backup: 0 changed, 0 missing, 0 added |

Perf was enabled during these runs (the phone's existing setting).

## Limits

- Content mods are loaded on top of the stock database at character
  selection. Data that the engine read before that moment may keep stock
  values. Masteries' mastery choice for a new character, item drops and
  long play were not checked.
- Only one mod at a time. Resource or record conflicts between mods are not
  handled.
- Custom worlds still lack mobile navigation data (see the October 30
  report); only the Gladiators adapter exists.
- Text files in Windows-1252, UTF-8 and UTF-16LE are decoded; other code
  pages are read as Windows-1252.
- The installation still requires a locally rebuilt game APK. See README.
