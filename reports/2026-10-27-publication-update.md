# Source publication update — 2026-10-27

This update publishes accumulated original importer, backup/restore, selection,
bootstrap research and comparison tools, with device evidence and limitations.
No game APK, native game library, mod archive, save, signing key or local runtime
binary is part of the publication.

The manager source now records the selected variant's ARC inventory (paths and
sizes), in deterministic order. Canonical containment and directory bounds are
checked. The loader does not yet mount that inventory; map experiments remain
separate prototypes. The update compiles against Android API 36 and has synthetic
inventory tests. It has not replaced the installed game APK.

The laboratory results include archive reads/mount ordering, Gladiators entry,
scoped save-identity correction with two-process resumption, and one location
label displayed through a wide-text workaround. They do not establish complete
mod compatibility, isolated characters, or setup from a store APK on an unrooted
phone. The current user-facing loader recognizes only the tested LootPlus profile.

Public text received an independent agent audit. Earlier checkpoint reports are
marked historical and link to later results. No ready-to-use game APK or packaged
third-party runtime is distributed. Read USAGE.md before attempting local setup.

## Validation for this source snapshot

Seven Java suites passed: ModStoreTest, VariantSyntheticTest, DatabasePathTest,
SnapshotTest, SaveBackupTest, SaveRestoreTest and ResourceInventoryTest. Four
JavaScript suites passed: BootstrapProbeTest, LabDatabaseProbeTest,
ResolveSelectionTest and ModTextTest. ModOverlapTest.py also passed. These are
host/synthetic checks; they do not substitute for native or gameplay testing.
The standalone app with bootstrap activity classes compiled and packaged against
API 36 using JDK 25; obsolete Java 8 target/deprecation warnings were emitted.
The publication guard passed for 74 candidate paths. The independent text audit
reported no remaining material issues after corrections.
