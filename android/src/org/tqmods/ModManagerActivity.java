package org.tqmods;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.database.Cursor;
import android.provider.OpenableColumns;
import android.widget.*;
import java.io.*;
import java.util.concurrent.*;

/** Embed in the game APK: this activity must share the game's app UID. */
public final class ModManagerActivity extends Activity {
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private TextView status;
    private LinearLayout list;
    private Button add;
    private ModStore store;
    public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this); layout.setOrientation(1); layout.setPadding(24,24,24,24);
        status = new TextView(this); status.setText("Mod library — import prototype. Engine activation is not connected yet.");
        add = new Button(this); add.setText("Add mod (ZIP / ARZ)");
        list = new LinearLayout(this); list.setOrientation(1);
        layout.addView(status); layout.addView(add); layout.addView(list);
        ScrollView scroll = new ScrollView(this); scroll.addView(layout); setContentView(scroll);
        try { store = new ModStore(new File(getFilesDir(), "tqmods/library")); refresh(); }
        catch (IOException e) { status.setText(e.getMessage()); add.setEnabled(false); }
        add.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("*/*");
            startActivityForResult(intent, 100);
        });
    }
    private void refresh() {
        list.removeAllViews();
        for (File dir : store.installed()) {
            TextView row = new TextView(this);
            row.setText(ModStore.title(dir) + "\nImported; compatibility not tested"); row.setPadding(0,16,0,16);
            list.addView(row);
        }
    }
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != 100 || result != RESULT_OK || data == null || data.getData() == null) return;
        final android.net.Uri uri = data.getData();
        add.setEnabled(false); status.setText("Importing…");
        io.execute(() -> {
            String message;
            try {
                String name = null;
                try (Cursor cursor = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
                    if (cursor != null && cursor.moveToFirst()) name = cursor.getString(0);
                }
                try (InputStream stream = getContentResolver().openInputStream(uri)) {
                    if (stream == null) throw new IOException("Cannot open selected file");
                    store.importFile(stream, name);
                }
                message = "Imported. Engine activation is not connected yet.";
            } catch (Exception e) { message = "Import failed: " + e.getMessage(); }
            final String text = message;
            runOnUiThread(() -> { if (!isDestroyed()) { status.setText(text); add.setEnabled(true); refresh(); } });
        });
    }
    protected void onDestroy() { io.shutdown(); super.onDestroy(); }
}
