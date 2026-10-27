import org.tqmods.ModStore;
import java.io.*;
import java.nio.file.*;
public class ResourceInventoryTest {
 public static void main(String[] args) throws Exception {
  File root=Files.createTempDirectory("tq-resources-").toFile();ModStore store=new ModStore(root);
  File entry=store.importFile(new ByteArrayInputStream(ModStoreTest.arz()),"test.arz");
  if(store.resources(entry).length!=0)throw new AssertionError("Unexpected resources");
  File folder=new File(entry,"resources");folder.mkdir();
  Files.write(new File(folder,"Z.arc").toPath(),new byte[]{1});
  Files.write(new File(folder,"A.ARC").toPath(),new byte[]{2});
  Files.write(new File(folder,"notes.txt").toPath(),new byte[]{3});
  File[] found=store.resources(entry);
  if(found.length!=2||!found[0].getName().equals("A.ARC"))throw new AssertionError("Inventory/order");
  try {store.resources(root);throw new AssertionError("Outside entry accepted");}catch(IOException expected){}
  System.out.println("PASS: empty inventory, ARC filtering, stable ordering, entry rejection");
 }
}
