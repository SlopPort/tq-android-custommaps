# Build the standalone importer test app

This builds only this project's Java code. It contains no game files and cannot activate mods inside Titan Quest. It is useful for testing the file picker, variant selection and import persistence without replacing the game.

Requirements: Python 3, a JDK, Android SDK platform 36 and build-tools 35.0.0. The script does not download dependencies. Supply your actual local paths:

```text
python tools/build-import-test.py --jdk "PATH_TO_JDK" --sdk "PATH_TO_ANDROID_SDK" --out "NEW_OUTPUT_DIRECTORY"
```

The output directory must not already exist. The script compiles Java, creates DEX, packages and aligns `import-test-unsigned.apk`. Sign that file locally with Android SDK apksigner and a test key before installation. Keep the key outside this repository. Updating an existing test installation requires the same key; do not uninstall it if you need to preserve imported test data.

The test application is named **TQ Mods Import Test**, package `org.tqmods.importtest`. It requests no permissions. After installation, open it, tap **Add mod**, pick your own mod ZIP and choose a variant if asked. Imported entries are not activated in the game.

The independent bootstrap probe is a separate experiment and is not included by this build script. Its native runtime and licensing need separate review before distribution. Local bootstrap APK creation does not establish successful device execution.

Validated locally on Windows with JDK 25 and Android SDK 36 / build-tools 35.0.0. Compilation emits Java 8 target-obsolescence warnings; no compiler error occurred in the successful build. Other environments are not yet verified.
