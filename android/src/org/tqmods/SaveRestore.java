package org.tqmods;

import java.io.*;
import java.nio.file.*;
import java.security.*;
import java.util.*;
import java.util.zip.*;

/** Restores only the project's checksummed backup format. Keep the engine stopped. */
public final class SaveRestore {
    private SaveRestore() {}
    public static void recover(File destination) throws IOException {
        File target = destination.getAbsoluteFile();
        File journal = new File(target.getParentFile(), ".tqmods-restore-journal");
        if (!journal.exists()) return;
        if (!target.getName().equals("SaveData") || !target.getCanonicalFile().equals(target))
            throw new IOException("Unexpected recovery target");
        Properties state = new Properties();
        try (InputStream input = new FileInputStream(journal)) { state.load(input); }
        String name = state.getProperty("previous", "");
        if (!name.matches("\\.SaveData-before-restore-[0-9a-f-]{36}")) throw new IOException("Invalid recovery journal");
        File previous = new File(target.getParentFile(), name);
        if (!previous.getCanonicalFile().equals(previous)) throw new IOException("Recovery symlink refused");
        if (!target.exists()) {
            if (!previous.isDirectory() || !previous.renameTo(target)) throw new IOException("Cannot recover previous saves; do not start game");
        } else if (!target.isDirectory()) throw new IOException("Recovery target is not a directory");
        if (!journal.delete()) throw new IOException("Cannot clear recovery journal");
    }
    public static File restore(File archive, File destination) throws IOException {
        File target = destination.getAbsoluteFile();
        recover(target);
        if (!target.getName().equals("SaveData") || !target.getCanonicalFile().equals(target)
                || !target.isDirectory()) throw new IOException("Existing SaveData directory required");
        File stage = new File(target.getParentFile(), ".restore-" + UUID.randomUUID());
        File previous = new File(target.getParentFile(), ".SaveData-before-restore-" + UUID.randomUUID());
        if (!stage.mkdir()) throw new IOException("Cannot stage restored saves");
        boolean moved = false;
        try {
            Map<String,String> expected = new HashMap<>();
            Set<String> seen = new HashSet<>();
            long total = 0;
            try (ZipFile zip = new ZipFile(archive)) {
                ZipEntry manifest = zip.getEntry("SHA256SUMS.txt");
                if (manifest == null || manifest.getSize() < 1 || manifest.getSize() > 8 * 1024 * 1024)
                    throw new IOException("Backup checksum manifest missing or too large");
                ByteArrayOutputStream manifestBytes = new ByteArrayOutputStream();
                try (InputStream input = zip.getInputStream(manifest)) {
                    byte[] buffer = new byte[8192]; int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (manifestBytes.size() + count > 8 * 1024 * 1024) throw new IOException("Checksum manifest too large");
                        manifestBytes.write(buffer,0,count);
                    }
                }
                try (BufferedReader reader = new BufferedReader(new StringReader(manifestBytes.toString("UTF-8")))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.length() > 1200 || !line.matches("[0-9a-f]{64}  SaveData/.+")) throw new IOException("Invalid checksum line");
                        if (expected.put(line.substring(66), line.substring(0,64)) != null || expected.size() > 20000)
                            throw new IOException("Duplicate or excessive checksum entries");
                    }
                }
                Enumeration<? extends ZipEntry> entries = zip.entries();
                int count = 0;
                while (entries.hasMoreElements()) {
                    ZipEntry entry = entries.nextElement(); String name = entry.getName();
                    if (++count > 20001 || !seen.add(name.toLowerCase(Locale.ROOT))) throw new IOException("Duplicate or excessive archive entries");
                    if (name.equals("SHA256SUMS.txt")) continue;
                    if (!expected.containsKey(name) || entry.isDirectory() || name.indexOf('\\') >= 0
                            || name.indexOf(':') >= 0 || name.indexOf('\0') >= 0) throw new IOException("Unexpected backup entry");
                    String relative = name.substring("SaveData/".length());
                    String[] parts = relative.split("/", -1);
                    if (parts.length > 32) throw new IOException("Backup path too deep");
                    for (String part : parts) if (part.isEmpty() || part.equals(".") || part.equals("..")) throw new IOException("Unsafe backup path");
                    File file = new File(stage, relative).getCanonicalFile();
                    if (!file.getPath().startsWith(stage.getCanonicalPath() + File.separator)) throw new IOException("Backup path escapes staging");
                    if (!file.getParentFile().isDirectory() && !file.getParentFile().mkdirs()) throw new IOException("Cannot create restored folder");
                    MessageDigest digest;
                    try { digest = MessageDigest.getInstance("SHA-256"); } catch (NoSuchAlgorithmException e) { throw new IOException(e); }
                    try (InputStream input = zip.getInputStream(entry); OutputStream output = new FileOutputStream(file)) {
                        byte[] buffer = new byte[65536]; int read;
                        while ((read = input.read(buffer)) != -1) {
                            total += read;
                            if (total > 512L * 1024 * 1024) throw new IOException("Backup too large");
                            digest.update(buffer,0,read); output.write(buffer,0,read);
                        }
                    }
                    StringBuilder hash = new StringBuilder();
                    for (byte value : digest.digest()) hash.append(String.format(Locale.ROOT,"%02x",value & 255));
                    if (!hash.toString().equals(expected.remove(name))) throw new IOException("Backup checksum mismatch");
                }
                if (!expected.isEmpty() || count < 2) throw new IOException("Backup incomplete");
            }
            File journal = new File(target.getParentFile(), ".tqmods-restore-journal");
            Properties state = new Properties(); state.setProperty("previous", previous.getName());
            try (FileOutputStream output = new FileOutputStream(journal)) {
                state.store(output, "Restore recovery; previous saves must be retained"); output.getFD().sync();
            }
            if (!target.renameTo(previous)) throw new IOException("Cannot preserve current saves");
            if (!stage.renameTo(target)) {
                if (!previous.renameTo(target)) throw new IOException("Restore interrupted: original saves retained at " + previous.getName());
                throw new IOException("Restore failed; original saves reinstated");
            }
            moved = true;
            if (!journal.delete()) throw new IOException("Saves restored, but recovery journal remains; reopen manager before playing");
            return previous;
        } finally { if (!moved) removeStage(stage); }
    }
    private static void removeStage(File file) throws IOException {
        if (Files.isSymbolicLink(file.toPath())) throw new IOException("Unexpected staging symlink");
        File[] children = file.listFiles();
        if (children != null) for (File child : children) removeStage(child);
        if (file.exists() && !file.delete()) throw new IOException("Cannot clean restore staging");
    }
}
