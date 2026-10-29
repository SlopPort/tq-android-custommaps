# Local-only cloud policy candidate

The build-5364 ARM64 audit identifies a native disable path:

- `SetCloudEnabled(bool)` at `0xd5a64c` stores the requested bit at manager offset `0x46`. A false request returns without starting a download; a true transition calls `DownloadCloudSaves`.
- `IsCloudEnabled()` at `0xd5a730` checks offsets `0x45` and `0x46`.
- `SaveFolder` at `0xd5a750`, `DownloadCloudSaves` at `0xd5a684`, and `DeleteFolder` at `0xd5aab0` all return before their JNI operation when the flag at `0x46` is zero.
- `SaveCaravan` and `SaveAllCharactersAndCaravan` do not have equivalent entry guards. Therefore entering either function does not itself prove that an upload will occur. The existing unconditional abort can reject calls that the downstream flag checks would skip.

The new `local-only-cloud.js` candidate resolves all three required API addresses
before hooks, forces subsequent setter requests to false, flushes the hook,
obtains the singleton, disables cloud through the stock setter and verifies the
reported state. It changes process state, not the user's stored preference.

`LocalOnlyCloudTest.js` passes mocked ordering, missing-address, forced-disable
and failed-verification cases. These tests do not execute native code.

**Experimental integration, not a release acceptance.** The first installed candidate
refused startup because the native boolean argument required an integer. Passing
zero corrected that binding. A later build retained its process through background
and resume, and saving produced the game confirmation. The original 1,081 save
files matched their baseline afterwards. This bounded test used a phone without
a cloud account; logged-in cloud callbacks and queued transfers remain unverified.

The profile loader now requires successful mod activation before LoadGame.
See [startup follow-up](2026-10-29-startup-order-followup.md).

Private audit evidence: `cloud-call-audit-5364.json`,
`cloud-policy-fingerprints.json`. No game instructions or binaries are distributed.
