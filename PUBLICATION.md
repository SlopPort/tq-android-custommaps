# Publication boundaries

This is an unofficial interoperability research project, not an authorized game release. No affiliation or endorsement by the game's rights holders is claimed.

## What this repository distributes

Original project source, synthetic tests, build instructions, and limited factual research results. Any third-party source or runtime dependency requires a documented license and applicable notices before distribution. Do not assume a repository-wide license grants rights to game content or third-party mods.

## What stays local

Game APKs (original or modified), original DEX/native libraries, extracted or decompiled game source, assets, database/archive files, saves, signing keys and downloaded third-party mods. Do not attach these to issues, actions artifacts, releases or Git LFS. An ignore rule does not remove previously tracked files or history.

Users supply their own lawfully obtained copy. No game downloader, cracked-APK links, purchase-check removal, DLC unlocks or entitlement bypass is part of the supported workflow. If a legitimate build rejects modification, record the limitation; do not silently substitute an unlocked build or disable its checks. The supported route (Magisk module plus a separate app) leaves the installed game unchanged. It has not yet been tested with a Google Play copy; say so wherever support is described.

Link to mod authors' distribution pages. Redistribute a mod only with explicit permission or a license that permits it. Generic import support does not certify every mod's rights or compatibility.

## What releases contain

Only the app built from this repository's source (signed with the project's own key, which stays outside the repository), the Magisk module built by `magisk/build.py`, and the unmodified `frida-inject` binary it bundles (see [THIRD-PARTY.md](THIRD-PARTY.md)). Never a game APK, game files, saves or mods.

## Release checks

- Run `python tools/check-publication.py` before publishing; inspect changes and Git history as well.
- Review provenance and dependency licenses. The automated check cannot determine authorship, licensing, legal status or whether code circumvents protection.
- Build distributable tools from original source only. Do not upload locally rebuilt game APKs.
- Use synthetic fixtures in CI; never upload a game APK, saves or signing keys to a hosted build job.
- Report imported, activated and gameplay-tested states separately. Describe unsupported versions honestly.

A copyright inquiry should receive factual review. Do not automatically submit a DMCA counter-notice or republish removed content under another repository. Legal questions require review of the actual implementation and applicable law; these boundaries are risk-reduction measures, not legal clearance.

The Actions workflow is supplied as `tools/publication-workflow.yml.example`. It is not active: the publishing credential lacks workflow scope. A repository maintainer can install it as `.github/workflows/publication.yml`. Local checks have run successfully.
