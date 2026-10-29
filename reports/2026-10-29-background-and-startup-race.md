# Background recovery and early-start regression

The experimental APK ending in SHA-256 `52b79d07` ran ModProbe with LootPlus in
process 15351. Switching to the manager and returning retained the same process.
The resumed pause screen was visible and saving produced the game's confirmation
dialog. A subsequent comparison found all 1,081 original save files unchanged.
This is a bounded background/save check, not complete cloud isolation coverage.

A later startup exposed a separate race: process 15779 loaded ModProbe while the
report still said `waiting-for-menu` and `modsActivated:false`. That world entry
must not count as a successful mod reload. The process was stopped. The installed
APK is therefore not accepted as a release build.

The source now requires `status:ready` and confirmed mod activation before an
active profile can enter `LoadGame`. The orchestrator test asserts refusal before
menu activation and acceptance afterwards. At this checkpoint the guard was not installed. See the subsequent
[installed startup follow-up](2026-10-29-startup-order-followup.md).
A friendly waiting screen and an activation schedule that completes reliably
before a fast user presses Start remain required. Closing the process on an early
start is a safety fallback, not the intended finished user experience.

Private evidence: `cloud06-background.json`, `cloud06-resume.png`,
`cloud06-save.png`, `cloud06-save-comparison.json`. The early-start report was
observed directly on the device. Rooted build 5364 only; Google Play unverified.
