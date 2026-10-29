# Bounded navigation diagnostic

The movement investigation now has a separate diagnostic module,
`android/bootstrap/navigation-observer.js`. It is not installed by the normal
manager and does not repair maps. Device execution remains untested.

At Level::_PostLoad entry it captures the invocation's level pointer, thread and
stage index. On return it reads the mesh through GetPathMeshRecast and, when
present, queries IsInitialized. This distinguishes absent meshes from present
but uninitialized ones without calling CreatePathMesh or changing arguments.
Nested invocations retain separate state. Only the first 256 invocations are
sampled by default; dropped invocations and read failures are counted. An empty
report or a truncated sample cannot establish map-wide navigation coverage.
Pointer strings identify observations within one process, not persistent regions;
this probe does not identify which terrain area each pointer represents.

## Laboratory use

Before loading a world, verify all descriptors in `navigation-api-5364.json`
using tqPreflightNativeApi, then pass that capability and engine instance to
tqObserveNavigation. Retain its returned object for the process lifetime and
read snapshot() outside the loading callback. The module performs no file I/O
in callbacks. Do not hot-detach it or use an old engine instance after reload.
The descriptors cover three functions in the examined ARM64 build; they do not
establish compatibility with other releases or authenticity of a game copy.

Next device test: collect separate normal-world and Gladiators samples with
ModProbe, verify actual loading callbacks were observed, and compare initialized
mesh results. Keep the original saves and the ordinary-play launch configuration.
Generation remains a separate experiment requiring a verified loading phase,
neighbor-level handling and disposable profile data.

## Validation

NavigationObserverTest.js passed on the host: all three address checks precede
hook installation; nested invocations remain separate; absent/cold/ready results,
read failure, bounded samples, snapshot isolation and architecture refusal are
covered. These mocks do not validate native ABI, thread safety, hook overhead or
actual map navigation. Those require the device test above.
