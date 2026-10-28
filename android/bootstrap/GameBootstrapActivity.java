package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.widget.TextView;
import java.io.*;

/** Experimental in-process startup probe. Does not modify entitlement checks. */
public final class GameBootstrapActivity extends Activity {
    private static boolean launchClaimed;
    public void onCreate(Bundle state) {
        super.onCreate(state);
        try {
            if (ModManagerActivity.isBusy()) throw new IllegalStateException("Wait for the manager operation to finish");
            if (launchClaimed) throw new IllegalStateException("Close the app before starting another game session");
            try (BufferedReader maps = new BufferedReader(new FileReader("/proc/self/maps"))) {
                String line;
                while ((line = maps.readLine()) != null) if (line.contains("libtq.so"))
                    throw new IllegalStateException("Save and close the app before starting another game session");
            }
            java.io.File external = getExternalFilesDir(null);
            if (external == null) throw new java.io.IOException("Game storage unavailable");
            SaveRestore.recover(new java.io.File(external, "Preferences/SaveData"));
            StartupSelection.prepare(getFilesDir(), new File(external, "Preferences/SaveData"), android.os.Process.myPid());
            // Gadget initialization is process-scoped. A failed launch after this point
            // must not reuse an already initialized loader with a different selection.
            launchClaimed = true;
            System.loadLibrary("tqmods");
            Intent game = new Intent();
            game.setClassName(getPackageName(), "com.hg.titanquest.MainActivity");
            game.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(game);
            finish();
        } catch (Throwable error) {
            TextView text = new TextView(this);
            text.setPadding(32, 64, 32, 32);
            text.setText("Game startup stopped: " + error + "\nClose the app before retrying. This message does not confirm the state of an earlier game session.");
            setContentView(text);
        }
    }

}
