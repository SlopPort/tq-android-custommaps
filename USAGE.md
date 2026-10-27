# How to use this project

## Can I install mods on my phone today?

**Not through a finished app from this repository yet.** There is no ready-to-install game APK or complete rootless mod loader here. The importer has been built into a local unsigned test APK, but that APK has not been installed and cannot activate mods yet.

You do not need to uninstall or change your game to read this project. Keep your existing installation and back up your characters before trying any future test build.

## What the prototype does

The mod manager offers **Add mod (ZIP / ARZ)**. It lets you select a file with Android's normal file picker, checks its basic structure, and stores a copy inside the game application's private storage. No root or broad file-access permission is needed for this import design; on-device rootless operation still needs testing.

**Imported means copied and checked. It does not mean enabled or compatible.** The prototype currently has no working Activate button.

## Planned phone workflow — not available as a complete release

1. Obtain a mod from its author's page. This repository does not supply third-party mods.
2. Open **Titan Quest Mods**, then tap **Add mod (ZIP / ARZ)**.
3. Choose the downloaded file, normally from Downloads. Do not manually copy it into Android/data.
4. Check the import result. A later release will provide mod selection and activation before loading a character.
5. Test with a disposable character first. Keep your main characters backed up.

The first setup will require a locally prepared copy of a lawfully obtained game. We have not verified that process against an unmodified store release. A ready-made patched game APK is not distributed here.

## Files accepted by the current importer

- A standalone `.arz` database, or a ZIP containing exactly one `.arz` database.
- ZIPs may also contain `.arc` resources, `.map` data and `.txt`/`.md` instructions.
- Current limits: 512 MiB expanded data and 4,096 entries.
- Multiple mod variants in one ZIP are rejected. Use a single variant package or its ARZ for an importer-only test. Importing only an ARZ omits its companion resources and does not establish that the mod will work.
- Executables, source-record collections and other unsupported files are rejected.

## Common messages

| Message | Meaning |
| --- | --- |
| Imported; compatibility not tested | The file was copied. The game has not loaded it. |
| Exactly one ARZ database required | The ZIP contains zero or multiple ARZ databases. |
| Unsupported file in archive | This prototype does not accept one of the packaged file types. |
| Unsupported ARZ header | The database does not match the preliminary format check. |
| Unsafe archive path | The archive contains a path that the importer refuses to extract. |

## Reporting a problem

Include your game version, Android version, mod name/version, author-page link, exact message and the step that failed. Do not upload game APKs, saves, signing keys or third-party mod archives to issues. See [test results](reports/2026-10-27-importer-tests.md) and [publication boundaries](PUBLICATION.md).
