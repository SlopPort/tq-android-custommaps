# Mod importer tests — 2026-10-27

These are **host JVM tests of the same ModStore source used by the Android activity**. They do not exercise the Android picker, rootless installation, engine activation, ARC mounting or gameplay. No claim of working mods on Android 5364 follows from these results.

LootPlus and XMAX were selected as established community mods, not from a measured popularity ranking. [LootPlus author thread](https://titanquestfans.net/index.php?topic=934.0) and [XMAX Workshop listing](https://steamcommunity.com/sharedfiles/filedetails/?id=755731339) identify the projects; test specimens are identified by hashes below, not asserted to be their latest releases.

## Results

| Specimen | Import result |
| --- | --- |
| lootplus-1.3.zip | IMPORTED: lootplus-1.3.zip |
| xmax_v1.1.zip | REJECTED: This prototype requires exactly one ARZ database |
| x2.zip | IMPORTED: x2.zip |
| x3.zip | IMPORTED: x3.zip |
| x4.zip | IMPORTED: x4.zip |
| xmax.zip | IMPORTED: xmax.zip |
| xmax+.zip | IMPORTED: xmax+.zip |
| xmax+poor.zip | IMPORTED: xmax+poor.zip |

The LootPlus ZIP is the original downloaded archive. Its first import failed because it includes a loose MAP file. The importer now accepts inert MAP data; the repeat import passed. The XMAX combined download is unchanged and rejects as expected under the one-database rule. The six single-variant ZIPs were locally repacked from extracted directories, not downloaded as individual release archives. No mod archive is redistributed here.

Synthetic regression tests passed after the change, including path traversal, duplicate paths, multiple databases, unsupported native payloads, malformed headers and rollback. These tests do not validate ARZ internals or MAP compatibility. The older unsigned local APK must be rebuilt to include the MAP fix.

## Specimen SHA-256 hashes

- `lootplus-1.3.zip`: `54f0170783f517bc9c84492f3259f0588a3df9639fba37aa15b0f13ccc95f7b2`
- `xmax_v1.1.zip`: `4a8cc8eb7f0f0e3e359a2b750a026fc5c6ee33298db7b9e66a99e8f003bbc8c5`
- `x2.zip`: `72c704396cb7eec043e3308340497016ae909e369884abeb7cff59a1ede8d322`
- `x3.zip`: `e72e37d308ba18a4cda2ac77176571e28778c8f71688254e0137b87904b821cc`
- `x4.zip`: `532c31b77a2e76e75a6ffd145ee81fc316391e3d0254e92bc69e43478825776c`
- `xmax.zip`: `6357ebda04dfca710726adef473a61d86903067149dfe5f7481888e27067fa45`
- `xmax+.zip`: `88a21a547c8431e96d5987dc6f9db401db759bbad32ec8cc8d45d3f13524b936`
- `xmax+poor.zip`: `05a0792f4fdd090bd4c1c82a99fcf6afda2a45d66b85dadcbbc6f1ee29d580a2`

## Reproduction

Compile ModStore.java and android/tests/ImportProbe.java with a JDK. Run `java -cp <compiled-classes> ImportProbe <local-mod.zip>`. Obtain mods from their authors and keep them outside the repository. For the XMAX variants, create a ZIP containing only one variant directory. This is an importer test, not an installation guide for enabling mods.

## Next test

Finish rootless bootstrap and version-gated activation, then test one mod at a time with a disposable character. Record stock/mod/stock values and save/reload behavior. Do not use a successful import as evidence of gameplay effects.
