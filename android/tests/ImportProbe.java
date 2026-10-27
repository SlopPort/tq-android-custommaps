import org.tqmods.ModStore;
import java.io.*;
import java.nio.file.*;
/** Runs the same importer as the Android activity, without Android UI or engine activation. */
public final class ImportProbe {
    public static void main(String[] args) throws Exception {
        File source = new File(args[0]);
        File root = Files.createTempDirectory("tqmods-probe-").toFile();
        try (InputStream input = new FileInputStream(source)) {
            File result = new ModStore(root).importFile(input, source.getName());
            System.out.println("IMPORTED: " + ModStore.title(result));
        } catch (IOException e) {
            System.out.println("REJECTED: " + e.getMessage());
            System.exit(2);
        }
    }
}
