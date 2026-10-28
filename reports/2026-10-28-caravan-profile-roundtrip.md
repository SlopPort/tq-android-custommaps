# Caravan profile routing: native wrapper and restart checks

Build 5364, Redmi Note 8, disposable ModProbe profile. This is laboratory evidence,
not final manager integration or a general claim of save isolation.

## Failed trigger and recovery

Calling ForceCaravanLoading from an Interceptor listener completed without recording
caravan hooks and wrote six private-stash files plus two existing character/map
files in the original ModProbe directory. The process was stopped; the full original
SaveData tree was restored from the pre-test backup. SHA-256 comparison matched all
1,081 files. Unexpected output was retained privately for diagnosis. No main
character was loaded. Nested instrumentation suppression was suspected.

A separate synthetic CModule test replaced a synthetic outer function with a native
wrapper using replaceFast. The wrapper called the original and a second hooked
function. It returned the expected 23 and recorded one inner-hook event.

## Corrected trigger

A native wrapper around UIPlayerHud::WidgetUpdate called the original update, then
invoked ForceCaravanLoading once after 120 updates following ModProbe load. This
kept the operation on the game's update thread and outside a listener callback.
The existing root and caravan-path hooks remained active. This changed trigger
mechanism supports the suppression hypothesis, but does not establish every detail
of the previous failure.

- Process 26414: 11 stream reads, 14 stream writes, no reported hook errors.
- Process 26940 after restart: seven primary-file reads and 14 writes.
- Process 27432 after another restart: all seven reads returned success (1),
  covering three private stash slots, shared winsys and three relic slots.

StreamIn's native return ends with `and w0, w23, #1` at 0xd35f84. Recording this
return is stronger evidence than merely observing entry. All recorded target paths
were under the private profile, including Sys paths built from the original base
folder. Fourteen writes cover seven primary/backup pairs. The temporary string
argument remained allocated through each call and was destroyed on return.

After the corrected runs, all 1,081 original save files again matched the pre-test
hashes. The original loader script was restored and its SHA-256 verified:
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The game was left stopped. The test profile and backups remain private.

## Scope still open

This validates observed file routing and successful reader returns for this profile.
It does not validate deliberate item transfers, full inventory equivalence, all
writers, cloud behavior or production startup timing. The wrapper is a test trigger,
not required product behavior. Do not ship the automatic open/close operation as a
user feature. Next integrate map activation with profile routing, followed by the
manager flow and deliberate shared-item persistence tests.
