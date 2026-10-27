package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.widget.TextView;

/** Experimental in-process startup probe. Does not modify entitlement checks. */
public final class GameBootstrapActivity extends Activity {
    public void onCreate(Bundle state) {
        super.onCreate(state);
        try {
            if (ModManagerActivity.isBusy()) throw new IllegalStateException("Wait for the manager operation to finish");
            java.io.File external = getExternalFilesDir(null);
            if (external == null) throw new java.io.IOException("Game storage unavailable");
            SaveRestore.recover(new java.io.File(external, "Preferences/SaveData"));
            System.loadLibrary("tqmods");
            Intent game = new Intent();
            game.setClassName(getPackageName(), "com.hg.titanquest.MainActivity");
            game.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(game);
            finish();
        } catch (Throwable error) {
            TextView text = new TextView(this);
            text.setPadding(32, 64, 32, 32);
            text.setText("Game startup probe failed: " + error + "\nNo mod was activated.");
            setContentView(text);
        }
    }
}
