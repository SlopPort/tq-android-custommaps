# Installed manager-to-map roundtrip

The opt-in profile loader now connects the frozen startup selection, native API
preflight, early save-profile routing and menu-time map/database activation.
The supported map test remains limited to ModProbe. This is progress toward the
release checklist, not completion of the general-user workflow.

## Installed test

Local APK SHA-256:
`4b50bc2f8b04fafccbe239c8aabaff2ab15012e9ca0a15bea07085105de1f98c`.
The APK and its game assets remain private. A fresh 4.37 GB files/preferences
backup was captured before installation; older APKs were retained.

Using the already imported Gladiators entry and already prepared disposable
profile, the following actions used the manager interface. ADB automated input
and collected evidence, but did not rewrite selection files or runtime scripts
between these runs:

1. Select Gladiators and press **Open game**. Process 6084 read the manager's
   startup snapshot, installed profile routing, mounted seven archives and
   verified three database sentinels. ModProbe entered the custom interior, and
   the game's save-confirmation dialog appeared after saving.
2. Use **Close app for a fresh start**, reopen the manager and press **Open game**.
   Process 7090 loaded ModProbe into `maps/gladiators.map`; `World::Load` returned 1.
3. Close through the manager, select **vanilla**, and press **Open game**.
   Process 7776 reported no mod activation or profile routing. Three monitored
   database values matched their stock baseline at character selection. No
   vanilla-world gameplay was performed in this run.
4. Select the unsupported Halloween entry and start. Process 8320 wrote a refusal
   report and exited; a subsequent process lookup returned no game PID.
5. Select vanilla again and close. All 1,081 original save files still matched
   the baseline inventory, without added or missing files.

Private evidence: `integrated-map-first.json`, `integrated-map-restart.json`,
`integrated-vanilla.json`, `integrated-unsupported-refusal.json`,
`integrated-final-save-check.json`, and the world/save screenshots.

## Corrections found by installation testing

Android supplied the app directory through `/data/data`, while checks in another
execution context used `/data/user/0`. Startup now resolves the trusted app base
and the native contract permits only the two explicitly configured app roots;
arbitrary profile paths and redirected children remain refused.

The fatal native call now explicitly uses `exceptions: 'propagate'`.
[Frida documents](https://frida.re/docs/javascript-api/#nativefunction) that the
default behavior can convert native exceptions into JavaScript exceptions.
The installed unsupported-mod test verified process termination with the new
setting. Earlier mocked abort tests did not prove that behavior on the device.

## Validation and remaining gates

All 12 JavaScript test files passed before installation. The updated
`StartupSelectionTest` passed on Android, including the trusted app-directory
alias case. The final APK passed signature verification and installed successfully.

Fresh ZIP import and profile preparation were not repeated through this UI run:
the existing library and ModProbe profile were reused. Profile-only character
enumeration, creating/deleting characters, deliberate stash/item persistence,
database-mod gameplay with the integrated profile, and a gameplay-tested mod
combination remain open. UI wording still needs to distinguish the new test mode
from the older inactive-profile prototype. Unsupported-mod refusal currently
closes the process; a clearer pre-start error screen is still needed. Google Play
installation remains unverified.
