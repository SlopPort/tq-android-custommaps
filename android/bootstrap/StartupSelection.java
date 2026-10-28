package org.tqmods;

import android.util.AtomicFile;
import org.json.JSONObject;
import java.io.*;

/** Copies a manager selection for one startup; does not activate native routing. */
public final class StartupSelection {
    private StartupSelection() {}
    public static void prepare(File files, File liveSaves, int pid) throws Exception {
        File directory = new File(files, "tqmods");
        if (!directory.isDirectory() && !directory.mkdirs()) throw new IOException("Cannot prepare startup selection");
        AtomicFile source = new AtomicFile(new File(directory, "request.json"));
        JSONObject request;
        try {
            byte[] bytes = source.readFully();
            if (bytes.length > 1024 * 1024) throw new IOException("Selection exceeds limit");
            request = new JSONObject(new String(bytes, "UTF-8"));
        } catch (FileNotFoundException absent) {
            request = new JSONObject(); request.put("schema", 1);
            request.put("id", JSONObject.NULL); request.put("database", JSONObject.NULL);
        }
        if (request.getInt("schema") != 1) throw new IOException("Unsupported selection schema");
        if (!request.has("id") || !request.has("database") || request.isNull("id") != request.isNull("database"))
            throw new IOException("Incomplete selection");
        request.remove("preparedProfile");
        if (!request.isNull("id")) {
            String id = request.getString("id");
            if (!id.matches("[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}")) throw new IOException("Invalid selection ID");
            File profiles = new File(directory, "save-profiles");
            if (java.nio.file.Files.exists(new File(profiles, id).toPath(), java.nio.file.LinkOption.NOFOLLOW_LINKS)) {
                File saves = SaveProfileStore.resolvePrepared(liveSaves, profiles, id, false);
                JSONObject profile = new JSONObject(); profile.put("root", saves.getPath());
                profile.put("runtimeBound", false); // Validation does not activate native routing.
                request.put("preparedProfile", profile);
            }
        }
        request.put("startupPid", pid);
        AtomicFile target = new AtomicFile(new File(directory, "startup-request.json"));
        FileOutputStream out = null;
        try {
            out = target.startWrite(); out.write(request.toString().getBytes("UTF-8"));
            target.finishWrite(out);
        } catch (Exception error) { if (out != null) target.failWrite(out); throw error; }
    }
}
