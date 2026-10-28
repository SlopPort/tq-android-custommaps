# Custom map and separate save profile: combined lab roundtrip

## Verified scope

On the build-5364 Android test installation, the Gladiators map loader and the
separate-save routing prototype ran together. Only the disposable ModProbe
character was permitted. This was a locally installed diagnostic script, not the
finished manager workflow or a Google Play installation test.

- Process 28961 loaded `maps/gladiators.map`; the world loader returned 1.
- The custom interior and its location label were visible. The game displayed
  its save confirmation after the manual save action.
- The separate profile contained 22 paths with the Gladiators map name after
  saving. This is not evidence that all 22 files were newly created in this run.
- After stopping and restarting the process, process 29614 loaded the character
  into the same custom interior. Its world loader again returned 1.
- After the second run, all 1,081 original save files matched the pre-test
  SHA-256 inventory, with no added or missing files.
- The original loader script was restored and its SHA-256 checked. Test profile
  data and private evidence were retained separately.

Private evidence: `map-profile-first-gladiators-world-probe.json`,
`map-profile-second-gladiators-world-probe.json`, corresponding profile reports,
three screenshots, and `map-profile-final-save-check.json`. Saves, game files,
and third-party mod archives are not included in this repository.

## Startup ordering correction

An earlier combined attempt refused `Game::LoadGame`: the profile hook had
already modified its entry before the map module checked the original bytes.
Both modules now check their complete API inventories before either installs
hooks. The successful roundtrip used that corrected ordering.

`android/bootstrap/preflight-native-api.js` extracts this ordering into a reusable
compatibility check. It returns addresses only after every supplied API group
passes export, address and byte checks. A later consumer can reuse the verified
addresses after an intentional hook changes a prologue. It does not install
hooks, guarantee an atomic installation, authenticate the game, or handle engine
unload/reload. The caller must keep the engine loaded and prevent other patchers
from changing it between validation and installation.

`NativeApiPreflightTest.js` covers later-group failure, shared functions, changed
bytes, invalid descriptors, unknown exports, changed engine mappings, and reuse
after an intentional prologue change. It is a host test, not a concurrency test.

The extracted check was also substituted into the combined device script. In
process 30983 the profile module reached `ready`, and the map module reached
`ready-for-ModProbe`: seven archives mounted, all three record sentinels matched,
and the location text was retrieved through the localization API. That follow-up stopped at character selection;
it did not repeat gameplay. The original script was restored afterwards.

## Still required

The manager must prepare and bind a validated profile before engine startup and
carry the selected map through this path without replacing a script using ADB.
Deliberate item/stash persistence, a complete cloud-save policy, a gameplay-tested
mod combination, and the final vanilla-return workflow remain open. This result
does not complete the practical release milestone.
