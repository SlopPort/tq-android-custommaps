# LootPlus profile preparation and background refusal

The installed experimental loader prepared a separate LootPlus save copy through
the manager UI, selected the existing imported mod, and opened ModProbe in the
stock world. Three database sentinel values changed from 3/4/4 to 35/60/40.
World entry and the game's save confirmation passed. Five files in the
profile changed relative to its snapshot; all 1,081 original save files remained
identical. This does not establish drop-rate correctness or broad gameplay compatibility.

Switching away from the game subsequently invoked a cloud-save entry point.
The current fail-closed profile guard aborted the process, reporting
`Cloud save is not supported with an active separate profile`. Therefore this run
is NOT a clean end-to-end pass. Background handling/cloud isolation is a release
blocker and needs a verified local-only policy or controlled refusal before play.
The manager can reopen after the abort; recovery gameplay has not yet been verified
in this report.

Source-only UI wording was corrected to distinguish preparing a profile from
runtime activation. These wording changes are not installed on the test phone yet.
