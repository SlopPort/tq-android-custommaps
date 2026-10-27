# Gladiators world entry on Android 5364

## Device result

The laboratory prototype loaded the Gladiators map with the existing test
character `ModProbe`. The first successful process was 14776. This is world-entry
evidence, not a claim of complete mod compatibility or a released manager feature.

- All seven supplied resource ARCs registered successfully in source group 0:
  Effects, InGameUI, Maps, Quests, SoundsAndMusic, Text and Textures.
- With the engine's default namespace behavior, `maps/gladiators.map` and
  `Maps/gladiators.map` resolved; bare `gladiators.map` did not. The resolved map
  had 2,866,820 bytes and FNV-1a `1f214379`.
- The fingerprint-checked mod database was deserialized. Three previously absent
  records then passed size and numeric-value checks (41, 11 and 19 numeric cells).
  These checks do not validate every field or the complete database.
- The `Game::LoadGame` hook observed character name `ModProbe`. Only during that
  call did the prototype redirect `World::Load` from `Levels/World/World01.map`
  to `maps/gladiators.map`. `World::Load` returned 1 and `Game::LoadGame` returned.
- A screenshot showed the character inside the mod's rendered interior, with
  terrain, walls, lighting and the minimap visible. The pause menu responded.
- The save button produced the game's saved confirmation. The test then used the
  normal return-to-main-menu flow.

## Save evidence

A private pre-test backup contained 1,081 files. The post-test inventory contained
1,103. All changed or added files were inside the `ModProbe` character directory;
files outside that directory matched the pre-test SHA-256 inventory.

The engine created `maps_gladiators.map/Normal` and related backup files. However,
`Player.chr` and its backup also changed, as did the test character's original
campaign fog-of-war archive. Thus a separate map-state directory is **not full
character isolation**. Main characters were neither loaded nor modified in this
comparison. Both private snapshots remain on the host.

## Known limits

- The location label displayed `tagCave_01`, so text registration/localization is
  incomplete even though Text.arc mounted successfully.
- Injected movement gestures did not establish movement; screenshots did not show
  a clear position change. Movement, navigation and the spawn location require
  further testing. No combat, arena progression or quest completion was verified.
- This is a local diagnostic using root for script deployment and an embedded
  runtime for game calls. It does not prove installation on an unrooted device,
  Google Play compatibility, or normal manager activation of Gladiators.
- Archive/database fingerprints were checked, but this is not a security audit
  of the third-party mod.

## Implementation findings

`GetRecordIndexFromString` returned a nonnegative identifier even for names whose
`GetRecord` result was 0 with no data. The first preflight wrongly treated the
identifier as proof of record presence and refused activation. The corrected
preflight checks record data as well. Full decompressed-byte hashes were not used
as runtime record validation because database string identifiers may be remapped.

The world redirection experiment does not by itself select the right saved map
state. A subsequent prototype sets GameInfo's level name to the mod path inside
`LoadingScreen::GetSaveGame`, scoped to `ModProbe`, before its normal save lookup.
That reload test (PID 15722) failed: two save-selection callbacks ran, then
`Game::LoadGame` received a structure with an empty character name. No redirected
world-load event followed. The game displayed its character/map load failure
dialog and remained alive. The cause is not yet established; merely changing
GameInfo's level name is insufficient. Resuming the saved mod state is unverified.

## Recovery

A second inventory after the failed reload still showed no changes outside the
test character directory. The experimental test save was retained separately,
both in private host backups and in a hidden Preferences directory on the phone.
Only `ModProbe` was restored from the pre-test backup. A full readback then matched
**all 1,081 original save files by path and SHA-256**.

The original embedded script was restored and SHA-256 verified as
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
No new APK or public release was produced. Next priorities are the saved-game
enumeration/map identity contract, spawn/navigation verification and mod text
registration. The successful first world entry must not hide the failed reload.

Recovery startup in process 16332 reached character selection with no loaded
player, vanilla selection, no database mutation and baseline sentinel values
3, 4 and 4. Restored-character gameplay was not re-tested in this recovery run.

Follow-up: the [scoped save-identity correction](2026-10-27-map-save-enumeration.md) subsequently enabled two-process world-entry resumption. This does not validate all saved state or gameplay.
