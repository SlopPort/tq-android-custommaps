# Activate before loading a character

Build SHA-256 `e8f1a46ad2544e9268f812f060e2d7acbdcefefc594a3a99a9310e4dce9b12e1`
removes the arbitrary 60-update delay. The first menu update with valid engine,
game and database pointers attempts activation. Missing prerequisites are retried
for up to 600 menu updates. An existing player refuses activation. A separate
LoadGame guard refuses profile gameplay unless activation has completed.

In process 16848, the report confirmed LootPlus sentinel values 35/60/40 and
`modsActivated:true` before ModProbe loaded. The test character entered the stock
world. A save-confirmation screenshot was captured; switching to the manager
retained process 16848. This is one successful run, not exhaustive timing coverage.

All 13 JavaScript test files passed. The orchestrator test now requires activation
on the first ready menu callback, retries a missing database pointer, rejects a
pre-activation load, and permits it after activation. Native refusal of a deliberately
premature load and repeated fast-start runs remain to be checked. The installed
DEX still uses the previous UI wording; source wording changes are not installed.

The native cloud-enabled state was forced off and checked in this process;
complete cloud-path coverage remains unverified.
Logged-in account callbacks, deliberate stash/relic persistence, combined gameplay,
fresh import and the final setup flow remain release gates. Google Play is unverified.

Private evidence: startup07-first.json, startup07-load.json, startup07-world.png,
startup07-save.png. APKs and save files are not distributed.
