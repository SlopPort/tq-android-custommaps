package org.tqmods;

import java.io.*;
import java.util.*;

/** Talks to the tq_mods Magisk module through one long-lived su shell (one root prompt per app start). */
final class RootLink {
    static final String GAME = "com.hg.titanquestultimate";
    static final String GAME_FILES = "/data/user/0/" + GAME + "/files";
    static final String HELPER = "/data/adb/modules/tq_mods/tqmods.sh";
    private static Process shell;
    private static BufferedWriter in;
    private static BufferedReader out;
    private RootLink() {}

    /** Thrown when root is missing or refused; the app explains how to fix it. */
    static final class NoRoot extends IOException { NoRoot(String m) { super(m); } }
    /** The helper ran and reported a problem; the shell stays usable. */
    static final class Failed extends IOException { Failed(String m) { super(m); } }

    /** Runs one helper command; returns its key=value lines. Throws with the helper's error text. */
    static synchronized Map<String, String> run(String... args) throws IOException {
        StringBuilder command = new StringBuilder("if [ -f " + HELPER + " ]; then sh " + HELPER);
        for (String a : args) command.append(' ').append(quote(a));
        command.append(" 2>&1; else echo missing=module; fi; echo \"__tqmods_end $?\"\n");
        for (int attempt = 0; ; attempt++) {
            try {
                open();
                in.write(command.toString()); in.flush();
                Map<String, String> result = new LinkedHashMap<>();
                StringBuilder other = new StringBuilder();
                String line;
                while ((line = out.readLine()) != null) {
                    if (line.startsWith("__tqmods_end ")) {
                        if (result.containsKey("error")) throw new Failed(result.get("error"));
                        if (!line.equals("__tqmods_end 0")) throw new Failed(other.toString().trim());
                        return result;
                    }
                    int eq = line.indexOf('=');
                    if (eq > 0 && line.substring(0, eq).matches("[A-Za-z]+")) result.put(line.substring(0, eq), line.substring(eq + 1));
                    else if (other.length() < 2000) other.append(line).append('\n');
                }
                throw new EOFException("root shell closed");
            } catch (NoRoot | Failed expected) {
                throw expected;
            } catch (IOException broken) {
                close();
                if (attempt > 0 || !(broken instanceof EOFException)) throw broken;
            }
        }
    }

    private static void open() throws IOException {
        if (shell != null) return;
        try { shell = new ProcessBuilder("su").redirectErrorStream(true).start(); }
        catch (IOException none) { throw new NoRoot("su not found"); }
        in = new BufferedWriter(new OutputStreamWriter(shell.getOutputStream(), "UTF-8"));
        out = new BufferedReader(new InputStreamReader(shell.getInputStream(), "UTF-8"));
        // A refused grant ends the shell; "id -u" proves we are root.
        in.write("id -u; echo __tqmods_ready\n"); in.flush();
        String line, uid = null;
        while ((line = out.readLine()) != null && !line.equals("__tqmods_ready")) uid = line.trim();
        if (line == null || !"0".equals(uid)) { close(); throw new NoRoot("root access refused"); }
    }

    static synchronized void close() {
        if (shell != null) shell.destroy();
        shell = null; in = null; out = null;
    }

    private static String quote(String s) { return "'" + s.replace("'", "'\''") + "'"; }
}
