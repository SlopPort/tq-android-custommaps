import org.tqmods.SaveBackup;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;

public class SaveBackupTest {
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("save-backup-test");
        Path hero = Files.createDirectories(root.resolve("Main/Hero"));
        byte[] data = {1, 2, 3, 4};
        Files.write(hero.resolve("Player.chr"), data);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        if (SaveBackup.write(root.toFile(), bytes) != 1) throw new AssertionError("Count");
        Map<String, byte[]> entries = new HashMap<>();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buffer = new byte[256]; int count;
                while ((count = zip.read(buffer)) != -1) output.write(buffer, 0, count);
                entries.put(entry.getName(), output.toByteArray());
            }
        }
        if (!Arrays.equals(data, entries.get("SaveData/Main/Hero/Player.chr"))) throw new AssertionError("Content");
        if (!new String(entries.get("SHA256SUMS.txt"), "UTF-8").startsWith(
            "9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a")) throw new AssertionError("Hash");
        try { SaveBackup.write(root.resolve("missing").toFile(), new ByteArrayOutputStream()); throw new AssertionError("Missing accepted"); }
        catch (IOException expected) {}
        try { SaveBackup.write(root.toFile(), new OutputStream() { public void write(int b) throws IOException { throw new IOException("Provider failure"); }}); throw new AssertionError("Failure ignored"); }
        catch (IOException expected) {}
        if (!Arrays.equals(data, Files.readAllBytes(hero.resolve("Player.chr")))) throw new AssertionError("Source changed");
        System.out.println("PASS: backup bytes, SHA-256 manifest, missing directory, provider failure, source unchanged");
    }
}
