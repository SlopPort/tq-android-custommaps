# Multiple-mod compatibility audit - 2026-10-27

The current manager selects one database and the loader performs one activation. Multiple-mod activation has not been implemented or tested. Sequential Deserialize calls must not be assumed to compose: retained overrides, resource lookup, lifetime and load-order behavior require runtime evidence.

## Static comparison of local specimens

LootPlus 1.3 contains 3,808 records. The tested XMAX 1.1 ZIP contains x2, x3, x4 and xmax databases with six records each, xmax+ with 78, and xmax+poor with 77. Comparison normalizes record paths and resolves string values through each archive's own string table. Numeric values are compared as raw 32-bit values; field ordering and archive-local string indices do not create false differences.

| Pair | Shared records | Static result | Android runtime status |
| --- | ---: | --- | --- |
| LootPlus + x2 | 0 | No direct record collision | Untested; original x2 remains unsupported |
| LootPlus + x3 | 0 | No direct record collision | Untested |
| LootPlus + x4 | 0 | No direct record collision | Untested |
| LootPlus + xmax | 0 | No direct record collision | Untested |
| LootPlus + xmax+ | 1 | Different contents in the same record | Untested; conflict resolution required |
| LootPlus + xmax+poor | 1 | Different contents in the same record | Untested; conflict resolution required |
| Two different XMAX variants | At least 6 | At least one conflicting record in every tested pair | Do not treat variants as additive multipliers |

The LootPlus/plus-variant collision is `records\\item\\containers\\defaultloot\\tutorialpotionchest.dbr`. Both spawn-count equations differ, and the plus variant also defines `goldGeneratorLevel`. No preferred winner was chosen. Static evidence alone does not establish the engine's load-order rule.

All 21 pairs among the seven supplied databases were inspected. No collision is not proof of compatibility: scripts, references, global engine settings, ARC resource names, gameplay interactions and performance can conflict without overlapping record paths. This audit covers database records only; it does not mount resources or test gameplay.

## Separate mobile compatibility issue

The original x2 engine record omits 65 fields present in the mobile reference and changes 18 shared fields, including inventory dimensions and potion stacking as well as spawn multipliers. See the [XMAX comparison](2026-10-27-xmax-compatibility.md). Combining it with LootPlus does not fix those differences.

The next candidate is **LootPlus plus a clearly labeled mobile adaptation of x2**, preserving mobile engine fields except the intended spawn settings. That adaptation does not exist yet. It must first pass standalone validation before any combined activation or gameplay claims.

Specimens: LootPlus ARZ SHA-256 `c9fc86f1229b1f0270c71a6df6338d01b3c5177a580352b2942681aeb7dd7b0c`; XMAX source ZIP SHA-256 `4a8cc8eb7f0f0e3e359a2b750a026fc5c6ee33298db7b9e66a99e8f003bbc8c5`. Source archives remain local and are not redistributed.
