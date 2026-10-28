# Early profile installation and extracted map adapter

## Startup experiment

The first experiment used Frida's module observer. Its documented callback runs
synchronously when a new module is added ([Frida API](https://frida.re/docs/javascript-api/#process)).
On this Android test installation, process 1251 instead aborted in the system
linker with `Load CHECK 'did_read_' failed`, before the experiment wrote its
module-entry report. The exact cause was not established; that approach is not
used by the committed helper.

`observe-engine-startup.js` instead instruments the exported `dlopen` and
`android_dlopen_ext` return paths. It installs the profile hooks synchronously
after `libtq.so` loads, before the loader's application caller resumes. It checks
that the engine was absent at registration and deduplicates nested loader calls.
This happens after ELF constructors, not before them. Engine unload/reload and
loading through other entry points are not supported by this helper.

In process 1833, the callback ran on thread 1833 while the exported game-object
pointer was null. The profile module then recorded 17 save-root redirects and a
completed ModProbe load into Gladiators. This establishes the observed ordering
for that launch, not coverage of every possible save-enumeration path.

## Extracted map adapter

`gladiators-map-runtime.js` takes its archive root, trusted resource fingerprints,
record checks, preflight capability and reporting callback as arguments. It no
longer contains a fixed imported-library directory or report-file path. It remains
limited to the verified Gladiators specimen and the disposable ModProbe character.
The packaged manager does not enable this adapter yet.

The native inventory now covers the wide-text assignment/destruction and
localization functions used by the adapter, in addition to the previously checked
map functions. `map-api-5364.json` contains compatibility fingerprints;
`gladiators-runtime-5364.json` contains the specimen's filenames, fingerprints and
small record checks. Neither file contains game or mod archives.

Process 3096 combined the extracted map adapter, save-profile module and early
loader hook. Seven archives mounted, three database sentinels matched, map identity
correction ran, and `World::Load` returned 1 for `maps/gladiators.map`. The custom
interior and location label were visible. This used a diagnostic wrapper with a
constructed selection, not the final manager-to-game workflow.

After these tests, all 1,081 live save files matched the baseline inventory. The
original script was restored, its SHA-256 checked, and the game stopped. No
deliberate stash transfer or combined-mod gameplay test occurred in this stage.

`EngineStartupTest.js` passed mocked checks for synchronous installation, flushing,
nested-call deduplication, and late/failed/remapped/asynchronous refusal. Native
evidence remains in private `early-first-*` and `early-modules-*` reports and the
world screenshot. Final startup integration, profile-only character enumeration,
and recovery through the manager remain acceptance gates.
