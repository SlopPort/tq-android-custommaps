import org.tqmods.StartupSelection;
import org.tqmods.SaveProfileStore;
import org.json.JSONObject;
import java.io.*;
import java.nio.file.*;
import java.util.Arrays;

/** Run with Android's org.json and AtomicFile implementations. */
public class StartupSelectionTest {
 public static void main(String[] args) throws Exception {
  Path temp=Files.createTempDirectory("tq-startup-");
  Path files=Files.createDirectories(temp.resolve("files"));
  Path live=Files.createDirectories(temp.resolve("live/SaveData"));
  Files.write(live.resolve("Player.chr"),new byte[]{1,2});
  Path request=files.resolve("tqmods/request.json"), frozen=files.resolve("tqmods/startup-request.json");
  StartupSelection.prepare(files.toFile(),live.toFile(),123);
  JSONObject vanilla=new JSONObject(new String(Files.readAllBytes(frozen),"UTF-8"));
  if(!vanilla.isNull("id") || vanilla.getInt("startupPid")!=123)throw new AssertionError("No-selection startup");
  String id="00000000-0000-0000-0000-000000000001";
  File profile=SaveProfileStore.create(live.toFile(),files.resolve("tqmods/save-profiles").toFile(),id,false);
  JSONObject mod=new JSONObject();mod.put("schema",1);mod.put("id",id);mod.put("database","test.arz");
  mod.put("preparedProfile","untrusted");
  Files.write(request,mod.toString().getBytes("UTF-8"));
  StartupSelection.prepare(files.toFile(),live.toFile(),124);
  byte[] snapshot=Files.readAllBytes(frozen);
  JSONObject chosen=new JSONObject(new String(snapshot,"UTF-8"));
  JSONObject prepared=chosen.getJSONObject("preparedProfile");
  if(!profile.getPath().equals(prepared.getString("root")) || prepared.getBoolean("runtimeBound"))
    throw new AssertionError("Profile validation or inactive state");
  Files.write(request,"broken".getBytes("UTF-8"));
  if(!Arrays.equals(snapshot,Files.readAllBytes(frozen)))throw new AssertionError("Selection mutated frozen startup");
  try {StartupSelection.prepare(files.toFile(),live.toFile(),125);throw new AssertionError("Malformed selection accepted");}catch(org.json.JSONException expected){}
  if(!Arrays.equals(snapshot,Files.readAllBytes(frozen)))throw new AssertionError("Failed startup replaced snapshot");
  Files.write(request,mod.toString().getBytes("UTF-8"));
  Files.delete(profile.toPath().getParent().resolve("profile.properties"));
  try {StartupSelection.prepare(files.toFile(),live.toFile(),126);throw new AssertionError("Unprepared profile accepted");}catch(IOException expected){}
  if(!Arrays.equals(snapshot,Files.readAllBytes(frozen)))throw new AssertionError("Invalid profile replaced snapshot");
  Files.delete(request);
  Path alias=temp.resolve("files-alias");
  Files.createSymbolicLink(alias,files);
  StartupSelection.prepare(alias.toFile(),live.toFile(),127);
  JSONObject aliased=new JSONObject(new String(Files.readAllBytes(frozen),"UTF-8"));
  if(aliased.getInt("startupPid")!=127)throw new AssertionError("Trusted app-directory alias failed");
  System.out.println("PASS: default vanilla, per-start snapshot, validated inactive profile, malformed selection and incomplete profile refusal");
 }
}
