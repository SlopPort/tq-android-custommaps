package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.widget.TextView;
import java.io.*;
import org.json.JSONObject;

/** Diagnostic activity only; not a game launcher. */
public final class BootstrapProbeActivity extends Activity {
    private final Handler handler = new Handler();
    private TextView text;
    private int attempts;
    public void onCreate(Bundle state) {
        super.onCreate(state);
        text = new TextView(this); text.setPadding(32, 64, 32, 32);
        setContentView(text);
        try {
            System.loadLibrary("tqmods");
            text.setText("Bootstrap loaded; waiting for script report.");
            handler.postDelayed(new Runnable() {
                public void run() {
                    if (isDestroyed()) return;
                    try (BufferedReader reader = new BufferedReader(new FileReader(new File(getFilesDir(), "bootstrap-status.json")))) {
                        String raw = reader.readLine();
                        JSONObject report = new JSONObject(raw);
                        if (report.getInt("pid") != android.os.Process.myPid())
                            throw new IOException("Ignoring report from an earlier process");
                        text.setText(raw);
                    } catch (Exception e) { text.setText("Waiting: " + e.getMessage()); }
                    if (++attempts < 35) handler.postDelayed(this, 1000);
                }
            }, 1200);
        } catch (Throwable error) { text.setText("Bootstrap failed: " + error); }
    }
    protected void onDestroy() { handler.removeCallbacksAndMessages(null); super.onDestroy(); }
}
