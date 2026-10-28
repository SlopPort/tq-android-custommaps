# Profile character creation and deletion

On the installed experimental profile-loader build, the Gladiators profile showed
only ModProbe at character selection. Using the game UI, a disposable character
named ProfileProbe was created. Its encoded directory appeared under that mod's
private SaveData/Main directory. It did not appear in the original SaveData/Main.
Deleting ProfileProbe through the game's confirmation dialog removed that profile
directory, leaving ModProbe. No new character was loaded into gameplay.

A SHA-256 comparison after creation and deletion found all 1,081 original save
files unchanged, with no added or missing files. This is evidence for this menu
workflow on one build, not a guarantee covering all character or cloud operations.
The ModProbe-only gameplay guard remains enabled. Item transfer persistence,
fresh import/profile preparation, combined gameplay and final UI messages remain
release gates.
