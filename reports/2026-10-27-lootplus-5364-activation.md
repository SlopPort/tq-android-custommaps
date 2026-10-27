# LootPlus database activation on 5364 - 2026-10-27

A local embedded Gadget experiment loaded the unchanged LootPlus 1.3 database in Android build 3.0.5364. This is a laboratory database-loading proof, not a complete end-user mod manager or proof of compatibility with a stock store APK.

Process 20429, menu thread 20461: eight expected export address/fingerprint checks matched. The engine archive was present and no player was loaded. Before Deserialize, three bounded record reads returned 3/4/4. After the call, they returned 35/60/40. A second read on menu callback 360 returned the same 35/60/40. Record names and fields match the earlier 5339 LootPlus sentinel experiment; this checks three values, not every mod record.

Specimen: 6,075,026 bytes, SHA-256 c9fc86f1229b1f0270c71a6df6338d01b3c5177a580352b2942681aeb7dd7b0c. Source archive and game APK remain local. Runtime also checks specimen size and an accidental-change fingerprint before calling Deserialize. No ARC/MAP loading was performed.

An earlier attempt failed with a native argument conversion error. Passing numeric 0 for the Frida bool argument fixed that call site. The successful process started fresh. No loaded character was present during either database-loading attempt.

Runtime used the embedded script without root injection or a network listener. Root was used for laboratory report readback. The older root Perf/Traders injector remains paused. Import/selection UI is still separate from this fixed-specimen experiment. At this initial checkpoint, gameplay, save/reload, clean-process vanilla restoration and other mods required separate evidence; see the follow-up below. Save isolation is not implemented.

Follow-up: the user replied that the requested short ModProbe gameplay/save/menu check worked. This is user-reported, not instrumented gameplay evidence. After reinstalling the non-activating diagnostic and restarting, process 21147/thread 21178 again read stock 3/4/4, with mutationAttempted=false and no loaded player. This confirms the three checked fields returned to stock values in a fresh non-activating process; it does not yet prove the manager's vanilla button performs the full workflow.
