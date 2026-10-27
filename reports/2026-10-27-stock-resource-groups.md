# Stock resource groups on Android 5364

## Device observation

A delayed, read-only observer completed 15 sampling ticks in process 11101.
The last snapshot of the FileSystem returned by `Engine::GetFileSystem` contained:

| Source group | Sources |
| --- | ---: |
| 0 | 0 |
| 1 | 163 |

The observer intercepted 129 `AddSourceArchive` calls after it attached. All
targeted the same FileSystem as the final snapshot, used group 1 and returned 1.
No events were dropped by the observer's 512-event limit. Examples included
installed expansion asset-pack archives such as `xpack2/creatures.arc`,
`xpack2/dialog.arc` and `xpack3/scenery.arc`.

The observer attached after library discovery, so this is **not a complete startup
trace**. The other source registrations and source types were not established.
Snapshots read live vector state; only the observed final counts are claimed,
not an atomic history of startup. The process remained alive after completion.

## Implication

Combined with the isolated collision experiment, the empty higher-priority group
0 is a candidate for mod archive registration without reordering stock sources.
This remains a hypothesis for global resource replacement: no new source was
added in this run, and no cached Resource, global override or world load was
tested. The next test should mount a uniquely prefixed archive in the actual
FileSystem at a menu callback with no loaded player, verify its bytes and then
restart to check removal. Do not destroy the game's FileSystem.

## Failed early observer and recovery

An earlier attempt used a synchronous module-add observer. The process exited
before producing its report. The captured native crash stack includes Android
linker loading functions and the embedded runtime; the precise cause is not
established. This method was abandoned. Delayed discovery produced the successful
measurement above; the failed approach must not be treated as release-ready.

Both attempts were laboratory diagnostics, using root to replace the embedded
script. They did not load a character or request a save operation. After the
successful run, the original script was restored and SHA-256 verified:
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The manager was reopened. No APK was rebuilt; non-root installation and Google
Play compatibility were not tested.
