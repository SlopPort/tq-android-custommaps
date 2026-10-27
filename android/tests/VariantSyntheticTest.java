import org.tqmods.ModStore;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/** Variant regressions without copyrighted mod fixtures. */
public final class VariantSyntheticTest {
    public static void main(String[] args) throws Exception {
        File root = Files.createTempDirectory("tqvariants-synthetic-").toFile();
        ModStore store = new ModStore(root);
        byte[] bundle = ModStoreTest.zip("bundle/x2/database/x2.arz", "bundle/x2/resources/Maps.arc",
            "bundle/x3/database/x3.arz", "bundle/x3/resources/Maps.arc");
        try {
            store.importFile(new ByteArrayInputStream(bundle), "bundle.zip");
            throw new AssertionError("Missing selection request");
        } catch (ModStore.VariantRequired e) {
            if (!Arrays.equals(e.variants, new String[]{"bundle/x2", "bundle/x3"}))
                throw new AssertionError("Unexpected choices");
        }
        if (root.list().length != 0) throw new AssertionError("Selection left partial files");
        File imported = store.importFile(new ByteArrayInputStream(bundle), "bundle.zip", "bundle/x3");
        if (!new File(imported, "bundle/x3/resources/Maps.arc").isFile()) throw new AssertionError("Lost resources");
        if (new File(imported, "bundle/x2").exists()) throw new AssertionError("Sibling imported");
        try {
            store.importFile(new ByteArrayInputStream(bundle), "bundle.zip", "missing");
            throw new AssertionError("Missing variant accepted");
        } catch (IOException expected) {}
        ModStoreTest.reject(store, ModStoreTest.zip("x/database/a.arz", "x/database/b.arz"), "ambiguous.zip");
        ModStoreTest.reject(store, ModStoreTest.zip("x/database/a.arz", "x/y/database/b.arz"), "nested.zip");
        try {
            store.importFile(new ByteArrayInputStream(ModStoreTest.zip("x/database/a.arz")), "changed.zip", "bundle/x3");
            throw new AssertionError("Changed archive accepted");
        } catch (IOException expected) {}
        for (File f : root.listFiles()) if (f.getName().startsWith(".")) throw new AssertionError("Staging leaked");
        System.out.println("PASS: synthetic variant selection, isolation, missing/nested/ambiguous layouts and rollback");
    }
}
