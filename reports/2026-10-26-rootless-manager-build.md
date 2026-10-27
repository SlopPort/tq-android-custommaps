# Embedded manager APK build — 2026-10-26

Target source APK: Titan Quest Ultimate 3.0.5364 (30005364). Packaging success does not establish installability or mod compatibility.

Status: LOCAL BUILD VERIFIED; UNSIGNED; NOT INSTALLED. No rootless gameplay or mod activation claim.

Built the original Java importer and activity against Android API 36, converted to DEX with D8 min API 28. Added classes3.dex, a non-exported ModManagerActivity and an exported launcher alias named Titan Quest Mods. Existing launcher and game activities remain present. Alias provides the initial entry point until an in-game button is integrated. Incoming intents do not trigger arbitrary imports; the activity requires user file selection.

Apktool 3.0.3 downloaded from the official iBotPeaches/Apktool release. Manifest-only decode lost resource references and was rejected. Full resource decoding/rebuild completed successfully. Original assets restored by streaming from the supplied APK. SHA-256 comparison: all 75 checked original assets/native libraries/original DEX entries identical; no missing entries. New classes3.dex present. AAPT confirms both manager and original game activity registrations. Alignment requested for 16 KiB native-library pages.

Local outputs under apk-security: rootless-manager-unsigned.apk and rootless-manager-aligned.apk. These contain proprietary game content and must not be committed or uploaded. Verification: rootless-manager-build-verification.json. Original-source tools added: tools/embed-manager.py and tools/restore-apk-assets.py.

Original APK signature cannot survive modification. A local signing identity and a controlled install/restore step are still required; existing phone installation and saves have not been changed. The stock Application includes com.pairip.application.Application. Whether it accepts a locally signed build is untested; no entitlement or signature-check bypass implemented.

Remaining: signing and device launch validation; in-process bootstrap without root; version-gated mod activation before character load; selection and vanilla mode; separate ARC mounting and map compatibility checks. Current UI explicitly labels imports as unverified, not active.
