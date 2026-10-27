# Device importer test — 2026-10-27

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


PASS: standalone importer UI on the project test phone (Redmi Note 8 / Android 16). This is not an embedded-game or rootless game-loader test.

Built original ModStore and ModManagerActivity into a separate package, org.tqmods.importtest. Manifest requests no permissions; no su calls, root injector or native libraries are present. APK SHA-256: db8944f0ccafeb1a0fab5b3e4d71812308c4c1dcc5c175aaf4d814c91f80deb5. Device is rooted, but the tested import path uses normal app storage and the system document picker. ADB was used to install, stage the input in Downloads and automate taps; end-user import did not depend on ADB APIs.

Verified sequence:
1. Launch manager.
2. Add mod opens Android DocumentsUI.
3. Select original XMAX ZIP from Downloads.
4. Variant dialog appears (x2, x3, x4, xmax and xmax+ visible; remaining choice requires scrolling).
5. Choose x2. UI reports import success and lists the selected variant as compatibility untested.
6. Force-stop and relaunch manager. The imported x2 entry persists.

Input archive is the previously tested XMAX 1.1 ZIP. Host tests already compared each variant's files byte-for-byte; this device test verifies the picker/UI/import/persistence path, not a phone-side byte comparison. Cancellation, rotation during import, low storage and other document providers remain untested.

Game installation and saves were not replaced. The standalone app cannot access the game's private data and is only a test harness. Next: integrate the same UI and an in-process bootstrap into the game, then validate one database mod before any character is loaded. No claim of working rootless mods or 5364 engine activation.
