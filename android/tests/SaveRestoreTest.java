import org.tqmods.*;
import java.io.*;
import java.nio.file.*;
import java.util.zip.*;

public class SaveRestoreTest {
    public static void main(String[] args) throws Exception {
        Path workspace = Files.createTempDirectory("restore-test");
        Path target = Files.createDirectory(workspace.resolve("SaveData"));
        Files.write(target.resolve("Player.chr"), new byte[]{1,2,3,4});
        File zip = workspace.resolve("backup.zip").toFile();
        SaveBackup.write(target.toFile(), new FileOutputStream(zip));
        Files.write(target.resolve("Player.chr"), new byte[]{9});
        File previous = SaveRestore.restore(zip, target.toFile());
        if (Files.readAllBytes(target.resolve("Player.chr"))[0] != 1
                || Files.readAllBytes(previous.toPath().resolve("Player.chr"))[0] != 9)
            throw new AssertionError("Restore or original retention failed");
        for (String name : new String[]{"SaveData/../escaped", "SaveData/Player.chr"}) {
            File bad = workspace.resolve("bad.zip").toFile();
            try (ZipOutputStream out = new ZipOutputStream(new FileOutputStream(bad))) {
                out.putNextEntry(new ZipEntry("SHA256SUMS.txt"));
                out.write(("0000000000000000000000000000000000000000000000000000000000000000  " + name + "\n").getBytes("UTF-8")); out.closeEntry();
                out.putNextEntry(new ZipEntry(name)); out.write(99); out.closeEntry();
            }
            try { SaveRestore.restore(bad, target.toFile()); throw new AssertionError("Unsafe backup accepted"); }
            catch (IOException expected) {}
            if (Files.readAllBytes(target.resolve("Player.chr"))[0] != 1) throw new AssertionError("Rejected restore changed saves");
        }
        if (Files.exists(workspace.resolve("escaped"))) throw new AssertionError("Path escape");
        String interrupted = ".SaveData-before-restore-" + java.util.UUID.randomUUID();
        Files.move(target, workspace.resolve(interrupted));
        java.util.Properties state = new java.util.Properties(); state.setProperty("previous", interrupted);
        try (OutputStream output = Files.newOutputStream(workspace.resolve(".tqmods-restore-journal"))) { state.store(output, "simulated interruption"); }
        SaveRestore.recover(target.toFile());
        if (Files.readAllBytes(target.resolve("Player.chr"))[0] != 1 || Files.exists(workspace.resolve(".tqmods-restore-journal")))
            throw new AssertionError("Interrupted restore recovery");
        System.out.println("PASS: restore, original retention, checksum/path rejection, interrupted-rename recovery");
    }
}
