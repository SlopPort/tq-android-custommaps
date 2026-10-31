# Practical release milestone

> Historical checklist from the embedded-APK development route (until 2026-10-30). The released product is the Magisk route: see the [README](README.md) and the [Magisk route report](reports/2026-10-31-magisk-route.md).

The requested "80%" milestone is an acceptance checklist, not a measured completion
percentage. It is not reached until the supported end-to-end flow passes without
routine ADB use. Google Play installation remains explicitly unverified.

| Acceptance area | Current evidence | Remaining gate |
| --- | --- | --- |
| Import and selection | Fresh Gladiators import, profile preparation, world/save/restart passed; original saves unchanged | Repeat final supported setup with polished UI |
| Database mod | Installed profile-loader LootPlus activation/world/save passed | Repeat full restart and final workflow checks |
| Map with resources and text | Gladiators entry/save/restart passed; one-level navigation reconstruction allowed visible movement in a separate lab run | Automatic navigation preparation, neighboring-region traversal and restart acceptance |
| Separate saves | Stock- and custom-world profile save/reload; seven caravan-file reads after restart passed | Deliberate item persistence, cloud policy and startup guards |
| Vanilla recovery | Manager-selected vanilla passed stock sentinel checks without script replacement | Final UI/error handling and vanilla gameplay check |
| Mod combination | Record/resource comparisons and conflict analysis exist | One combined gameplay-tested package; clear refusal of conflicts |
| Publication | English docs and original code, text audit before publication | Final simple guide and reproducible supported setup |

Latest profile evidence: [world roundtrip](reports/2026-10-28-profile-world-roundtrip.md).
Priority: integrate and validate bounded navigation preparation, verify deliberate
item persistence, then complete final setup/UI and combined-mod acceptance.
Do not label isolated lab successes
as completed end-to-end functionality.


Caravan follow-up: [native wrapper and restart checks](reports/2026-10-28-caravan-profile-roundtrip.md). The failed listener-trigger run was recovered and is documented alongside the successful tests.



Combined map/profile evidence: [custom-world save and restart](reports/2026-10-28-map-profile-roundtrip.md).

Installed workflow: [manager-selected map, restart and vanilla](reports/2026-10-28-integrated-profile-loader.md).

Fresh import evidence: [UI import and profile preparation](reports/2026-10-29-fresh-map-import.md).

Movement follow-up: [single-level navigation experiment](reports/2026-10-30-single-level-navigation.md).
