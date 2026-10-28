# Practical release milestone

The requested "80%" milestone is an acceptance checklist, not a measured completion
percentage. It is not reached until the supported end-to-end flow passes without
routine ADB use. Google Play installation remains explicitly unverified.

| Acceptance area | Current evidence | Remaining gate |
| --- | --- | --- |
| Import and selection | ZIP/library and selection tests exist | Install latest UI; repeat complete user flow |
| Database mod | LootPlus runtime checks and a short user-reported gameplay check | Repeat through final packaged workflow |
| Map with resources and text | Gladiators world entry, resource mounts and one displayed location label in lab | Integrate supported map activation in manager |
| Separate saves | Stock-world disposable profile save/process-restart reload passed | Caravan, mod-world saves, cloud policy and startup guards |
| Vanilla recovery | Original loader and original save hashes restored in lab | Repeat from final manager without script replacement |
| Mod combination | Record/resource comparisons and conflict analysis exist | One combined gameplay-tested package; clear refusal of conflicts |
| Publication | English docs and original code, text audit before publication | Final simple guide and reproducible supported setup |

Latest profile evidence: [world roundtrip](reports/2026-10-28-profile-world-roundtrip.md).
Priority: exercise caravan paths, then combine verified map and profile features,
then install and validate the final user flow. Do not label isolated lab successes
as completed end-to-end functionality.

