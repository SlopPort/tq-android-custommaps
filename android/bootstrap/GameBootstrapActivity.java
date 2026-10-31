package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.view.Gravity;
import android.widget.*;
import java.io.*;

/** Starts the game with the chosen mod. Does not modify entitlement checks. */
public final class GameBootstrapActivity extends Activity {
    private static boolean launchClaimed;
    private TextView text;
    public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER); box.setBackgroundColor(ModManagerActivity.BG); box.setPadding(48, 48, 48, 48);
        box.addView(new ProgressBar(this));
        text = new TextView(this); text.setTextColor(ModManagerActivity.TEXT); text.setTextSize(18);
        text.setGravity(Gravity.CENTER); text.setPadding(0, 32, 0, 0); text.setText(Texts.starting());
        box.addView(text); setContentView(box);
        try {
            if (engineLoaded()) {
                // A restart request reached the old process before it ended: end it now and
                // let Android deliver this launch to a fresh process.
                if (getIntent().getBooleanExtra("restart", false)) { Runtime.getRuntime().exit(0); return; }
                throw new IllegalStateException(Texts.t("The game is already running", "Gra już działa"));
            }
            if (ModManagerActivity.isBusy()) throw new IllegalStateException("Wait for the manager operation to finish");
            if (launchClaimed) throw new IllegalStateException("Close the app before starting another game session");
            launchClaimed = true;
        } catch (Throwable error) { fail(error); return; }
        new Thread(this::prepare, "tqmods-start").start();
    }
    private static boolean engineLoaded() throws IOException {
        try (BufferedReader maps = new BufferedReader(new FileReader("/proc/self/maps"))) {
            String line;
            while ((line = maps.readLine()) != null) if (line.contains("libtq.so")) return true;
        }
        return false;
    }
    private void prepare() {
        try {
            File external = getExternalFilesDir(null);
            if (external == null) throw new IOException("Game storage unavailable");
            File saves = new File(external, "Preferences/SaveData");
            SaveRestore.recover(saves);
            String id = StartupSelection.selectedId(getFilesDir());
            File profiles = new File(getFilesDir(), "tqmods/save-profiles");
            if (id != null && !new File(profiles, id).exists()) {
                runOnUiThread(() -> text.setText(Texts.preparingSaves()));
                // The engine is not loaded in this process, so nothing writes the saves now.
                if (saves.isDirectory()) SaveProfileStore.create(saves, profiles, id, false);
                else SaveProfileStore.createEmpty(profiles, id);
            }
            StartupSelection.prepare(getFilesDir(), saves, android.os.Process.myPid());
            runOnUiThread(this::launch);
        } catch (Throwable error) { runOnUiThread(() -> fail(error)); }
    }
    private void launch() {
        try {
            // Gadget initialization is process-scoped. A failed launch after this point
            // must not reuse an already initialized loader with a different selection.
            System.loadLibrary("tqmods");
            Intent game = new Intent();
            game.setClassName(getPackageName(), "com.hg.titanquest.MainActivity");
            game.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(game);
            finish();
        } catch (Throwable error) { fail(error); }
    }
    private void fail(Throwable error) {
        text.setText(Texts.startFailed(error.getMessage() == null ? error.toString() : error.getMessage())
            + "\n\n" + Texts.t("Close the app and try again.", "Zamknij aplikację i spróbuj ponownie."));
    }
}
