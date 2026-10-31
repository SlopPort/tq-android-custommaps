# Can mods work with data files alone?

Date: 2026-10-31. Game build 3.0.5364 (ARM64). Question: can an unmodified, unrooted installation load a mod if the player only copies files into a location they can write without root (for example `Android/data/com.hg.titanquestultimate` through USB or ADB)?

**Answer: no.** The mobile engine still contains parts of the PC custom-map code, but nothing in a normal game run reaches it, and the game reads no game content from user-writable storage.

## Static analysis of libtq.so

Internal calls in this library go through PLT stubs, so callers were resolved through `.rela.plt` slots as well as direct branches. Data references were checked through `.rela.dyn`.

| Function | Finding |
| --- | --- |
| `MenuManager::GetModsInternal` (scans `CustomMaps/`) | Body is a single `ret`; it finds nothing |
| `MenuManager::GetMods` | Called only from multiplayer server-browser code (`GetModPathByName`, `ServerBrowserMenu::LaunchGame`) |
| `MenuManager::GetLanguagesMods` | No callers |
| `Engine::InitializeMod` → `Engine::LoadCustomMapDatabase` | `InitializeMod` has no callers, no relocations and no data pointers |
| `LocalizationManager::LoadModStrings` | No callers |

The only other references to `CustomMaps/` are in `ServerBrowserMenu::StartConnectToServer`.

## Runtime observation

All archives the running game keeps open come from app-private storage (`files/assetpacks/...`) or the installed APK. During a start to the character list, an inotify watch on the external app folder (`files`, `Preferences`, `Settings`, `SaveData`, `CustomMaps` and a staged mod folder inside it) saw only these accesses:

- `version.txt`
- `Preferences/Settings/options.txt` (read and rewritten) and `customKeybindings.txt`
- `Preferences/SaveData/Main` (character list)

The staged `CustomMaps` mod was never opened. `options.txt` holds only display, sound, input and gameplay options; none names a file or folder.

## Consequence

Content mods need code inside the game process that mounts the mod's archives and loads its database. There are three ways to get it there:

1. **Rebuild and re-sign the game APK.** The store build includes a license and integrity check (pairip) that stops a re-signed copy. Getting past it would mean circumventing the publisher's protection, which this project will not do.
2. **Run the game inside a "virtual app" container.** Same protection issue, and fragile.
3. **Inject into the unmodified installed game with root (Magisk).** The game files and signature stay untouched. This is the route the project will support for store copies.

Save files are the only game data a player can change without root. Editing them can change existing characters and items, but cannot add new content.
