package org.tqmods;

import java.io.*;
import java.nio.file.*;
import java.util.UUID;

/** Creates separate save copies. Does not redirect the game or swap live saves. */
public final class SaveProfileStore {
    private SaveProfileStore() {}
    public static synchronized File create(File liveSaves, File profiles, String id,
                                            boolean engineLoaded) throws IOException {
        if (engineLoaded) throw new IOException("Close the game before creating a save profile");
        if (id == null || !id.matches("[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}"))
            throw new IOException("Invalid save profile ID");
        File source = liveSaves.getAbsoluteFile();
        if (!source.getName().equals("SaveData") || !source.equals(source.getCanonicalFile())
                || !source.isDirectory()) throw new IOException("Expected canonical SaveData directory");
        File root = profiles.getCanonicalFile();
        if (root.toPath().startsWith(source.toPath()) || source.toPath().startsWith(root.toPath()))
            throw new IOException("Profiles must be outside live saves");
        if (!root.isDirectory() && !root.mkdirs()) throw new IOException("Cannot create profile storage");
        File target = new File(root, id);
        if (Files.exists(target.toPath(), LinkOption.NOFOLLOW_LINKS)) throw new IOException("Profile already exists");
        File stage = new File(root, ".creating-" + id + "-" + UUID.randomUUID());
        if (!stage.mkdir()) throw new IOException("Cannot stage save profile");
        // Retain failed staging for diagnosis; never delete a previous profile or source save.
        File snapshot = new File(stage, "snapshot.zip");
        int files;
        try (FileOutputStream out = new FileOutputStream(snapshot)) {
            files = SaveBackup.write(source, out);
        }
        File isolated = new File(stage, "SaveData");
        if (!isolated.mkdir()) throw new IOException("Cannot create isolated save directory");
        SaveRestore.restore(snapshot, isolated); // Check every restored file against SHA-256.
        try (FileOutputStream out = new FileOutputStream(new File(stage, "profile.properties"))) {
            java.util.Properties metadata = new java.util.Properties();
            metadata.setProperty("schema", "1"); metadata.setProperty("id", id);
            metadata.setProperty("files", Integer.toString(files));
            metadata.setProperty("runtimeBound", "false");
            metadata.store(out, "Independent copy; game redirection is not implemented");
            out.getFD().sync();
        }
        if (target.exists() || !stage.renameTo(target)) throw new IOException("Cannot commit save profile");
        return new File(target, "SaveData");
    }
}
