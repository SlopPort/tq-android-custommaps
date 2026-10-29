package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.database.Cursor;
import android.provider.OpenableColumns;
import android.util.AtomicFile;
import org.json.JSONObject;
import android.widget.*;
import java.io.*;
import java.util.concurrent.*;

/** Embed in the game APK: this activity must share the game's app UID. */
public final class ModManagerActivity extends Activity {
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private TextView status;
    private TextView runtime;
    private LinearLayout list;
    private Button add;
    private ModStore store;
    private ImportSnapshot pending;
    private static boolean selectionPending;
    private static boolean importPending;
    private boolean ownsOperation;
    private final android.os.Handler uiHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable waitForOperation = new Runnable() {
        public void run() {
            if (isDestroyed()) return;
            if (store != null) refresh();
            if (isBusy()) uiHandler.postDelayed(this, 200);
        }
    };
    public static boolean isBusy() { return selectionPending || importPending; }
    private LinearLayout controls;
    private void updateControls() {
        setControlsEnabled(controls, !selectionPending && !importPending && store != null);
    }
    private void setControlsEnabled(android.view.View view, boolean enabled) {
        if (view instanceof Button) view.setEnabled(enabled);
        if (view instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) setControlsEnabled(group.getChildAt(i), enabled);
        }
    }
    public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this); layout.setOrientation(1); layout.setPadding(24,24,24,24);
        controls = layout;
        status = new TextView(this); status.setText("Experimental mod library. Save and close the game before applying a different selection.");
        runtime = new TextView(this);
        add = new Button(this); add.setText("Add mod (ZIP / ARZ)");
        list = new LinearLayout(this); list.setOrientation(1);
        layout.addView(status); layout.addView(runtime);
        Switch perf = new Switch(this); perf.setText("Perf - engine optimizations and graphics menu");
        try { perf.setChecked(RuntimeFeatures.perf(getFilesDir())); }
        catch (Exception error) { status.setText("Cannot read Perf settings: " + error.getMessage()); perf.setEnabled(false); }
        perf.setOnCheckedChangeListener((button, checked) -> {
            try { RuntimeFeatures.setPerf(getFilesDir(), checked); status.setText("Perf " + (checked ? "enabled" : "disabled") + " for the next fresh start. Save and close the app before restarting."); }
            catch (Exception error) { status.setText("Could not save Perf settings: " + error.getMessage()); }
        });
        layout.addView(perf);
        Button pin = new Button(this); pin.setText("Add manager to Home screen");
        pin.setOnClickListener(v -> {
            android.content.pm.ShortcutManager shortcuts = getSystemService(android.content.pm.ShortcutManager.class);
            if (shortcuts == null || !shortcuts.isRequestPinShortcutSupported()) { status.setText("Add Titan Quest Mods from your app drawer to the Home screen."); return; }
            Intent target = new Intent(Intent.ACTION_MAIN); target.setClassName(getPackageName(), "org.tqmods.Launcher");
            android.graphics.Bitmap icon = android.graphics.Bitmap.createBitmap(96, 96, android.graphics.Bitmap.Config.ARGB_8888);
            android.graphics.drawable.Drawable art = getApplicationInfo().loadIcon(getPackageManager());
            art.setBounds(0, 0, 96, 96); art.draw(new android.graphics.Canvas(icon));
            android.content.pm.ShortcutInfo shortcut = new android.content.pm.ShortcutInfo.Builder(this, "tq-mod-manager")
                .setShortLabel("TQ Mods + Perf").setLongLabel("Titan Quest Mods and Perf")
                .setIcon(android.graphics.drawable.Icon.createWithBitmap(icon))
                .setIntent(target).build();
            shortcuts.requestPinShortcut(shortcut, null);
        });
        layout.addView(pin); layout.addView(add); layout.addView(list);
        Button vanilla = new Button(this); vanilla.setText("Select vanilla (no mod)");
        layout.addView(vanilla);
        vanilla.setOnClickListener(v -> select(null));
        if (getPackageName().equals("com.hg.titanquestultimate")) {
            Button backup = new Button(this); backup.setText("Export character backup (ZIP)"); layout.addView(backup);
            backup.setOnClickListener(v -> {
                if (!canBackUp()) return;
                Intent target = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                target.addCategory(Intent.CATEGORY_OPENABLE); target.setType("application/zip");
                target.putExtra(Intent.EXTRA_TITLE, "TitanQuest-saves-" + System.currentTimeMillis() + ".zip");
                startActivityForResult(target, 101);
            });
            Button restore = new Button(this); restore.setText("Restore character backup"); layout.addView(restore);
            restore.setOnClickListener(v -> {
                if (!canBackUp()) return;
                new android.app.AlertDialog.Builder(this).setTitle("Restore all characters from a backup?")
                    .setMessage("Choose a ZIP exported by this manager. It replaces the current SaveData folder after checksum verification. The previous folder is retained on this phone. Close the game first.")
                    .setNegativeButton("Cancel", null)
                    .setPositiveButton("Choose backup", (dialog, which) -> {
                        Intent input = new Intent(Intent.ACTION_OPEN_DOCUMENT); input.addCategory(Intent.CATEGORY_OPENABLE);
                        input.setType("application/zip"); startActivityForResult(input, 102);
                    }).show();
            });
            Button start = new Button(this); start.setText("Open game"); layout.addView(start);
            start.setOnClickListener(v -> {
                if (selectionPending || importPending) return;
                Intent game = new Intent(); game.setClassName(getPackageName(), "org.tqmods.GameBootstrapActivity");
                try { startActivity(game); } catch (Exception error) { status.setText("Game bootstrap unavailable: " + error.getMessage()); }
            });
            Button close = new Button(this); close.setText("Close app for a fresh start"); layout.addView(close);
            close.setOnClickListener(v -> new android.app.AlertDialog.Builder(this)
                .setTitle("Have you saved your character?")
                .setMessage("This closes the game process. Unsaved progress will be lost. Afterwards open Titan Quest Mods again, choose a mod or vanilla, then tap Open game.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Saved - close app", (dialog, which) -> {
                    if (!selectionPending && !importPending) android.os.Process.killProcess(android.os.Process.myPid());
                }).show());
        }
        ScrollView scroll = new ScrollView(this); scroll.addView(layout); setContentView(scroll);
        try { store = new ModStore(new File(getFilesDir(), "tqmods/library")); refresh(); }
        catch (IOException e) { status.setText(e.getMessage()); add.setEnabled(false); }
        add.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("*/*");
            startActivityForResult(intent, 100);
        });
        updateControls();
    }
    private void refresh() {
        list.removeAllViews();
        String selected = null;
        AtomicFile requestFile = new AtomicFile(new File(getFilesDir(), "tqmods/request.json"));
        try {
            JSONObject request = new JSONObject(new String(requestFile.readFully(), "UTF-8"));
            if (!request.isNull("id")) selected = request.getString("id");
        } catch (FileNotFoundException absent) { /* No selection yet. */ }
        catch (Exception error) { status.setText("Cannot read saved selection. Select a mod or vanilla again."); }
        for (File dir : store.installed()) {
            TextView row = new TextView(this);
            row.setText(ModStore.title(dir) + (dir.getName().equals(selected)
                ? "\nSelected for next fresh start; selection alone does not confirm activation."
                : "\nImported; compatibility not tested")); row.setPadding(0,16,0,16);
            list.addView(row);
            Button choose = new Button(this); choose.setText("Select this mod");
            choose.setOnClickListener(v -> select(dir.getName())); list.addView(choose);
            if (getPackageName().equals("com.hg.titanquestultimate")) {
                Button profile = new Button(this);
                boolean prepared = new File(getFilesDir(), "tqmods/save-profiles/" + dir.getName() + "/SaveData").isDirectory();
                profile.setText(prepared ? "Separate save copy already prepared" : "Prepare separate save copy");

                profile.setOnClickListener(v -> {
                    if (prepared) { status.setText("A separate copy already exists and has not been replaced. Use a supported profile-enabled loader to play from it."); return; }
                    if (!canBackUp()) return;
                    new android.app.AlertDialog.Builder(this).setTitle("Prepare copies for this mod?")
                        .setMessage("Copies all current characters and their SaveData files into a separate profile. Originals remain unchanged. Playing from this copy requires a supported profile-enabled loader. Existing profiles are never replaced.")
                        .setNegativeButton("Cancel", null)
                        .setPositiveButton("Prepare copy", (dialog, which) -> prepareSaveProfile(dir.getName())).show();
                });
                list.addView(profile);
            }

        }
        runtime.setText("No runtime confirmation in this process.");
        try {
            AtomicFile report = new AtomicFile(new File(getFilesDir(), "bootstrap-status.json"));
            JSONObject state = new JSONObject(new String(report.readFully(), "UTF-8"));
            if (state.getInt("pid") == android.os.Process.myPid()) {
                JSONObject menu = state.optJSONObject("menuProbe");
                JSONObject database = menu == null ? null : menu.optJSONObject("database");
                JSONObject map = menu == null ? null : menu.optJSONObject("map");
                JSONObject choice = menu == null ? null : menu.optJSONObject("selection");
                String detail = database != null ? database.optString("status")
                    : choice != null ? choice.optString("status") : "waiting for character selection";
                String message;
                if (state.optString("status").equals("refused")) message = "Startup was refused. Close the app and check the selected mod before retrying.";
                else if (state.optBoolean("modsActivated") && map != null && map.optString("status").equals("ready-for-ModProbe")) message = "Experimental map activated for ModProbe only. Use a disposable test character.";
                else if (detail.equals("overrides-verified")) message = "Database changes verified in this process. Gameplay compatibility is not guaranteed.";
                else if (detail.equals("baseline-verified")) message = "The monitored database values match the unmodified game.";
                else if (detail.equals("vanilla")) message = "No mod requested for this process.";
                else if (detail.equals("map-preflight-verified")) message = "Map files match the tested package. This loader has not activated the map.";
                else if (detail.equals("unsupported")) message = "Selected file is not supported yet. This loader did not activate it.";
                else if (detail.contains("error") || detail.contains("mismatch") || detail.equals("refused"))
                    message = "Activation check failed. Close the app before playing or retrying.";
                else message = "Open character selection to check the selected mod.";
                runtime.setText(message + " Changing selection requires closing the app and a fresh start.");
            }
        } catch (Exception absent) { /* No current runtime report. */ }
        updateControls();
    }
    protected void onResume() { super.onResume(); waitForOperation.run(); }
    protected void onPause() { uiHandler.removeCallbacks(waitForOperation); super.onPause(); }
    private void select(String id) {
        if (selectionPending || importPending || store == null) return;
        selectionPending = true;
        status.setText("Saving selection. Please wait...");
        updateControls();
        // Persist intent only. Never interpret this preference as runtime activation evidence.
        io.execute(() -> {
            boolean committed = false;
            try {
                JSONObject request = new JSONObject(); request.put("schema", 1);
                request.put("id", id == null ? JSONObject.NULL : id);
                request.put("database", id == null ? JSONObject.NULL
                    : store.database(new File(getFilesDir(), "tqmods/library/" + id)).getPath());
                request.put("size", id == null ? 0
                    : store.database(new File(getFilesDir(), "tqmods/library/" + id)).length());
                org.json.JSONArray resources = new org.json.JSONArray();
                if (id != null) for (File resource : store.resources(new File(getFilesDir(), "tqmods/library/" + id))) {
                    JSONObject item = new JSONObject(); item.put("path", resource.getPath());
                    item.put("size", resource.length()); resources.put(item);
                }
                request.put("resources", resources); // Inventory, not permission to mount.
                AtomicFile file = new AtomicFile(new File(getFilesDir(), "tqmods/request.json"));
                FileOutputStream stream = null;
                try {
                    stream = file.startWrite();
                    stream.write(request.toString().getBytes("UTF-8"));
                    file.finishWrite(stream); stream = null;
                } catch (Exception error) { if (stream != null) file.failWrite(stream); throw error; }
                committed = true;
            } catch (Exception error) { committed = false; }
            final boolean saved = committed;
            runOnUiThread(() -> {
                selectionPending = false;
                if (isDestroyed()) return;
                status.setText(!saved ? "Could not save selection. Try again."
                    : id == null ? "Vanilla selected for next fresh start. This does not unload an already active mod."
                    : "Selection saved for next fresh start. Only the recognized LootPlus specimen has laboratory activation evidence.");
                if (store != null) refresh();
            });
        });
    }
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 101) {
            if (result == RESULT_OK && data != null && data.getData() != null && canBackUp()) exportBackup(data.getData());
            return;
        }
        if (request == 102) {
            if (result == RESULT_OK && data != null && data.getData() != null && canBackUp()) restoreBackup(data.getData());
            return;
        }
        if (request != 100 || result != RESULT_OK || data == null || data.getData() == null) return;
        final android.net.Uri uri = data.getData();
        stageUri(uri);
    }
    private boolean canBackUp() {
        if (selectionPending || importPending) return false;
        try (BufferedReader maps = new BufferedReader(new FileReader("/proc/self/maps"))) {
            String line;
            while ((line = maps.readLine()) != null) if (line.contains("libtq.so")) {
                status.setText("Save your character, close the app, then reopen Titan Quest Mods. Export the backup before Open game.");
                return false;
            }
            return true;
        } catch (IOException error) {
            status.setText("Cannot verify that the game is stopped. Backup was not started."); return false;
        }
    }
    private void prepareSaveProfile(String id) {
        if (!canBackUp()) return;
        ownsOperation = true; importPending = true; updateControls();
        status.setText("Preparing separate save copy. Please wait...");
        io.execute(() -> {
            String message;
            try {
                File external = getExternalFilesDir(null);
                if (external == null) throw new IOException("Game storage unavailable");
                // canBackUp checked the current process; the busy gate blocks game startup.
                SaveProfileStore.create(new File(external, "Preferences/SaveData"),
                    new File(getFilesDir(), "tqmods/save-profiles"), id, false);
                message = "Separate save copy prepared. Originals are unchanged. Profile creation alone does not confirm that the game is using it.";
            } catch (Exception error) { message = "Could not prepare save copy: " + error.getMessage(); }
            final String result = message;
            runOnUiThread(() -> { importPending = false; if (!isDestroyed()) { status.setText(result); refresh(); } });
        });
    }
    private void exportBackup(android.net.Uri target) {
        ownsOperation = true;
        importPending = true; updateControls(); status.setText("Exporting character backup. Please wait...");
        io.execute(() -> {
            File snapshot = null;
            String message;
            try {
                File external = getExternalFilesDir(null);
                if (external == null) throw new IOException("Game storage unavailable");
                snapshot = File.createTempFile("save-backup-", ".zip", getCacheDir());
                int count;
                try (OutputStream output = new FileOutputStream(snapshot)) {
                    count = SaveBackup.write(new File(external, "Preferences/SaveData"), output);
                }
                try (InputStream input = new FileInputStream(snapshot);
                     OutputStream output = getContentResolver().openOutputStream(target, "wt")) {
                    if (output == null) throw new IOException("Cannot open backup destination");
                    byte[] buffer = new byte[65536]; int read;
                    while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
                }
                message = "Backup exported: " + count + " files with SHA-256 checksums. Keep it outside the game's app storage. Restore is available through this manager.";
            } catch (Exception error) {
                message = "Backup failed: " + error.getMessage() + ". Do not use the destination file; it may be incomplete.";
            } finally { if (snapshot != null) snapshot.delete(); }
            final String result = message;
            runOnUiThread(() -> { importPending = false; if (!isDestroyed()) { status.setText(result); updateControls(); } });
        });
    }
    private void restoreBackup(android.net.Uri source) {
        ownsOperation = true;
        importPending = true; updateControls(); status.setText("Verifying and restoring backup. Please wait...");
        io.execute(() -> {
            File snapshot = null; String message;
            try {
                File external = getExternalFilesDir(null);
                if (external == null) throw new IOException("Game storage unavailable");
                snapshot = File.createTempFile("restore-", ".zip", getCacheDir());
                try (InputStream input = getContentResolver().openInputStream(source); OutputStream output = new FileOutputStream(snapshot)) {
                    if (input == null) throw new IOException("Cannot open backup");
                    byte[] buffer = new byte[65536]; long total = 0; int count;
                    while ((count = input.read(buffer)) != -1) {
                        total += count; if (total > 512L * 1024 * 1024) throw new IOException("Backup input too large");
                        output.write(buffer,0,count);
                    }
                }
                File retained = SaveRestore.restore(snapshot, new File(external, "Preferences/SaveData"));
                message = "Backup restored. Previous saves retained in Preferences/" + retained.getName() + ". Keep your exported ZIP too.";
            } catch (Exception error) { message = "Restore failed: " + error.getMessage() + ". Do not start the game until recovery is checked."; }
            finally { if (snapshot != null) snapshot.delete(); }
            final String result = message;
            runOnUiThread(() -> { importPending = false; if (!isDestroyed()) { status.setText(result); updateControls(); } });
        });
    }
    private void stageUri(final android.net.Uri uri) {
        ownsOperation = true;
        importPending = true; updateControls(); status.setText("Copying selected file…");
        io.execute(() -> {
            try {
                String name = null;
                try (Cursor cursor = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
                    if (cursor != null && cursor.moveToFirst()) name = cursor.getString(0);
                }
                try (InputStream stream = getContentResolver().openInputStream(uri)) {
                    if (stream == null) throw new IOException("Cannot open selected file");
                    pending = ImportSnapshot.create(new File(getCacheDir(), "mod-inputs"), stream, name);
                }
                importPending(null);
            } catch (Exception e) { finishImport("Import failed: " + e.getMessage()); }
        });
    }
    // Runs on the single IO executor, including each variant retry.
    private void importPending(final String variant) {
            String message;
            try {
                try (InputStream stream = pending.open()) {
                    store.importFile(stream, pending.name, variant);
                }
                message = "Imported. Select this mod and use a compatible loader; importing alone does not activate it.";
            } catch (ModStore.VariantRequired choice) {
                runOnUiThread(() -> {
                    if (isDestroyed()) return;
                    new android.app.AlertDialog.Builder(this).setTitle("Choose variant")
                        .setItems(choice.variants, (dialog, which) -> io.execute(() -> importPending(choice.variants[which])))
                        .setNegativeButton("Cancel", (dialog, which) -> io.execute(() -> finishImport("Import cancelled")))
                        .setOnCancelListener(dialog -> io.execute(() -> finishImport("Import cancelled"))).show();
                });
                return;
            } catch (Exception e) { message = "Import failed: " + e.getMessage(); }
            finishImport(message);
    }
    private void finishImport(String message) {
            if (pending != null) {
                try { pending.close(); } catch (IOException e) { message += "; " + e.getMessage(); }
                pending = null;
            }
            final String text = message;
            runOnUiThread(() -> { importPending = false; if (!isDestroyed()) { status.setText(text); refresh(); } });
    }
    protected void onDestroy() {
        if (ownsOperation) io.execute(() -> finishImport("Import cancelled"));
        io.shutdown(); super.onDestroy();
    }
}
