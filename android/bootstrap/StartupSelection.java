package org.tqmods;

import android.util.AtomicFile;
import org.json.JSONObject;
import java.io.*;

/** Copies a manager selection for one startup; does not activate native routing. */
public final class StartupSelection {
    private StartupSelection() {}
    /** The library ID chosen in the manager, or null for the original game. */
    public static String selectedId(File files) throws Exception {
        try {
            byte[] bytes = new AtomicFile(new File(files, "tqmods/request.json")).readFully();
            if (bytes.length > 1024 * 1024) throw new IOException("Selection exceeds limit");
            JSONObject request = new JSONObject(new String(bytes, "UTF-8"));
            if (request.isNull("id")) return null;
            String id = request.getString("id");
            if (!id.matches("[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}")) throw new IOException("Invalid selection ID");
            return id;
        } catch (FileNotFoundException absent) { return null; }
    }
    public static void prepare(File files, File liveSaves, int pid) throws Exception {
        // Context.getFilesDir may use Android's /data/data alias. Resolve only
        // that trusted base; reject redirected children inside app storage.
        File directory = new File(files.getCanonicalFile(), "tqmods");
        if (!directory.equals(directory.getCanonicalFile())) throw new IOException("Mod storage is aliased");
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
        request.put("perfEnabled", RuntimeFeatures.perf(files));
        AtomicFile target = new AtomicFile(new File(directory, "startup-request.json"));
        FileOutputStream out = null;
        try {
            out = target.startWrite(); out.write(request.toString().getBytes("UTF-8"));
            target.finishWrite(out);
        } catch (Exception error) { if (out != null) target.failWrite(out); throw error; }
    }
}
