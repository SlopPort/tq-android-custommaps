# Missing and tiny pause-menu labels with Perf

The affected screen is the in-game pause menu containing Save game, Options and
Return to main menu. The user also reported missing labels when using vanilla.
Selecting vanilla changes the mod database choice; it does not disable Perf.
This is an open regression, not a completed fix.

## Device observations

Tests used the isolated LootPlus ModProbe profile in the stock world near Helos,
with fresh processes between variants. No main character was intentionally loaded.

| Variant | Evidence | Result |
| --- | --- | --- |
| Full Perf and overlay | Previous process 20097 | Tiny buttons and mostly unreadable labels |
| Seven engine patches, overlay disabled | Process 27412 | Normal pause labels and button sizes |
| Overlay logic retained, draw function omitted | Process 28122 | Normal pause labels and button sizes |
| Only overlay glDrawArrays omitted | Process 29087 | Normal pause labels and button sizes |
| Experimental EGL-context guard, full drawing | Process 29749 | Normal labels; guard recorded zero skipped contexts |

Current-process patch reports confirmed the requested engine patches active for
the diagnostic variants. The context-guard result does not prove a context-switch
cause: it did not record any blocked context. It also means these observations
are insufficient to attribute the failure uniquely to glDrawArrays. Timing,
layout changes introduced by instrumentation and reproduction consistency still
need investigation. No diagnostic variant is presented as a production repair.

The unchanged installed script was restored after these temporary root-assisted
tests. The ordinary game APK was not replaced during this investigation. Perf
was temporarily disabled through the saved launch preference while checking
the menu without the overlay. Turning it off requires a fresh game process.
The manager's vanilla selection is restored when testing finishes.

Private evidence: pause-no-overlay-patches.json, pause-no-draw-patches.json,
pause-no-drawarrays-patches.json, pause-context-guard-patches.json and the
corresponding screenshots. These screenshots and game binaries are not published.

Next: reproduce the failure with the unchanged overlay in the same world, capture
rendering state around its draw, and verify Save game, Options and return flow
after a real repair. Keep navigation generation and this UI regression separate.

## Check with the unchanged script and Perf off

Process 12453 used the unchanged installed script, Perf disabled and the isolated
LootPlus ModProbe profile. After the stock world near Helos visibly finished
loading, the in-game pause menu showed readable labels and normal button sizes.
Save game displayed the game's saved confirmation. Options opened with readable
tabs and fields; it was cancelled without changing settings. Return to main menu
then returned to the title screen. This validates the temporary Perf-off workflow
for this profile, not a repaired Perf overlay or every vanilla save.

Private evidence: pause-restored-off-menu.png, pause-restored-off-save.png,
pause-restored-off-options.png, pause-restored-off-return.png and
pause-restored-off-bootstrap.json.
