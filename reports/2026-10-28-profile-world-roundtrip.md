# Disposable profile: world entry, save and process restart

Build 5364 on Redmi Note 8. The test used the app-private laboratory profile
containing only ModProbe and copied shared storage. No mod database was activated;
this isolates profile behavior from mod compatibility.

## Observed

- Process 23248 loaded ModProbe and displayed the stock Road to Helos world.
- The pause-menu save action displayed the game's save-success confirmation.
- After stopping the process, four files in the profile differed from the initial
  snapshot: Player.chr, map.dat and their backup counterparts. Its file count
  stayed at 271. The original 1,081-file SaveData tree matched its pre-test hashes.
- A new process, 23704, loaded ModProbe again and displayed the world. The probe
  recorded load entry/return and no errors in both processes.
- After the second run, the original 1,081-file tree was again hash-identical.
- The original loader was restored and its SHA-256 verified as
  ef043e20f2deccc7f79ac4f71eabe006d3b2160bbd28cf38be0e7148c2c361cd.
  The game was launched using that loader.

This establishes bounded stock-world save/reload behavior for the disposable
profile. It does not verify quest progression, inventory changes, mod-world saves,
all file writers or complete isolation.

## Laboratory safeguards and untested branches

The script checks six native export addresses and 16-byte prefixes. It redirects
GetUserSaveDataFolder and prepares temporary native filename strings for caravan
StreamIn/StreamOut using the path planner. Native strings are destroyed on return.
Loading is limited to the ModProbe name. Unknown paths, preflight failures and two
cloud-save entry points terminate the lab process rather than continuing silently.
Those termination branches were not exercised and are not production UX.

No caravan stream event occurred in either run. Consequently caravan redirection,
its native string lifetime, and actual shared-item persistence remain UNVERIFIED.
The two cloud entry points are not evidence of complete cloud coverage. Delayed
hook installation also remains a startup-timing limitation. The experiment is
private laboratory code, not an enabled manager feature. Backups remain private.
