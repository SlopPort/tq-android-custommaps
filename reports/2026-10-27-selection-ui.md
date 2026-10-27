# Selection UI prototype  -  2026-10-27

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


Added persisted selection of an imported mod and a vanilla selection button. Selection is user intent only; no engine code reads or applies it yet. UI explicitly says selected mods are NOT active. Vanilla selection does not unload an active database. Preferences are committed on the IO executor, with write failure reported.

Validation: standalone APK build completed using JDK 25, SDK 36 and build-tools 35.0.0. JDK 8 compiled the sources but failed at D8; this is not a passing full build. At the initial build stage, selection UI had not been installed; the device follow-up below supersedes that status. Existing embedded bootstrap installation remains unchanged.

Initial next step (selection persistence is now verified below): validate the 5364 database API and implement guarded activation before character loading. Do not treat a stored selection as activation evidence.

## Device follow-up

Installed the signed standalone test APK (SHA-256 81b4d683a015bfed8c6213155a912a23d2eaad488fb80297f7170dce3231fbbe) over org.tqmods.importtest without uninstalling. Signature verification passed. ADB incremental installation was unsupported; its streamed fallback succeeded.

On device 168a5011, the existing XMAX x2 library entry survived the update. Selecting it showed Selected only; NOT active. After force-stop and relaunch the selection remained visible. Selecting vanilla then force-stopping and relaunching removed the selected marker while retaining the imported entry. Local UI evidence: selected.xml, restart.xml, vanilla.xml, vanilla-restart.xml in the selection-import-test-02 test output directory.

These interactions used ordinary ADB UI input and UI hierarchy readback, with no root commands. This verifies persisted selection in the standalone app on the rooted test phone, not engine activation or an end-to-end stock-phone installation. The game APK and saves were not changed by this follow-up.
