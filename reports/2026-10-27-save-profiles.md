# Independent save-profile storage

SaveProfileStore creates a complete, independent copy of SaveData for a library
UUID. It captures a checksummed ZIP using SaveBackup, restores and verifies that
snapshot inside a private staging directory, writes profile metadata, and renames
the completed directory into place. The snapshot is retained with the profile.
It does not swap, redirect, or write the live SaveData tree.

Existing profiles are refused rather than overwritten. Invalid IDs, overlapping
source/destination trees, unavailable sources and an engine-loaded caller flag are
refused. Failed staging is retained for diagnosis and can occupy disk space. The
caller must establish that the engine is stopped; the flag is not independent
process detection. The manager uses its existing current-process engine check and
busy gate before invoking this operation. Cross-process writers are not covered.

## Tests

SaveProfileTest passed on the host and on the connected Android phone through a
separate app_process invocation using a temporary synthetic dataset. It verified
byte-identical capture, independent writes in both directions, and duplicate,
traversal, running-flag and nested-destination refusals. These tests did not touch
real character saves. They exercise Android runtime/filesystem behavior in a
temporary shell-owned directory, not the embedded manager's app-private directory.

The manager source adds a per-mod Prepare separate save copy action with explicit
wording that the game does not use the copy yet. The source compiles against API
36; the updated activity has not been installed or UI-tested. The test APK includes
only project code and remains local. Existing exported-backup and restore behavior
is reused; no claim of crash-proof profile transactions is made.

## Remaining integration

This establishes storage copies, not runtime save isolation. Native save-root
redirection, complete coverage of engine readers/writers, profile activation and
vanilla recovery still need implementation and device tests. Do not load main
characters under a mod on the assumption that these copies protect them. No mod
was activated, game restarted or live save changed during this stage.
