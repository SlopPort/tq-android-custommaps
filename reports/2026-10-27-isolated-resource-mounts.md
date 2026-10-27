# Isolated resource mounts on Android 5364

## Device result

On the laboratory Redmi Note 8, process 5541 successfully added the imported
LootPlus, Gladiators and Halloween map archives to independently constructed
`GAME::FileSystem` objects. Each map could be opened through a `tqprobe/` prefix,
locked, read, unlocked and closed. Each temporary FileSystem was destroyed.

The diagnostic then added all three archives to **one** temporary FileSystem,
using the same prefix. All three distinct entry names resolved successfully:

| Entry | Bytes | FNV-1a | Matches previous direct ARC read |
| --- | ---: | --- | --- |
| `tqprobe/main.map` | 164 | `24eca960` | Yes |
| `tqprobe/gladiators.map` | 2,866,820 | `1f214379` | Yes |
| `tqprobe/activate.map` | 164 | `fb5f3bc3` | Yes |

All three `AddSourceArchive` calls returned 1. The combined FileSystem was
destroyed after the reads. The process remained alive when inspected after
the finished report.

## Meaning and limits

Multiple ARC sources with distinct map entry names can coexist in an isolated
FileSystem on this specimen. This does **not** establish that the mods work
together: databases, quests and other resources were not loaded. Duplicate
resource-name precedence, global resource registration, world entry, and save
isolation remain untested. Matching FNV-1a and size is a consistency check against
the preceding engine read, not independent verification by another decoder.

The diagnostic checked exported addresses and function-byte fingerprints before
native calls. Relevant functions include `FileSystem::AddSourceArchive`
(`0x96a668`), `OpenFile` (`0x96aae4`), `CloseFile` (`0x96acd4`),
`FileArchive::GetLength` (`0x8e99b8`), `Lock` (`0x8e98a4`) and `Unlock`
(`0x8e9984`). No existing game FileSystem was modified.

Root temporarily replaced the embedded diagnostic script for this laboratory
test. It is not evidence of a non-root installation workflow. The original
script was restored and SHA-256 verified as
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The manager was reopened with vanilla selection retained. No character was
loaded, no save operation was requested, and no APK was rebuilt.

Next: establish the global resource source owner and lifecycle, plus duplicate
entry precedence, before attempting a game-world mount.

Follow-up static inspection located `Engine::GetFileSystem` at `0x98ddf4`:
it returns the pointer stored at `Engine + 0x338`. This identifies an accessor;
it does not establish when global mounts may be safely added or removed.
