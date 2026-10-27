# Custom-map package preflight

The selection resolver now has a distinct, non-activating path for the recorded
Gladiators specimen. It checks database size/FNV-1a and the seven required ARC
sizes/fingerprints, deriving resource paths from the selected library entry.
Profile paths, duplicate resource entries and declared size budgets are validated
before resource reads. Missing or changed required resources refuse preparation.
These fingerprints detect specimen changes; they are not cryptographic identity,
malware scanning or compatibility proof. Additional files are not validated.

The returned map plan always has activate=false and no database activation config.
The bootstrap reports prepared-not-active; the manager source displays a separate
message. The build integration includes the map profile alongside database profiles.
Normal recognized LootPlus behavior remains unchanged in host regression tests.

## Device result

Process 27936 on the rooted 5364 test phone reached character selection without
a loaded player. The new resolver reported map-preflight-verified and seven
resources, with modsActivated=false. A separate diagnostic request selected the
already imported Gladiators entry; the manager's saved selection was untouched.
No map was loaded in this test. The new UI text compiled but was not installed as
an updated APK, so this does not establish a complete manager interaction test.

The original embedded script was restored after the diagnostic. All 1,081 save
files matched the original path/SHA-256 inventory. No character save was changed.

## Validation and remaining work

MapPreflightTest passed complete-plan, changed/missing archive, path traversal,
duplicate-resource and database-layout cases. ResolveSelectionTest and
BootstrapProbeTest passed. The standalone test app with bootstrap activity classes
compiled against API 36 with the existing Java 8-target/deprecation warnings.

Next: isolated character policy and guarded native map activation must consume a
prepared plan before the manager can launch Gladiators. This change deliberately
does not turn laboratory world-entry hooks into unrestricted activation.
