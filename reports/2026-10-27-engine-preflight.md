# 5364 engine integration checks — 2026-10-27

> Historical checkpoint: limitations and next steps below describe that stage,
> unless a follow-up section says otherwise. For later device results, see the
> [manager workflow](2026-10-27-manager-workflow.md) and [current status](../README.md).


The embedded startup diagnostic matched the expected export RVAs and FNV-1a function fingerprints for Deserialize, GetRecordIndexFromString, GetDatabaseArchive, GetMainPlayer and PlayMenu::Update in process 18062. Fingerprints detect accidental version/code differences; they are not cryptographic authenticity verification or proof of complete ABI compatibility.

A subsequent optional PlayMenu observer ran after 60 menu callbacks in process 18518, thread 18551. GetDatabaseArchive returned a non-null pointer; GetMainPlayer returned null. The user opened character selection manually because the ADB tap did not reach that menu. No database mutation occurred. Root was used for report readback, not runtime injection. Existing Perf/Traders injection remains paused.

Host validation: BootstrapProbeTest passes for matching signatures, address/hash mismatches and missing exports. ModStoreTest, VariantSyntheticTest and SnapshotTest pass. The English-documentation auditor identified outdated status statements; those were corrected.

Next experiment: read three historical LootPlus sentinel records in 5364 before permitting any mutation. Additional exported-function fingerprints have been generated for the read path. The lab database probe is separate from the public import/selection flow and is not a completed loader. Imported ARC/MAP files are not mounted, save isolation is not implemented, and gameplay compatibility remains unverified.

Baseline follow-up: process 19438, menu thread 19477, archive present and player absent. All eight configured export fingerprints matched. Three record samples returned success and bounded buffers (588/408/408 bytes) with values 3/4/4. mutationAttempted=false. Baseline APK SHA-256: 0818916bc3640e4175d64ced2fddf93d14e95c10b8c65d84277794c42725302f.

First activation attempt: process 19922 reached character selection with the expected stock samples. The native call reported `Error: expected an integer`. The diagnostic conservatively reported mutationAttempted=true/error-restart-required; successful deserialization was not established. The process was stopped without loading a character. The Frida bool argument was changed from JavaScript false to numeric 0, and the mocked call test now asserts that exact argument. This is a corrected call-site defect, not evidence of mod compatibility. A fresh-process retest is required.
