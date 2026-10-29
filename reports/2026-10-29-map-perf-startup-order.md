# Install map hooks before optional Perf rewriting

A Perf-enabled Gladiators launch stopped at the map adapter's existing
"Enumeration call mismatch" check. The next launch with Perf disabled activated
the map. The adapter checks a BL instruction before attaching its save-map
identity correction. Perf's PLT optimization can rewrite that instruction before
the adapter runs; the original check must not simply be removed or weakened.

The orchestrator now defers optional Perf initialization for custom maps until
the map adapter returns ready-for-ModProbe. This keeps byte verification and
hook installation ahead of PLT rewriting. Vanilla and database-only launch timing
remain unchanged. A failed map activation does not start Perf.

On-device process 24092 first reported Perf waiting-for-map, then map ready and
Perf initialization-finished. The current-process native patch report separately
verified all seven requested patches active. The PLT pass applied 118,836 sites
and skipped one mismatch, compared with its 118,837-site input. The loader then
reported ModProbe entering maps/gladiators.map with World::Load returning 1.
This is activation and world-entry evidence, not movement or full compatibility
acceptance. The map still lacks initialized meshes in the diagnostic sample.

ProfileLoaderTest.js checks deferred ordering, exactly one Perf start after
successful activation, no Perf start on map failure, repeated menu callbacks,
and preserved early Perf launch for vanilla. All 14 JavaScript suites passed before publication. The separate pause-menu sizing regression
observed with Perf remains under investigation.

Private evidence: navigation-perf-order-startup.json,
navigation-perf-order-character.json, navigation-perf-order-patches.json and
navigation-perf-order-world.json. No game or module binaries are distributed.

The ordinary local build was rebuilt and installed without the navigation
observer: APK SHA-256
ce43598b87dee5d5769da4ae399f25d63362914b944a2122a0ae69cb039d3551.
Installed-script readback confirmed the new ordering and absence of the probe.
Fresh vanilla startup in process 25182 reported all seven requested patches and
the overlay active. A 1,081-file original-save backup was validated before the
installation. Final stored launch choices are vanilla and Perf on. This startup
check does not clear the pause-menu regression or prove full gameplay support.
