# Investigating the Gladiators movement failure

The user confirmed that movement remained blocked with a newly created ModProbe,
so the copied stock-world save alone does not explain the symptom. The earlier
world-entry/save tests must not be presented as proof of playable map support.

## Static engine evidence on build 5364

- PathFinder::FindPath at 0x879aa0 loads the implementation pointer at offset 8
  and branches through the resolved PLT entry to PathFinderRecastImpl::FindPath.
  This wrapper does not inspect the mode flag.
- PathFinder::SetRecastMode at 0x8799f4 only stores the boolean at offset 0x10.
  Changing that flag alone cannot switch this FindPath wrapper to the legacy implementation.
- PathFinder::GetPathEngine at 0x87993c returns null. The examined legacy
  PathFinderImpl::LoadPathEngine at 0x89229c returns zero.
- PathMeshRecast::Read at 0x8cce1c checks the three-byte signature REC and a
  fourth byte equal to 2 before accepting the serialized payload. It subsequently
  initializes tile-cache, navigation-mesh and navigation-query objects.
- Level::_PostLoad at 0x8ee6ac registers its Recast mesh only if the pointer exists
  and IsInitialized succeeds.

## Read-only archive comparison

ARC blocks were decompressed locally and their declared lengths checked. The
2,866,820-byte Gladiators map has zero literal REC/version-2 signatures. The
2,008,843,611-byte stock mobile world map has 2,214 occurrences. Both outer map
headers begin with MAP/version 6. These are byte-signature counts, not a complete
structural validation of every occurrence. They support a missing-navigation-data
hypothesis, but do not independently prove which runtime path blocks movement.

The Gladiators InGameUI archive lists two loading-art textures; this inventory
provides no evidence of a joystick UI replacement.

## Candidate repair path

Level::CreatePathMesh at 0x8ef46c calls terrain/grid navigation calculators,
collects entity path data, constructs PathMeshRecast data and registers an
initialized result. The shipped binary therefore contains a possible construction
path. It has not been invoked in this experiment and is not a verified repair.
It may load/unload neighboring levels and must not be called with an assumed
thread, object lifetime or loading phase.

Next: measure whether loaded Gladiators levels actually lack initialized meshes,
then test a bounded reconstruction on disposable data at a verified safe phase.
Check movement, NPC paths, neighboring regions, save/reload and vanilla recovery.
Keep the ordinary-play Perf/vanilla configuration intact while preparing this test.

Private evidence: navigation-dispatch-audit.txt, navigation-read-audit.json,
level-navigation-build-audit.json, navigation-signature-comparison.json.
No game binaries, extracted maps or disassembly are distributed.

## Construction-path follow-up

A scan of executable ELF sections found three direct B/BL references to
Level::_PostLoad, all inside Level::PostLoad, and none to Level::CreatePathMesh
or its resolved PLT entry. Indirect calls and external callers are not covered;
this is not proof that the construction function is unreachable.

The construction helpers are substantial implementations rather than empty
stubs. TerrainPathMeshCalculator::CreateNavigationMesh at 0x8d1e1c reads terrain
samples and impassability. GridPathMeshCalculator::CreateNavigationMesh at
0x9158c8 collects transformed physics faces. PathMeshRecast::Create at 0x8cd3e8
calls Recast heightfield allocation, walkable-triangle marking, rasterization,
filtering, erosion and heightfield-layer building, followed by Detour tile-cache
and navigation-mesh construction. These static calls establish that generation
code ships in this binary; successful generation from the Gladiators data remains
unverified. In particular, required physics meshes and material/walkability data
have not been validated.

Private follow-up evidence: navigation-build-callers.json and
navigation-calculator-audit.json. No runtime generation was attempted, and the
phone's normal-play selection was left unchanged.
