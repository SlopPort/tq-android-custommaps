import org.tqmods.SaveProfileStore;
import java.io.*;
import java.nio.file.*;
import java.util.Arrays;
public class SaveProfileTest {
 public static void main(String[] args) throws Exception {
  Path temp=Files.createTempDirectory("tq-profile-");
  Path source=Files.createDirectories(temp.resolve("live/SaveData"));
  Path hero=Files.createDirectories(source.resolve("Main/TestHero"));
  Path original=hero.resolve("Player.chr");byte[] bytes={1,2,3};Files.write(original,bytes);
  File profiles=temp.resolve("profiles").toFile();String id="00000000-0000-0000-0000-000000000001";
  try {SaveProfileStore.create(source.toFile(),profiles,id,true);throw new AssertionError("Running engine accepted");}catch(IOException expected){}
  if(profiles.exists())throw new AssertionError("Running refusal created storage");
  File copy=SaveProfileStore.create(source.toFile(),profiles,id,false);
  Path copied=copy.toPath().resolve("Main/TestHero/Player.chr");
  if(!Arrays.equals(bytes,Files.readAllBytes(copied)))throw new AssertionError("Copy differs");
  Files.write(copied,new byte[]{9});
  if(!Arrays.equals(bytes,Files.readAllBytes(original)))throw new AssertionError("Source changed");
  Files.write(original,new byte[]{8});
  if(!Arrays.equals(new byte[]{9},Files.readAllBytes(copied)))throw new AssertionError("Profile aliases source");
  try {SaveProfileStore.create(source.toFile(),profiles,id,false);throw new AssertionError("Overwrite accepted");}catch(IOException expected){}
  if(!Arrays.equals(new byte[]{9},Files.readAllBytes(copied)))throw new AssertionError("Existing profile altered");
  try {SaveProfileStore.create(source.toFile(),profiles,"../escape",false);throw new AssertionError("Traversal accepted");}catch(IOException expected){}
  try {SaveProfileStore.create(source.toFile(),source.resolve("profiles").toFile(),"00000000-0000-0000-0000-000000000002",false);throw new AssertionError("Nested root accepted");}catch(IOException expected){}
  System.out.println("PASS: independent save copy, bidirectional write separation, duplicate/traversal/running/nested-root refusal");
 }
}
