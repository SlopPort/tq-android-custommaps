# Separate-save routing extracted into a reusable module

`save-profile-runtime.js` replaces the fixed-path profile hook body with a callable
module. Its caller supplies the live and prepared-profile roots and a shared
native API preflight capability. All eight required addresses must be available
before the first hook is installed. Character saves use the save-folder getter;
caravan reads and writes have their own path redirection.

`resolve-save-profile.js` checks the startup process ID, selected library ID and
exact prepared-profile path. It is a contract check, not a filesystem validator:
the Java startup preparation must validate the actual directory first.

The native module terminates the process on routing/installation errors or either
of the two monitored cloud-save operations. This is an experimental refusal
policy, not complete cloud integration. The caller must install it before save
enumeration and retain its hooks for the process lifetime. The packaged manager
does not enable it yet; early startup ordering and map-module integration remain.

## Device evidence

- A new manager-layout profile was created using `SaveProfileStore.create` and
  validated with `resolvePrepared`. Its source was the existing disposable
  ModProbe lab profile, not the user's live character collection.
- In process 32380, a diagnostic wrapper passed that profile to the extracted
  module and combined it with the Gladiators map prototype. The startup request
  was constructed by the wrapper; this did not test manager selection end to end.
- ModProbe entered the custom interior. The game displayed its save confirmation.
- Comparing the profile with its preparation snapshot found changes to its
  `Player.chr` and backup copy. All 1,081 original live save files remained
  identical to the baseline inventory.
- No caravan calls occurred in this run. The module's caravan hooks therefore
  still need a dedicated device check after extraction; earlier prototype
  roundtrips are documented separately.
- The original loader script was restored and its hash checked. The game was
  stopped. Profile, snapshot, screenshots and diagnostic reports remain private.

Host tests: `ResolveSaveProfileTest.js` passed valid/vanilla, stale-startup,
missing-profile, mismatched-path and overlapping-root cases.
`SaveProfileRuntimeGuardTest.js` passed checks that missing preflight addresses
prevent hook installation and that installation errors invoke process abort.
These mocked tests do not establish native concurrency or cloud coverage.

Private evidence: `module-first-profile-module-report.json`,
`module-first-gladiators-world-probe.json`, `profile-module-save-check.json`, and
the world/save screenshots. No game assets or character saves are published.
