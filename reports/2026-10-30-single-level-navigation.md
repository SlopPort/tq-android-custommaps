# First single-level navigation reconstruction in Gladiators

The laboratory test rebuilt one runtime navigation mesh in the Gladiators
starting room. ModProbe then visibly moved across the room, with the camera and
nearby scenery shifting accordingly. The game subsequently displayed its saved
confirmation. This is the first movement evidence after the earlier blocked
movement reports. It is not complete playable-map or restart acceptance.

## Method and guards

The temporary harness fingerprinted 14 native functions before installing a HUD
callback. It waited for ModProbe, a loaded and post-loaded current level, zero
reported world levels loading, and a stable region/level pair over at least 120
callbacks. It checked the level's owning region and required a present but
uninitialized mesh. A separate arm request bound the action to the current PID,
exact level pointer and recognized Gladiators profile. The current bootstrap
report also had to confirm activation of maps/gladiators.map.

The first unarmed run rejected a comparison between an Android kernel thread ID
and the engine's thread identifier. Static inspection showed that GetMainThreadId
reads the low 32 bits of the engine's eight-byte thread global. The second run
compared the full stored handle with pthread_self and checked its low bits against
the engine getter. The handles matched in the HUD callback. These guards reduce
exposure; they do not prove absence of every possible concurrent-loading race.

## Measured result

Process 20915 reported zero levels loading and the expected ModProbe/Gladiators
state before arming. One call to Level::CreatePathMesh at RVA 0x8ef46c returned
after approximately 429 ms of wall time. The level pointer and mesh pointer
remained the same, and IsInitialized changed from false to true. Exactly one
generation attempt was made. The process remained alive and subsequent movement
was visible after injected joystick input. Movement was also exercised in the
opposite direction before saving the test character.

The 429 ms measurement covers the synchronous generation call. It is not an FPS
benchmark or evidence that generation is cheap enough for normal gameplay.
Moving this work to a suitable loading phase or retaining prepared navigation
data requires separate engineering and validation.

## Limits and next work

- This was a root-assisted laboratory operation, not the manager's ordinary flow.
- Only the player's current level was rebuilt. Neighboring regions, NPC routes,
  combat and collision behavior have not passed a full regression test.
- Save confirmation was observed, but save/restart/reload with automatically
  rebuilt navigation remains untested.
- No serialized mod map or ARC was rewritten by the harness. The change was to
  runtime navigation, and persistence across a process restart is not provided.
- Perf stayed off. Its separate pause-menu regression remains unresolved.

Next: turn this into bounded, recognized-map startup preparation, then test
neighbor traversal, NPC paths, save/restart/reload and vanilla recovery. Do not
enable it generally for unknown maps based on this one successful room.

Private evidence: nav-rebuild-api.json, navigation-lifetime-audit.json,
nav-rebuild-before-arm.json, nav-rebuild-one-level-result.json,
nav-rebuild-before-move.png, nav-rebuild-after-move.png,
nav-rebuild-move-back.png and nav-rebuild-save-confirmation.png.
No game binaries, maps, screenshots, saves or disassembly are distributed.
