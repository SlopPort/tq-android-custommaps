package org.tqmods;

import java.io.*;

/** What the loader can do with an imported mod, cached next to it. */
final class ModKind {
    private ModKind() {}
    static final String CONTENT = "content", TESTED = "tested", MAP = "map", MAP_SUPPORTED = "map-supported";
    // Specimens with device evidence; the runtime checks the same size and FNV-1a.
    private static final long[][] TESTED_DATABASES = {{6075026L, 0xb6427708L}};
    private static final long[][] SUPPORTED_MAPS = {{274580L, 0x084f8518L}};

    static String of(ModStore store, File dir) {
        File cache = new File(dir, ".kind");
        try (BufferedReader in = new BufferedReader(new InputStreamReader(new FileInputStream(cache), "UTF-8"))) {
            String value = in.readLine();
            if (value != null && value.matches("[a-z-]+")) return value;
        } catch (IOException absent) { /* Compute below. */ }
        String kind;
        try {
            File database = store.database(dir);
            boolean world = store.customWorld(dir);
            long[][] known = world ? SUPPORTED_MAPS : TESTED_DATABASES;
            boolean match = false;
            for (long[] k : known) if (database.length() == k[0] && fnv1a(database) == k[1]) match = true;
            kind = world ? (match ? MAP_SUPPORTED : MAP) : (match ? TESTED : CONTENT);
        } catch (IOException error) { return CONTENT; }
        try (Writer out = new OutputStreamWriter(new FileOutputStream(cache), "UTF-8")) { out.write(kind); }
        catch (IOException ignored) { /* Recomputed next time. */ }
        return kind;
    }
    static boolean playable(String kind) { return !MAP.equals(kind); }
    static long fnv1a(File file) throws IOException {
        long hash = 2166136261L;
        try (InputStream in = new BufferedInputStream(new FileInputStream(file), 1 << 16)) {
            int b;
            while ((b = in.read()) != -1) hash = ((hash ^ b) * 16777619L) & 0xffffffffL;
        }
        return hash;
    }
}
