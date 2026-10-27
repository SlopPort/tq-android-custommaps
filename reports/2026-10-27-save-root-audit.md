# Save-root routing audit (build 5364)

Static inspection identifies Game::GetUserSaveDataFolder at RVA 0xc6e004 as a
candidate routing boundary. This is not an implemented or tested runtime redirect.

The function reaches GetBaseFolder through helper 0xc7b1b4 and PLT 0x7b7540,
then passes the literal SaveData/ (0xdcbd27) to helper 0xc7a8e4 and 0x89cbdc.
The helpers preserve the indirect C++ return destination supplied in x8.
A replacement must respect the native string ABI and ownership; replacing an
ordinary pointer return would be incorrect.

A complete linear scan of .text found 19 direct BL references to the resolved
GetUserSaveDataFolder PLT (0x7da010). Caller ownership was attributed using the
nearest preceding exported symbol, so names are attribution evidence rather than
proof of full function boundaries. Representative instructions:

- 0xc72dfc: GetPlayerFolder, character path construction.
- 0xc766b8: GetSavedGames, saved-character enumeration.
- 0xc6e5b0: CreateGameFolders.
- 0xc40154: NewCharacterWindow::GetUnusedSaveID.
- 0xc42ee4 and 0xc42f08: PlayMenu::GetSavedCharacters.
- 0xd5a9d0: CloudSaveManager::SaveCaravan.
- 0xd5ad14: CloudSaveManager::SaveAllCharactersAndCaravan.

Other references occur in menu UI state, old-save conversion, fog-archive
conversion and direct player-name reading. This boundary affects more than the
character list. Cloud-save callers require particular attention: redirecting local
paths alone does not establish separate remote storage or safe synchronization.

GetPlayerFolder also appends Main/ and conditionally Backup/. CreateGameFolders
separately calls GetBaseFolder and GetUserSettingsFolder. Redirecting the broader
base folder would therefore have additional scope and is not selected here.

## Limits and next experiment

Direct-call enumeration does not cover inlining, indirect calls, cached paths,
Java/cloud-side access or all caravan writers. No completeness claim is made.
The phone was connected, but no hooks were installed, game restarted or live saves
modified during this audit. No performance measurement was taken.

Next: observe the candidate's returned paths and timing before character-list
creation, then audit local caravan writers and cloud handling. Only after that
should an isolated synthetic profile be used for a scoped routing experiment.
Keep the profile immutable for a game process; switching while a player or cached
save paths exist is outside the proposed initial test.
