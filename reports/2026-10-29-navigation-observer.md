# Bounded navigation diagnostic

The movement investigation now has a separate diagnostic module,
`android/bootstrap/navigation-observer.js`. It is not installed by the normal
manager and does not repair maps. It was initially host-tested only; the device
follow-up below records its first native execution.

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

## Device follow-up

The observer ran in fresh processes on the rooted build-5364 phone. With LootPlus
selected and its separate ModProbe save profile active, the stock world near Helos
rendered normally. The sample contained 65 completed callbacks, including nine
distinct level-pointer values with initialized meshes. A snapshot at character
selection preceded world entry. In a separate Gladiators process with Perf off,
the custom world rendered and all 25 completed observations reported present but
uninitialized meshes. Both runs had zero probe errors and zero dropped samples.
Counts include menu loading, and pointer values can be reused after destruction;
they must not be interpreted as a census of regions. The Perf settings differed
between these two runs, so this is not a fully controlled causal experiment.
It strengthens the missing-navigation hypothesis without proving a repair.

A subsequent Gladiators run with the startup-order fix and Perf on activated the
map and entered its world. No navigation generation was attempted. Separate
startup logs verified all seven requested engine patches active; the PLT pass
skipped one mismatching instruction after the map hook had been installed.

The Perf-enabled control also showed abnormally small pause-menu buttons.
The Perf-off Gladiators run showed normal pause buttons. These are different
worlds, so the responsible component has not been isolated. This remains a UI
regression investigation, separate from the map's missing initialized meshes.

After the first pair of runs, all 1,081 original SaveData files still matched
the retained SHA-256 baseline, with no added or missing files. Test gameplay used
only isolated ModProbe profiles. Private evidence includes
navigation-control-world-live.json, navigation-gladiators-world-live.json,
navigation-perf-order-world.json and navigation-original-save-comparison.json.
