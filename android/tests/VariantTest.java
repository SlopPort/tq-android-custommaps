import org.tqmods.ModStore;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;
public class VariantTest {
 public static void main(String[] args) throws Exception {
  File root=Files.createTempDirectory("tqvariants-").toFile(); ModStore store=new ModStore(root); String[] choices=null;
  try(InputStream in=new FileInputStream(args[0])) { store.importFile(in,"xmax.zip"); }
  catch(ModStore.VariantRequired e) { choices=e.variants; }
  if(choices==null || choices.length!=6 || store.installed().length!=0 || root.list().length!=0) throw new AssertionError("selection or rollback");
  try(ZipFile zip=new ZipFile(args[0])) {
   for(String choice:choices) {
    File installed; try(InputStream in=new FileInputStream(args[0])) { installed=store.importFile(in,"xmax.zip",choice); }
    int count=0;
    Enumeration<? extends ZipEntry> entries=zip.entries();
    while(entries.hasMoreElements()) {
     ZipEntry entry=entries.nextElement(); if(entry.isDirectory())continue;
     String name=entry.getName().replace('\\','/'); File dest=new File(installed,name);
     if(name.startsWith(choice+"/")) {
      byte[] expected; try(InputStream in=zip.getInputStream(entry);ByteArrayOutputStream out=new ByteArrayOutputStream()) { byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1)out.write(b,0,n);expected=out.toByteArray(); }
      if(!Arrays.equals(expected,Files.readAllBytes(dest.toPath())))throw new AssertionError("changed: "+name);count++;
     } else if(dest.exists()) throw new AssertionError("Sibling leakage: "+name);
    }
    if(count<2)throw new AssertionError("resources missing");
    System.out.println("PASS "+choice+": "+count+" files identical; siblings excluded");
   }
  }
  try(InputStream in=new FileInputStream(args[0])) { store.importFile(in,"xmax.zip","../invalid");throw new AssertionError("invalid choice accepted"); }catch(IOException expected){}
  for(File f:root.listFiles())if(f.getName().startsWith("."))throw new AssertionError("staging leak");
 }
}
