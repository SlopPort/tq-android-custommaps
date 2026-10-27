# Local follow-up while device approval is unavailable

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


- Added synthetic variant tests: structured choices, rollback before selection, sibling isolation, missing choice, overlapping layouts and changed single-database archive rejection. PASS locally.
- Bootstrap diagnostic now checks the report PID against its own process and stops UI polling after 35 attempts. Java compilation passed. The earlier signed bootstrap APK predates this source change and must be rebuilt before testing it.
- Added a standalone importer build script with no game or native dependency input. Successful local build: `apk-security/repro-import-test-02/import-test-unsigned.apk`. Alignment verified. This new build is unsigned and was not installed.
- Fixed a Windows SDK/JDK path issue by using a workspace copy of android.jar. The build script rejects the observed internal compiler failure even if javac returns zero.
- Publication hygiene check passed. The Actions file remains a template, not active CI.

No device installation or GitHub push was attempted after the automatic approval service reported its usage-limit failure. Rootless bootstrap execution, embedded-game launch and mod activation still require device work. Existing importer UI results remain valid but do not establish those later steps.

## Immutable import input

Added ImportSnapshot and changed the activity to copy the selected document once into private cache before inspecting variants. Retries read that snapshot rather than reopening the provider. Input capped at 512 MiB. Success/cancel/activity teardown queue cleanup on the IO executor. Host tests pass for stable repeated reads, cleanup and provider read failure; Android compilation passed. Process-kill orphan cleanup and actual rotation/cancellation behavior still need device testing. No updated APK has been installed.
