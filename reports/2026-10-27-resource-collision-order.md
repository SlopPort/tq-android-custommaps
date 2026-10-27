# ARC resource collision order on Android 5364

## Measured result

In source group 0 of an isolated `GAME::FileSystem`, **the first-added source won** when the
LootPlus and XMAX x2 map archives both provided `tqprobe/main.map`.

| Sources added, in order | Read size | FNV-1a | Identified source |
| --- | ---: | --- | --- |
| LootPlus | 164 | `24eca960` | LootPlus control |
| XMAX x2 | 164 | `fb5f3bc3` | XMAX control |
| LootPlus, XMAX x2 | 164 | `24eca960` | LootPlus |
| XMAX x2, LootPlus | 164 | `fb5f3bc3` | XMAX x2 |

Device process 7526 completed all four cases. Each case used a new FileSystem;
each lookup was opened, read and closed twice with the same result. All source
registrations returned 1, all temporary FileSystems were destroyed, and the
process remained alive after completion. Full function fingerprints were checked
before native calls. The archives contained different map data, so the two
single-source controls distinguished the collision winner.

## Configuration and limits

Each `AddSourceArchiveParams` buffer was zero-initialized, with the archive path
pointer at offset `0x08` and the shared prefix pointer at `0x20`. This result
applies to those parameters, this resource path and this game specimen. It does
not establish priority for other flags, databases, cached Resource objects,
loose files or already registered stock sources. Archives were added before the
first read in every case.

No mod database was activated and no world or character was loaded. This is a
resource lookup experiment, not a LootPlus/XMAX gameplay compatibility result.

## Loader implication

A second device run (PID 8043) repeated the four controls and added four cases
using the first 32-bit parameter as a source-group index:

| Registration order | Groups in that order | Winner on both reads |
| --- | --- | --- |
| LootPlus, XMAX x2 | 1, 0 | XMAX x2 |
| XMAX x2, LootPlus | 0, 1 | XMAX x2 |
| LootPlus, XMAX x2 | 0, 1 | LootPlus |
| XMAX x2, LootPlus | 1, 0 | LootPlus |

Thus group 0 precedes group 1 regardless of insertion order across those groups
in this test. Static evidence agrees: helper `0x96b480` reads the parameter's
first word and selects a vector at `FileSystem + 8 + group * 0x18`;
`OpenFile` (`0x96ab28`–`0x96ab80`) iterates groups 0 then 1. Only indices 0
and 1 were tested. Do not supply unchecked indices. The actual group assignments
of stock game sources have not been established. The second run also restored
the original script and removed the temporary cache fixture.

Within the tested group 0, a highest-priority-first list should be registered in
that same order. Across the tested groups, group 0 takes precedence. A loader
must not assume last-added-wins. This ordering is not
yet implemented in the production loader: its database selection remains single
mod only, and global ARC mounting remains unsupported.

The next global-mount experiment must establish where mod sources sit relative
to existing game sources; appending a replacement may leave the stock resource
winning. Unique mod-only names and colliding stock names need separate checks.

## Laboratory cleanup

Root temporarily supplied the XMAX ARC in the app cache and replaced the
diagnostic script. The cache fixture was removed afterward. The original script
was restored with verified SHA-256
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The manager was reopened. No save operation was requested and no APK was rebuilt.
This does not demonstrate a non-root setup or Google Play compatibility.
