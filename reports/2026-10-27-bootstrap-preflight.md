# Rootless bootstrap preflight

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


Status: built locally; device execution blocked and NOT performed.

The separate org.tqmods.importtest test application includes an explicit diagnostic activity and Frida Gadget 17.22.1 for Android arm64, obtained from the official Frida release. Script interaction is configured with no listener. The script returns immediately from init and polls for libtq.so on a timer, writing a diagnostic report. It installs no hooks and activates no mods. The standalone harness should report enginePresent=false; this is expected, since it contains no game library.

The activity loads the library through System.loadLibrary and displays the script report. Neither the application manifest nor the diagnostic code requests root access. This demonstrates the intended architecture, not successful runtime behavior.

Local APK SHA-256: aa9dd055d5502ee0f0d9a7bc8f182705a0d21ff8f0616ffe36e576f95ae79b50. Original Java source compilation, DEX generation, packaging and signing completed. JavaScript syntax and repository publication hygiene checks passed. The test key and APK remain local; no dependency binaries are committed.

The attempted ADB install/start did not execute: automatic approval review was unavailable due to an account usage limit. This was not a safety determination. Do not bypass this gate or describe the bootstrap as device-tested. The previously installed importer remains the last verified device version.

Resume with the normal approval path: install bootstrap-test.apk as an update to the separate test app, launch BootstrapProbeActivity, verify a fresh report with the current process ID, advancing ticks, hooksInstalled=false and modsActivated=false. Verify restart and no startup hang. Only then integrate the bootstrap into a local game build, preserving entitlement checks and avoiding concurrent root injection. Game APK replacement requires a fresh save/data backup. Embedded-game startup and 5364 mod activation remain unverified.

## Subsequent device execution: PASS

Normal approval became available again. Updated standalone test APK SHA-256: 8b3cd7c1ad39d89fcbfc73d70867f452b964cadcf93e67840e7d0f7d8c52b340. Install succeeded. Probe showed PID 13549, ticks 2 then 18. After force-stop/relaunch it showed PID 13643, ticks 2. Both reported enginePresent=false, hooksInstalled=false, modsActivated=false, as expected. No root calls were used. This supersedes the earlier execution block for this standalone test only.

A separate GameBootstrapActivity and local integration script have now been added. They load Gadget and start the original game activity without modifying game libraries or entitlement checks. Game installation/startup is not yet verified. A fresh backup and disabling the root injector are required before that test.
