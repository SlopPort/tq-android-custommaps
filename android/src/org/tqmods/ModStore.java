package org.tqmods;

import java.io.*;
import java.util.*;
import java.util.zip.*;

/** App-private import storage. Import success does not imply engine compatibility. */
public final class ModStore {
    private static final long MAX_BYTES = 512L * 1024 * 1024;
    private static final int MAX_ENTRIES = 4096;
    private final File root;
    public ModStore(File root) throws IOException {
        this.root = root.getCanonicalFile();
        if (!this.root.isDirectory() && !this.root.mkdirs()) throw new IOException("Cannot create mod storage");
    }
    public synchronized File importFile(InputStream source, String displayName) throws IOException {
        String name = displayName == null ? "" : displayName.toLowerCase(Locale.ROOT);
        if (!name.endsWith(".zip") && !name.endsWith(".arz")) throw new IOException("Choose a ZIP or ARZ file");
        String id = UUID.randomUUID().toString();
        File stage = new File(root, ".import-" + id);
        if (!stage.mkdir()) throw new IOException("Cannot stage import");
        boolean committed = false;
        try {
            long[] budget = {0};
            if (name.endsWith(".arz")) {
                copy(source, new File(stage, "database/mod.arz"), budget);
            } else {
                Set<String> seen = new HashSet<>();
                int count = 0;
                try (ZipInputStream zip = new ZipInputStream(source)) {
                    ZipEntry entry;
                    while ((entry = zip.getNextEntry()) != null) {
                        if (++count > MAX_ENTRIES) throw new IOException("Too many archive entries");
                        String path = entry.getName().replace('\\', '/');
                        if (path.length() > 1024 || path.split("/", -1).length > 32)
                            throw new IOException("Archive path is too deep or long");
                        if (path.startsWith("/") || path.indexOf(':') >= 0 || path.indexOf('\0') >= 0)
                            throw new IOException("Unsafe archive path");
                        for (String part : path.split("/", -1)) {
                            if (part.equals("..") || part.equals(".")) throw new IOException("Unsafe archive path");
                        }
                        File dest = new File(stage, path).getCanonicalFile();
                        if (!dest.getPath().startsWith(stage.getCanonicalPath() + File.separator))
                            throw new IOException("Archive path escapes import directory");
                        if (!seen.add(dest.getPath().toLowerCase(Locale.ROOT))) throw new IOException("Duplicate archive path");
                        if (entry.isDirectory()) continue;
                        String lower = path.toLowerCase(Locale.ROOT);
                        if (!(lower.endsWith(".arz") || lower.endsWith(".arc") || lower.endsWith(".map") || lower.endsWith(".txt") || lower.endsWith(".md")))
                            throw new IOException("Unsupported file in archive: " + path);
                        copy(zip, dest, budget);
                        zip.closeEntry();
                    }
                }
            }
            List<File> databases = new ArrayList<>();
            collect(stage, databases);
            if (databases.size() != 1) throw new IOException("This prototype requires exactly one ARZ database");
            // Preliminary format check only; the engine must validate records separately.
            try (InputStream in = new FileInputStream(databases.get(0))) {
                if (databases.get(0).length() < 24 || in.read() != 4 || in.read() != 0 || in.read() != 3 || in.read() != 0)
                    throw new IOException("Unsupported ARZ header");
            }
            try (Writer title = new OutputStreamWriter(new FileOutputStream(new File(stage, ".title")), "UTF-8")) {
                title.write(displayName == null ? "Imported mod" : displayName.replaceAll("[\\p{Cntrl}]", " "));
            }
            File dest = new File(root, id);
            if (!stage.renameTo(dest)) throw new IOException("Cannot commit import");
            committed = true;
            return dest;
        } finally {
            if (!committed) removeStage(stage);
        }
    }
    private static void copy(InputStream in, File dest, long[] budget) throws IOException {
        File parent = dest.getParentFile();
        if (!parent.isDirectory() && !parent.mkdirs()) throw new IOException("Cannot create import directory");
        try (OutputStream out = new FileOutputStream(dest)) {
            byte[] buffer = new byte[65536]; int n;
            while ((n = in.read(buffer)) != -1) {
                budget[0] += n;
                if (budget[0] > MAX_BYTES) throw new IOException("Mod exceeds 512 MiB import limit");
                out.write(buffer, 0, n);
            }
        }
    }
    private static void collect(File dir, List<File> found) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) throw new IOException("Cannot inspect import");
        for (File f : files) {
            if (f.isDirectory()) collect(f, found);
            else if (f.getName().toLowerCase(Locale.ROOT).endsWith(".arz")) found.add(f);
        }
    }
    private static void removeStage(File file) throws IOException {
        File[] children = file.listFiles();
        if (children != null) for (File child : children) removeStage(child);
        if (file.exists() && !file.delete()) throw new IOException("Cannot clean failed import");
    }
    public File[] installed() {
        File[] files = root.listFiles(f -> f.isDirectory() && !f.getName().startsWith("."));
        return files == null ? new File[0] : files;
    }
    public static String title(File dir) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(new File(dir, ".title")), "UTF-8"))) {
            String text = reader.readLine();
            return text == null ? dir.getName() : text;
        } catch (IOException e) { return dir.getName(); }
    }
}
