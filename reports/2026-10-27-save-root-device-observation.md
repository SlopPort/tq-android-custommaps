# Save-root observation on Android

Build 5364, Redmi Note 8: an observer was installed through the existing laboratory
script loader after confirming the game was at character selection. No player was
loaded and no mod or save-path redirect was activated by the experiment.

The observer checked exported addresses and the first 16 instruction bytes against
the local library before attaching. It read native string results using the saved
AArch64 indirect-result pointer in x8. It also installed observers for caravan stream arguments,
but no caravan events were captured in this menu-only run.

Process 32646 reported these distinct paths without observer errors:

- GetBaseFolder: `/storage/emulated/0/Android/data/com.hg.titanquestultimate/files/Preferences/`
- GetUserSaveDataFolder: the same prefix followed by `SaveData/`.

The recorded return-address offsets were 0xc72a00 and 0xc6e5b4 respectively.
Events were deduplicated by function and path, so these values do not enumerate
all callers or measure frequency. A screenshot confirmed character selection with
ModProbe visible. This does not establish runtime caravan coverage or isolated
gameplay saves.

SavePathPlanTest now includes the observed root shape and trailing-slash handling,
using a synthetic destination. It passes on Node; it performs no filesystem I/O.

After capture, the process was stopped and the original loader script restored.
Its on-device SHA-256 matched
`ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd`.
The game was launched again. The observer did not intentionally write live saves;
no before/after save-content comparison was performed for this menu-only run.

Next: test caravan argument observation with a disposable profile/character and
complete native refusal handling before enabling runtime redirection.

