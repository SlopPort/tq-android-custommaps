import org.tqmods.ModStore;
import java.io.*;
import java.nio.file.*;
public class DatabasePathTest {
  public static void main(String[] args) throws Exception {
    File root=Files.createTempDirectory("tq-database-path-").toFile();
    ModStore store=new ModStore(root);
    File entry=store.importFile(new ByteArrayInputStream(ModStoreTest.arz()),"example.arz");
    if(!store.database(entry).isFile())throw new AssertionError("Missing imported database");
    for(File invalid:new File[]{root,root.getParentFile(),new File(root,".stage"),new File(root,"missing")}){
      try {store.database(invalid);throw new AssertionError("Accepted invalid entry");}catch(IOException expected){}
    }
    Files.write(new File(entry,"second.arz").toPath(),ModStoreTest.arz());
    try {store.database(entry);throw new AssertionError("Accepted ambiguous database");}catch(IOException expected){}
    System.out.println("PASS: committed database resolution, outside/staging/missing and ambiguous rejection");
  }
}
