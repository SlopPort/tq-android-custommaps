# XMAX x2 compatibility review - 2026-10-27

Status: import supported; engine activation deliberately not enabled by the current loader profile. No XMAX gameplay result is claimed.

Compared the six-record x2/database/x2.arz from the previously downloaded xmax_v1.1.zip with the embedded assets/database/database.arz in the local 5364 APK. The record records/xpack/game/gameengine.dbr decodes to 2,156 bytes / 175 fields in XMAX, versus 3,036 bytes / 240 fields in this mobile database. All 175 XMAX field names exist in the mobile record; 65 mobile fields are absent from the XMAX record. Eighteen shared fields have different typed values.

The intended spawnMinModifier and spawnMaxModifier change from 100 to 200. Other differences include inventory sack dimensions, potion stack limit (100 versus 25), experience calculation, combat ranges and speed caps. Missing fields include mobile targeting distances and various artifact, scroll, UI and gameplay settings. These are observed data differences, not measured failures or proof of how the engine handles omitted fields.

Therefore, importing the original ZIP successfully does not justify advertising mobile compatibility. A whole-record replacement could affect substantially more than population. Before activation, investigate fallback behavior and isolate test saves. An optional adaptation that preserves mobile-only values would need separate labeling and validation; it must not be called an unchanged XMAX port.

Local evidence: xmax-engine-comparison.json and the read-only ARZ inspection scripts. No game or mod archive is included in this repository. The archive SHA-256 is recorded in the importer test reports. This review covers x2 only, not all XMAX variants or later releases.
