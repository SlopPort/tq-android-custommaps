# Full save-copy validation with shared storage

A read-only ADB export captured 1,081 files from the phone's SaveData tree,
including eight Sys files: winsys.dxg/dxb and the 0, 1 and 2 miscsys.dxg/dxb
pairs. The private snapshot and character data are not published.

On the host, SaveProfileStore created a new profile from that extracted snapshot.
Independent SHA-256 comparison matched all 1,081 copied files against the capture,
including all eight shared-storage files. The path planner mapped every captured
path to its corresponding synthetic profile destination without collisions.
These are host tests using actual captured file contents, not runtime game routing.
The capture was not a game-quiesced transactional snapshot; completeness here means
matching the exported dataset, not proving its gameplay consistency.

SaveProfileTest now creates all eight shared-storage filenames with synthetic
contents, verifies their copies, changes each copy and checks the source stays
unchanged. The extended host test passed along with existing character-write
separation and refusal cases. The extended test has not yet run on Android;
previous Android synthetic coverage predates this addition.

No character was loaded, no native redirect installed and no live save was
intentionally modified in this stage. No before/after device-save comparison was
performed. The observed Sys layout has no Main subdirectory; older planner test
fixtures with Sys/Main were synthetic examples, not device evidence.

Next remains native caravan argument capture and a disposable-profile runtime
read/write test. Successful copying alone must not enable profile activation.
