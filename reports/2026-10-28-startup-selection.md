# Startup selection and prepared-profile validation

The bootstrap now copies the manager selection into `startup-request.json` before
loading Gadget. The experimental loader reads that snapshot and checks its
process ID before resolving the selected mod. Editing `request.json` afterwards
does not alter the startup snapshot. A second bootstrap launch in the same
process is refused; a fresh process is required after loader initialization.

If a separate profile exists for the selection, startup validates its metadata,
directory boundaries and filesystem entry types and limits. Missing or mismatched preparation metadata,
symbolic links, overlap with live saves, and unsupported filesystem entries are
refused. Validation permits normal gameplay changes and new map files: it does
not demand that a played profile match its original backup.

**Profile routing is still inactive in the packaged workflow.** The snapshot
records `runtimeBound: false`. This change prepares the startup contract for the
native map/profile integration; it does not make the existing loader use the
separate copy. The caller must exclude concurrent writers during validation and
startup. The checks do not protect against a privileged process replacing files
after validation.

## Validation

- `SaveProfileTest`: host passed; symbolic-link creation was unavailable on that
  Windows host. Android execution passed, including symbolic-link refusal.
- `StartupSelectionTest`: passed on the Android test phone using the platform
  `AtomicFile` and JSON implementations. Covered default vanilla, independent
  snapshots, validated inactive profiles, malformed selection, and incomplete
  profile refusal without replacing the previous snapshot.
- `StartupPidTest.js`: passed; stale/missing process IDs never reached selection
  resolution, while the current process ID did.
- `BootstrapProbeTest.js`: passed existing compatibility checks.
- The standalone APK, including bootstrap classes, compiled successfully.

Android helper tests ran in temporary directories through `app_process`; they
did not launch gameplay or replace the installed game APK. The activity lifecycle
and the final manager-to-game flow still require installation testing. Original
game saves were not used by these synthetic tests.
