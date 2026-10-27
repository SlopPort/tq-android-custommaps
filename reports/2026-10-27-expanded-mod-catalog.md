# Expanded mod and map audit - 2026-10-27

No additional mod is claimed playable on Android by this report. The current loader still lacks tested ARC mounting, map entry and multi-database activation. Static overlap analysis is not a gameplay test.

## New specimens and sources

| Project | Source | Local result | Phone result |
| --- | --- | --- | --- |
| Halloween 2012 | [Community archive thread](https://titanquestfans.net/index.php?topic=735.0) | Downloaded 7z; 2,727 database records; resource archives; its bundled instructions describe a bounce mod | Locally normalized ZIP imported successfully; activation not attempted |
| Masteries 1.03 | [Community archive thread](https://titanquestfans.net/index.php?topic=761.0) | Downloaded 7z; base 1,878 records, rebalance variant 1,998; external textures/shader and optional languages also included | Not installed; resource and mobile-engine integration unresolved |
| Gladiators - Gods of the Arena | [Community archive thread](https://titanquestfans.net/index.php?topic=733.0) | Downloaded 7z; 284 records plus Maps, Quests, UI, text, sound and texture archives | Locally normalized ZIP imported successfully; map entry not attempted |
| The Sixth Tablet | [Community archive thread](https://titanquestfans.net/index.php?topic=734.0) | Downloaded file failed 7-Zip validation; header expects 280,720,116 bytes, received 266,632,904 | Not installed; needs a verified complete specimen |
| Frozen World | [Project download page](https://www.moddb.com/mods/titan-quest-frozen-world/downloads) | Project lists English full release and smaller demo; direct retrieval returned HTTP 403 | Not downloaded or tested |
| Soulvizier AERA | [Author's release thread](https://titanquestfans.net/index.php?topic=1201.0) | Author lists AE expansion requirements and routes downloads through Discord | No specimen obtained; not tested |
| Loot Plus XMAX FTW | [Author's page](https://www.nexusmods.com/titanquestanniversaryedition/mods/19?tab=description) | Existing curated compilation, not an extra layer to place over standalone LootPlus; no specimen obtained in this audit | Not tested |

Public archive-thread provenance is recorded separately from an author's own release page. No assertion is made that an archive is the latest version. Downloads remain local; no third-party archives or modified databases are published.

## New static pair results

Together with the earlier seven databases, eleven databases now have record inventories. The earlier 21 pair comparisons plus 34 new pairs cover all 55 pairs. String table indices are resolved before comparison.

| Pair | Conflicting records | Interpretation |
| --- | ---: | --- |
| Masteries base + LootPlus | 4 | Small loot-field conflict candidate; see proposal below |
| Masteries rebalance + LootPlus | 4 | Separate specimen; do not apply the base recipe without verifying its values |
| Masteries base/rebalance + x2 | 1 | Global engine record; one record is not necessarily a small conflict |
| Masteries base + rebalance | 349 | Alternative versions, not independent add-ons |
| Halloween + LootPlus | 363 | Broad overlap; not a simple load-order fix |
| Halloween + x2 | 1 | Requires inspecting the entire shared record and resources |
| Halloween + Gladiators | 1 | Resource/map behavior also unverified |
| Gladiators + LootPlus or any tested XMAX variant | 0 | No direct database collision, not runtime compatibility |
| Gladiators + either Masteries variant | 0 | Map, mastery UI and resource integration still unverified |

Shared ARC filenames do not alone prove a resource conflict. A future resource audit must compare internal asset keys and lookup/mount semantics. Two replacement maps are not presumed simultaneously playable.

## Concrete repair work

**Packaging repair completed locally:** Halloween contains `resources/maps.bak` byte-identical to `resources/maps.arc`. The importer rejects `.bak`. The normalized ZIP omits only that duplicate and keeps the database and accepted resources unchanged. Gladiators was repackaged from 7z to ZIP without changing its file contents. Both imports passed through the embedded manager and Android picker on the phone, while vanilla remained selected. Neither result proves resource loading or playable content.

**Masteries base + LootPlus proposal, not applied:** preserve the LootPlus behavior in the four overlapping loot records and keep Masteries elsewhere. Three `lootWeight2` values would change from 4 to 20; `bothPrefixSuffix` from 2 to 35; add `brokenOnly=0` where absent. This is five field decisions across four records, not a blanket whole-mod winner. The exact hash-bound plan is in `masteries-lootplus-repair-plan.json`. A compiler/ARZ writer, mobile engine adaptation and regression testing are still required. No repaired runtime combination is claimed.

The original XMAX engine record remains a separate mobile compatibility issue. Avoid importing its entire PC engine configuration merely to obtain spawn multipliers.

## Download hashes

- Halloween 2012: `1c59eb430133b0242c9cfa6edc9ae116ba7a8f9530bccdf1082feb4f703b364a` (4,568,335 bytes).
- Masteries 1.03 bundle: `666faabbce74666ab4102c6c40b89c8f26c112fd7703c29af1d9f880315c4978` (10,496,740 bytes).
- Gladiators: `66176c6838f0722e3cf5270c18e457b10385f66d443e2b141857919fb90292b5` (5,982,219 bytes).
- Sixth Tablet failed specimen: `20b5526ebf841a08df63e5a5a50f77e8e02a0d6a6c671294cbb425ef920c5502` (266,632,904 bytes). The cause of the missing tail is unknown; do not treat this hash as a working release.
