# ARC map reads on Android build 5364

## Measured on device

A temporary diagnostic using the already embedded runtime opened three imported
ARC archives with the game's own `GAME::Archive` API. The game process was PID
4380. No archive was mounted into the global resource system, no database was
replaced, and no character or world was loaded by the test.

| Mod | Internal entry | Extracted bytes | FNV-1a | Two reads match |
| --- | --- | ---: | --- | --- |
| LootPlus | `main.map` | 164 | `24eca960` | Yes |
| Gladiators | `gladiators.map` | 2,866,820 | `1f214379` | Yes |
| Halloween 2012 | `activate.map` | 164 | `fb5f3bc3` | Yes |

Each archive reported one entry. All three extracted headers began with
`4d 41 50 06`. The two destination buffers were initialized to different bytes
before extraction, so unchanged buffer regions would fail the equality check.
This establishes consistent full-buffer writes, not independent correctness of
the decompressed content. No comparison against another extractor was performed.

The initial probe looked only for `main.map`; Gladiators and Halloween returned
index -1. Reading their actual internal names fixed this diagnostic assumption.
A loader must discover or explicitly configure map entry names.

## Static evidence

Exports and complete function-byte fingerprints were checked before calls on
the locally installed 5364 specimen. Relevant RVAs:

- `Archive::Open`: `0x966fdc`.
- `Archive::GetNumFiles`: `0x968fa8`.
- `Archive::FindFile`: `0x967990`.
- `Archive::GetFileEntry`: `0x968fbc`; entries are addressed with stride `0x50`.
- `Archive::ExtractFileToMemory`: `0x968360`; reads the size at entry offset
  `0x0c`, invokes the internal extraction routine, then returns 1 unconditionally
  on its normal return path. Its return value alone cannot verify extraction.
- `World::IsValidMapFile`: `0x89c19c`; inspects the three-byte `MAP` signature
  and signed version byte (greater than 4 or 5 depending on its flag). This is
  only a header check, not a complete map compatibility check. It was not called
  during this runtime probe.

## Scope and restoration

Root was used to temporarily replace the extracted diagnostic script and collect
results on the laboratory phone. This is **not** a non-root installation test.
The original script was restored afterward and its SHA-256 checked against the
copy from the installed APK:
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
Vanilla selection was retained. No APK was rebuilt or published for this probe.

ARC reading is now measured on this specimen. Global resource mounting, map
selection, world entry, quests, textures, save isolation, and combinations remain
unverified. The next experiment should use an isolated FileSystem source to test
resource lookup before changing the game's global resource mounts.
