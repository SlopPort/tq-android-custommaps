# Gladiators localization: device experiment

Status: one location label verified in the rendered world on build 5364.
This is a laboratory prototype, not manager-integrated map support.

## Failure and correction

Mounting Text.arc alone left tagCave_01 unresolved. Static inspection found
LocalizationManager::LoadModStrings at 0x9340a4, opening Text\modStrings.txt.
In process 21643 the mounted file was 718 bytes of ASCII text. Calling that
function changed HasLocalization(tagCave_01) from false to true. This alone was
not enough: process 22101 displayed a blank location label, and process 22876
returned an empty wide string for the tag through GetText.

The tested workaround in process 23367 bypassed the narrow-text loader. It read
the verified mod's text through the engine FileSystem, accepted only bounded
ASCII input, converted recognized tag lines to 32-bit wide characters and passed
them to the wide-string AddTagToMap overload with the mod flag enabled. It did
not replace the ordinary localization table. Fourteen tag lines were submitted.
GetText returned the expected 18-character location name, and a screenshot after
loading ModProbe showed that name in the location label. The remaining thirteen
tag values and their in-game consumers were not individually verified.

The runtime failure of the narrow route is measured; the cause of the
narrow-loader failure is not yet established. Do not generalize this workaround
to all encodings or all mods. The prototype refuses non-ASCII input rather than
silently decoding it incorrectly. General UTF-8/UTF-16 support remains open.

## Reusable source and validation

android/bootstrap/parse-mod-text.js provides a separate, engine-independent
ASCII parser with a 64 KiB input bound, 4096-character line bound and duplicate
key refusal. It preserves everything after the first equals sign, including
empty values. Unsupported encoding and embedded NUL bytes are rejected.
ModTextTest.js passed its synthetic format, size and refusal checks. A private
host check parsed fourteen entries from the extracted mod file. The reusable
parser is not yet wired into the installed loader; the successful device probe
used its local parsing loop. No third-party text file is included in the repo.

The combined prototype still requires the previously tested save-identity fix
and World::Load redirect. World entry succeeded with the localization workaround.
An injected joystick gesture did not establish movement; navigation, combat and
progression remain unverified. No claim of full Gladiators compatibility follows.

## Recovery

The experiment used only the retained ModProbe save. After stopping the game,
that folder was retained separately and the original restored. All 1,081 save
files matched the pre-test inventory by path and SHA-256. No difference outside
ModProbe was found in the post-test inventory. The original embedded script was
restored and its hash verified. No APK was built or public release made.

Private evidence: gladiators-text-result.json, gladiators-text-empty-value.json,
gladiators-text-wide-world-result.json, gladiators-text-wide-world.png and
text-test-recovery.json. Next: integrate guarded map/resource/text activation
with manager selection and isolated character policy, then test actual gameplay.
