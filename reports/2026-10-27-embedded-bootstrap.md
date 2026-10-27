# Embedded bootstrap device test  -  2026-10-27

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


Result: game menu reached and embedded Gadget detected libtq.so in its own process. Mod activation is NOT implemented by this probe.

Local game APK SHA-256: 38f9ade1e3a7638ad688b60f3b911a264341b77aed00eb5e719d27ea6a4304f2. Based on the existing local 3.0.5364 test specimen; this does not establish compatibility with an unmodified store APK or its entitlement system. No game binaries are published.

Before replacement, the user confirmed saving. Root perf injector paused. Fresh backup tar contained 1,097 files including 1,077 save files; phone and PC SHA-256 both fadb670b4a3eef875738b3800665c9c3d77b4b40235574ca9ee8400883418d0a. Extra private files and module state backed up separately. Assets preserved outside app data before uninstall, then restored with the new UID and SELinux contexts. Root was used for this laboratory migration and diagnostic readback, not to inject or start Gadget. This is not proof that the entire installation/migration workflow is rootless.

Signed APK installed successfully with UID 10185. GameBootstrapActivity loads the embedded library and starts the original game activity. Report: PID 14276, ticks 18, enginePresent=true, hooksInstalled=false, modsActivated=false. Screenshot confirms the rendered Polish main menu and version 3.0.5364. Post-restore SHA-256 comparison against the fresh backup: all 1,077 save files identical, none missing or changed. An earlier comparison against the old pre-5364 backup was historical and is not the migration acceptance result.

Perf/Traders root injection remains paused to avoid two runtimes in one process. Their restored configuration is preserved, but those features are not active in this diagnostic game session. At this initial checkpoint, character gameplay, embedded manager import, restart behavior and database activation required testing. The follow-up below confirms bootstrap restart only. Keep previous APKs, saved data and module backups for rollback.

## Restart and embedded manager follow-up

A force-stop followed by GameBootstrapActivity produced a new process, PID 15013. The report reached tick 9 with enginePresent=true, hooksInstalled=false and modsActivated=false. This confirms embedded bootstrap startup after process restart for this specimen.

Opening org.tqmods.Launcher displayed the Mod library import prototype and ADD MOD (ZIP / ARZ) button under package com.hg.titanquestultimate. Device UI evidence is retained locally as embedded-manager-window.xml. The library is empty in this game package; the standalone importer library is separate. Import into the embedded manager and engine activation remain untested. Root was used only to read the private diagnostic report during this follow-up; activity launches used ADB.
