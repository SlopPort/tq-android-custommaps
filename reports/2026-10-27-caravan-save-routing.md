# Caravan save-root bypass and path-planning tests

## Static finding, build 5364

GetUserSaveDataFolder alone is insufficient for save isolation. Shared caravan
and relic storage construct paths from GetBaseFolder directly. No live routing
hook was installed in this stage; these are instruction-level findings.

- Private OnHide (0xc97974) calls helper 0xc9b9f0, which tail-branches to
  Game::GetPlayerFolder at PLT 0x7d4700. Helpers 0xc9ba64/0xc9ba50 append
  winsys.dxg/winsys.dxb. StreamOut calls are at 0xc979d0 and 0xc979dc.
- Public OnHide (0xc981ec) uses helper 0xc9b3e4 -> GetBaseFolder
  (PLT 0x7b7540). Helper 0xc9b538 appends /SaveData/Sys/ (literal 0xdcfc26).
  It obtains GameInfo::GetModName(true) through 0xc9b658 and builds paths
  ending /winsys.dxg and /winsys.dxb. StreamOut: 0xc98298/0xc982a4.
- Relic OnHide (0xc98b0c) uses the same base-folder helpers, with
  /miscsys.dxg and /miscsys.dxb. StreamOut: 0xc98bb8/0xc98bc4.
- Mobile relic OnHide (0xc9a988) reaches GetBaseFolder through 0xc9b7a4
  and appends /SaveData/Sys/ through 0xc9b3d0. The loop converts the slot
  index to text (0xc9b4bc), builds paths and reaches StreamOut via
  0xc9b8bc -> PLT 0x7b0a90. Calls to that helper: 0xc9aa0c/0xc9aa38.
- Mobile private OnHide (0xc99cac) instead obtains GetPlayerFolder through
  0xc9b9f0, then uses the same slot and StreamOut helpers.
- UICaravanInventory::StreamIn (0xd35e68) and StreamOut (0xd36700) contain
  direct C file operations. Their incoming filename is therefore an additional
  useful observation/routing boundary, independent of GetUserSaveDataFolder.

The complete linear direct-branch scan found 14 references to these two stream
methods, including shared tail helpers. This is not a count of runtime calls.
The two tail helpers were manually inspected instead of trusting their nearest
exported-symbol attribution. Indirect calls and other writers remain unproven.

## Original code added

plan-save-path.js is a pure path planner, not a native hook. It maps paths inside
an explicitly supplied live SaveData root to an independent profile SaveData
root, including Sys and character Backup paths. Already-profile paths remain
there. It rejects overlapping roots, prefix lookalikes, dot components, control
characters, backslashes and paths outside both roots. Repeated slashes normalize.

SavePathPlanTest passed on Node using synthetic character, backup and shared
storage paths, including slot-style filenames. Fixture directories are examples,
not captured runtime paths. The helper is not wired into the installed loader.
It neither checks symlinks nor enforces filesystem isolation. The eventual caller
must validate canonical roots and profile readiness before installing any hooks.
A thrown JavaScript error is not a native-write blocker and must not be treated
as one. Unknown paths need an explicit native fail-closed design before activation.

## Next implementation boundary

Observe returned save roots and incoming caravan filenames before enabling a
profile. A prototype will need both character-root and caravan-path coverage,
with no mid-process profile switch. Cloud synchronization and other cached or
Java-side paths still need separate review. Do not expose runtime profile
activation based solely on the successful lexical path tests.

The phone was connected. No game restart, character load, live-save mutation or
runtime redirection was performed during this stage.
