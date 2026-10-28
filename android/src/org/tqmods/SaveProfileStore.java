package org.tqmods;

import java.io.*;
import java.nio.file.*;
import java.util.UUID;

/** Creates separate save copies. Does not redirect the game or swap live saves. */
public final class SaveProfileStore {
    private SaveProfileStore() {}
    /** Pre-start validation only. Caller must exclude writers until engine startup.
     * Gameplay changes are allowed; the original snapshot is not a live checksum.
     */
    public static synchronized File resolvePrepared(File liveSaves, File profiles, String id,
                                                    boolean engineLoaded) throws IOException {
        if (engineLoaded) throw new IOException("Close the game before opening a save profile");
        if (id == null || !id.matches("[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}"))
            throw new IOException("Invalid save profile ID");
        File live = liveSaves.getCanonicalFile();
        File root = profiles.getAbsoluteFile();
        if (!root.equals(root.getCanonicalFile()) || !root.isDirectory())
            throw new IOException("Profile storage unavailable or aliased");
        File directory = new File(root, id);
        File saves = new File(directory, "SaveData");
        if (!directory.equals(directory.getCanonicalFile()) || !directory.isDirectory()
                || !saves.equals(saves.getCanonicalFile()) || !saves.isDirectory())
            throw new IOException("Separate save profile unavailable or aliased");
        if (saves.toPath().startsWith(live.toPath()) || live.toPath().startsWith(saves.toPath()))
            throw new IOException("Profile overlaps live saves");
        Path marker = new File(directory, "profile.properties").toPath();
        if (!Files.isRegularFile(marker, LinkOption.NOFOLLOW_LINKS) || Files.size(marker) > 4096)
            throw new IOException("Profile preparation record missing or invalid");
        java.util.Properties metadata = new java.util.Properties();
        try (InputStream in = Files.newInputStream(marker, LinkOption.NOFOLLOW_LINKS)) { metadata.load(in); }
        if (!"1".equals(metadata.getProperty("schema")) || !id.equals(metadata.getProperty("id")))
            throw new IOException("Profile preparation record does not match selection");
        // Do not compare the original file count: saving and visiting new maps adds files.
        int[] entries = {0, 0};
        validateTree(saves.toPath(), 0, entries);
        if (entries[1] == 0) throw new IOException("Separate save profile has no files");
        return saves;
    }

    private static void validateTree(Path directory, int depth, int[] entries) throws IOException {
        if (depth > 32) throw new IOException("Save profile directory nesting exceeds limit");
        try (DirectoryStream<Path> children = Files.newDirectoryStream(directory)) {
            for (Path child : children) {
                if (++entries[0] > 40000) throw new IOException("Save profile has too many entries");
                if (Files.isSymbolicLink(child)) throw new IOException("Save profile contains a symbolic link");
                if (Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS)) validateTree(child, depth + 1, entries);
                else if (!Files.isRegularFile(child, LinkOption.NOFOLLOW_LINKS))
                    throw new IOException("Save profile contains an unsupported entry");
                else entries[1]++;
            }
        }
    }
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
