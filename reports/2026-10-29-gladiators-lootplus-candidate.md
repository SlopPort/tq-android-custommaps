# Gladiators plus LootPlus: candidate, not an activated combination

A record-level comparison of the installed specimens found 284 Gladiators records
and 3,808 LootPlus records, with zero shared normalized record paths. No direct
database-record conflict was found. This does not establish combined gameplay
compatibility or resource compatibility.

The intended experiment is Gladiators map/resources plus LootPlus database changes.
LootPlus's bounce-map resource must not be assumed interchangeable with Gladiators's
Maps.arc. Their separate runtime activation and save tests are not evidence that
sequential database deserialization retains both sets of overrides.

Before claiming a combination, verify both mods' independent sentinel records after
both loads and again after world entry; verify custom-map identity, resources and
save/reload; refuse ambiguous resource keys or record conflicts. The manager still
selects one mod and has no general multiple-mod activation UI. No combined package
or combined gameplay result is claimed here.

Comparison tool: tools/compare-mod-records.py. Private result:
gladiators-lootplus-comparison.json. Source ARZ SHA-256 values:

- Gladiators: `8af35994d104484c261bb5066d252cfbf9296254d34f78a689d247b20328172f`.
- LootPlus: `c9fc86f1229b1f0270c71a6df6338d01b3c5177a580352b2942681aeb7dd7b0c`.

Mod assets remain private and are not redistributed.
