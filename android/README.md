# Rootless mod library prototype

Status: Java compilation and host importer tests passed. Embedded in an unsigned local APK; not installed or connected to engine activation.

`ModManagerActivity` is intended to be embedded in a locally patched, user-supplied game APK. It opens Android's document picker and copies selected ZIP/ARZ content into that application's private `files/tqmods/library` directory. It is designed to operate without root, ADB, broad storage permission, a companion file manager, or a network listener at runtime. A separate app would have a different UID and cannot provide the missing engine integration.

The current build registers a non-exported activity and an exported launcher alias. An in-game entry point remains future work. On-device launch and import are untested. Do not expose game-private files through an unrestricted provider. This repository contains original importer code only; no game APK, signing key, or proprietary binary is distributed.

The unsigned local APK predates the MAP-import fix. The capabilities below describe current source; rebuilding and device verification remain pending.

## Implemented

- Document picker, background import, readable imported names and explicit unverified status.
- UUID staging and commit on the same filesystem; failed imports are removed.
- ZIP path containment, path depth, entry count, expanded size, case-insensitive duplicate and extension checks.
- Exactly one ARZ; ARC, MAP and text companion files allowed. Recognizes the 04 00 03 00 ARZ prefix from the actual LootPlus specimen. This is not full archive or engine validation.
- 512 MiB expanded limit and 4,096 entries. These intentionally exclude some large maps; limits are prototype constraints.

## Required next steps

1. Sign locally, validate device launch, and add an in-process bootstrap; verify operation without root. Re-signing changes app identity for updates and may affect licensing or asset delivery. Preserve save/APK backups and do not bypass entitlement checks.
2. Use a self-contained script-mode Frida Gadget prototype or a native bridge, with no listener. Startup must return before waiting for engine initialization: blocking Gadget init while waiting for the engine can deadlock startup.
3. Move to one in-process owner for all hooks. Never run the existing root injector alongside embedded Gadget.
4. Add a version-gated database loader with main-thread execution before any character is loaded. Test on a disposable character. Rootless bootstrap and 5364 loader still require device proof.
5. Add selection, restart-to-apply, vanilla mode and mod-specific character policy. Import alone must never report activation.
6. Validate ARC mounting and custom maps separately. Database overrides on 5339 do not establish 5364 or map compatibility.

## Tests

Compile `src/org/tqmods/*.java` with Android API 36 android.jar. `tests/ModStoreTest.java` runs on a host JDK; optionally pass an author-downloaded LootPlus ARZ path. Checks valid standalone/wrapped imports, real specimen, path traversal, duplicate case variants, multiple ARZ files, disallowed native-code payloads, bad headers and failed-import rollback. Device UI, storage-provider failures, low-space behavior and native activation are untested.

References: [Android document picker](https://developer.android.com/training/data-storage/shared/documents-files), [Android storage restrictions](https://developer.android.com/about/versions/11/privacy/storage), [Frida Gadget](https://frida.re/docs/gadget/).
