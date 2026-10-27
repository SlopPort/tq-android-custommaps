# Manager selection and fresh-start checks - 2026-10-27

These results apply to a locally prepared third-party 5364 APK specimen on a rooted test phone. Preparation from an unmodified store release remains unverified.

The experimental manager imported LootPlus through the Android file picker and stored the selected database in its private library. In process 23366, the embedded loader resolved that saved selection and changed the three monitored values from 3/4/4 to 35/60/40. A later menu callback read the same modified values. This demonstrates selected-file activation for the recognized specimen, not general mod compatibility.

An initial path check rejected Android's canonical `/data/data` path. The resolver now accepts both explicit private-library roots for the same package, while rejecting traversal and other applications' paths. The manager uses a separate Android task so its launcher can reopen the library while the game remains running.

With APK SHA-256 `4606d34bea5ded4c15e783c2189038ea5130cf6ba7b95dc1321dc8c9ec48b0fa` installed, selecting vanilla through the manager and opening the game produced process 24897. At character selection, all eight engine fingerprints matched, no player was loaded, and the three monitored fields read 3/4/4. The report recorded `baseline-verified`, `mutationAttempted=false`, and `modsActivated=false`. There was no APK replacement between this selection and launch. These checks cover three fields, not the whole database.

Next, selecting LootPlus and confirming the manager's save-warning/close dialog terminated process 24897. Reopening the manager preserved the selected library entry, and Open game started in process 26008. At character selection, thread 26114 reported all eight fingerprints matched, no player loaded, and recognized selection. The three values changed from 3/4/4 to 35/60/40 and remained 35/60/40 in delayed reads. This completes the repeat activation check without replacing the APK.

The local report checker (`tools/check-runtime-report.py`) passed the vanilla and repeat-mod reports with their independently observed process IDs. Supplying the previous process ID for the repeat-mod report correctly failed. The checker validates selection, API checks, no-player checkpoint, mutation flags and all three sentinel records, including delayed reads for activation. It does not automate gameplay or establish compatibility beyond those checks.

Runtime import, selection and loading use app-private storage and the embedded loader. The test phone is rooted; ADB/root were used for laboratory setup and diagnostic readback. Setup on a stock unrooted phone or a legitimate store APK has not been demonstrated. Save isolation and ARC/MAP mounting remain absent from the manager-integrated loader. Separate later laboratory map tests are linked from the README; general mod compatibility remains unverified. The older Perf/Traders injector remains paused.

Additional UI checks in process 26008: Add mod opened Android DocumentsUI; Android Back returned to the manager without changing the selected entry or ending the game process. Cancel in the close-app confirmation also returned to the manager with the same PID and persisted LootPlus selection. Both returned screens still displayed the verified runtime database message. These are cancellation checks, not storage-failure or process-death import tests.
