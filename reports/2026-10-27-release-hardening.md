# Release hardening - 2026-10-27

This work does not change the release status to finished.

The installed hardening builds disable action buttons while selection persistence or import/export work is pending. This is intended to prevent the normal manager flow from launching or closing the game before the atomic selection write completes. The flags are process-wide. Later source changes refresh controls after activity recreation and limit cleanup to the activity owning the operation; those changes are compiled but not installed. Activity recreation and rapid-tap race coverage remain pending on device.

## Earlier export-only checkpoint

An export-only character backup implementation creates a ZIP with a SHA-256 manifest. It reads the observed external `Preferences/SaveData` location through the game's own app context and uses Android's document picker for the destination. It refuses to start if `libtq.so` is present in the process maps or those maps cannot be inspected. It bounds file count, size and depth, refuses symbolic links, checks for file changes during capture, and reports export failures without claiming the destination is usable. No restore or save-isolation functionality is claimed.

Host test `SaveBackupTest` passed exact archived-byte and SHA-256 checks, missing-source rejection, destination-write failure propagation and unchanged-source verification. The Android build with these changes compiled successfully.

Device export passed after updating the existing installation and opening only the manager. Android DocumentsUI created a ZIP in Downloads. The UI reported 1,081 exported files. Independent host inspection found 1,081 save entries plus the checksum manifest, all SHA-256 values matched, and ZIP CRC validation passed. This verifies the exported archive's internal integrity; no restore test has been performed yet. The archive contains private user data and is retained outside this repository.

Local test APK SHA-256: `5f6b9bd6c8ffaa7b0a142cb857356487478783698390fcf419cd76cebc42f8c7`. Signature verification passed. The APK is not a publication artifact.

## Restore checkpoint

Follow-up source adds checksummed restore, preserved previous-save directories, and a journal for recovering an interrupted directory replacement before the embedded bootstrap starts the engine. `SaveRestoreTest` passed replacement, previous-data retention, checksum/path rejection without changing current data, and simulated interruption recovery. The second signed APK is `52e6d94bf375f8309df77abcce698f44c15a8f0ea6d390f850a53c54b7fffd51`. Later activity-recreation control refresh changes are source-only until the next APK rebuild.

Device restore passed through the manager and Android picker with the engine stopped. The test restored the freshly exported copy; no newer gameplay had occurred. Independent readback found 1,081 current files and 1,081 retained previous files. Both path-to-SHA-256 maps exactly matched the exported backup. Root was used for this independent laboratory readback, not by the application's export/restore implementation. Interrupted-restore recovery has host simulation evidence only, not an Android process-kill test. A game-load check after restoration remains pending.

Negative device test: selecting the XMAX mod ZIP as a save backup was rejected for its missing checksum manifest. Independent readback again matched all 1,081 current and retained files to the original export; the rejected restore did not change them.

After restoration, the user confirmed the character-selection list was correct. No character was intentionally loaded for this check. Process 30220 passed the automated vanilla report validation (three stock fields, no mutation). Reopening the manager and tapping Export while the engine was loaded showed the stop-game instruction instead of opening the export picker, with the same process remaining alive. This verifies the normal UI guard; it is not a concurrent external-launch stress test.
