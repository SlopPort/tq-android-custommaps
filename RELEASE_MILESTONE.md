# Practical release milestone

The requested "80%" milestone is an acceptance checklist, not a measured completion
percentage. It is not reached until the supported end-to-end flow passes without
routine ADB use. Google Play installation remains explicitly unverified.

| Acceptance area | Current evidence | Remaining gate |
| --- | --- | --- |
| Import and selection | Latest test UI installed; existing-library selection and startup passed | Repeat fresh ZIP import and profile preparation through UI |
| Database mod | LootPlus runtime checks and a short user-reported gameplay check | Repeat through final packaged workflow |
| Map with resources and text | Manager-selected Gladiators entry/save/restart passed on one APK | Remove test-character restriction after profile lifecycle validation |
| Separate saves | Stock- and custom-world profile save/reload; seven caravan-file reads after restart passed | Deliberate item persistence, cloud policy and startup guards |
| Vanilla recovery | Manager-selected vanilla passed stock sentinel checks without script replacement | Final UI/error handling and vanilla gameplay check |
| Mod combination | Record/resource comparisons and conflict analysis exist | One combined gameplay-tested package; clear refusal of conflicts |
| Publication | English docs and original code, text audit before publication | Final simple guide and reproducible supported setup |

Latest profile evidence: [world roundtrip](reports/2026-10-28-profile-world-roundtrip.md).
Priority: validate profile-only character lifecycle and deliberate item persistence,
then finish fresh-import and combined-mod acceptance. Do not label isolated lab successes
as completed end-to-end functionality.


Caravan follow-up: [native wrapper and restart checks](reports/2026-10-28-caravan-profile-roundtrip.md). The failed listener-trigger run was recovered and is documented alongside the successful tests.



Combined map/profile evidence: [custom-world save and restart](reports/2026-10-28-map-profile-roundtrip.md).

Installed workflow: [manager-selected map, restart and vanilla](reports/2026-10-28-integrated-profile-loader.md).
