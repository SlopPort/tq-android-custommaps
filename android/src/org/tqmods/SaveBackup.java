package org.tqmods;

import java.io.*;
import java.nio.file.*;
import java.security.*;
import java.util.*;
import java.util.zip.*;

/** Export only. Caller must ensure the game cannot write saves during capture. */
public final class SaveBackup {
    private static final long MAX_BYTES = 512L * 1024 * 1024;
    private static final int MAX_FILES = 20000;
    private SaveBackup() {}
    public static int write(File source, OutputStream destination) throws IOException {
        Path root = source.toPath().toAbsolutePath().normalize();
        if (!Files.isDirectory(root, LinkOption.NOFOLLOW_LINKS) || Files.isSymbolicLink(root))
            throw new IOException("Save directory unavailable");
        List<Path> files = new ArrayList<>();
        collect(root, files, 0);
        if (files.isEmpty()) throw new IOException("No save files found");
        Collections.sort(files);
        long total = 0;
        StringBuilder hashes = new StringBuilder();
        try (ZipOutputStream zip = new ZipOutputStream(destination)) {
            byte[] buffer = new byte[65536];
            for (Path file : files) {
                String relative = root.relativize(file).toString().replace(File.separatorChar, '/');
                if (relative.indexOf('\n') >= 0 || relative.indexOf('\r') >= 0 || relative.indexOf('\\') >= 0)
                    throw new IOException("Unsupported save filename");
                long size = Files.size(file);
                long modified = Files.getLastModifiedTime(file).toMillis();
                MessageDigest digest;
                try { digest = MessageDigest.getInstance("SHA-256"); }
                catch (NoSuchAlgorithmException impossible) { throw new IOException(impossible); }
                zip.putNextEntry(new ZipEntry("SaveData/" + relative));
                long copied = 0;
                try (InputStream input = Files.newInputStream(file, LinkOption.NOFOLLOW_LINKS)) {
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        copied += count; total += count;
                        if (total > MAX_BYTES) throw new IOException("Save backup exceeds 512 MiB");
                        digest.update(buffer, 0, count); zip.write(buffer, 0, count);
                    }
                }
                zip.closeEntry();
                if (copied != size || Files.size(file) != size || Files.getLastModifiedTime(file).toMillis() != modified)
                    throw new IOException("Save changed during backup; close the game and retry");
                for (byte value : digest.digest()) hashes.append(String.format(Locale.ROOT, "%02x", value & 255));
                hashes.append("  SaveData/").append(relative).append('\n');
            }
            zip.putNextEntry(new ZipEntry("SHA256SUMS.txt"));
            zip.write(hashes.toString().getBytes("UTF-8")); zip.closeEntry();
        }
        return files.size();
    }
    private static void collect(Path directory, List<Path> files, int depth) throws IOException {
        if (depth > 32) throw new IOException("Save directory too deep");
        try (DirectoryStream<Path> entries = Files.newDirectoryStream(directory)) {
            for (Path entry : entries) {
                if (Files.isSymbolicLink(entry)) throw new IOException("Save symlink refused");
                if (Files.isDirectory(entry, LinkOption.NOFOLLOW_LINKS)) collect(entry, files, depth + 1);
                else if (Files.isRegularFile(entry, LinkOption.NOFOLLOW_LINKS)) {
                    if (files.size() >= MAX_FILES) throw new IOException("Too many save files");
                    files.add(entry);
                } else throw new IOException("Unsupported save entry");
            }
        }
    }
}
