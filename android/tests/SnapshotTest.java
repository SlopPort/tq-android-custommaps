import org.tqmods.ImportSnapshot;
import java.io.*;
import java.nio.file.*;
public class SnapshotTest {
    public static void main(String[] args) throws Exception {
        File directory=Files.createTempDirectory("snapshot-test-").toFile();
        byte[] source={1,2,3};
        ImportSnapshot snapshot=ImportSnapshot.create(directory,new ByteArrayInputStream(source),"test.zip");
        source[0]=99;
        for(int i=0;i<2;i++)try(InputStream in=snapshot.open()) {
            if(in.read()!=1 || in.read()!=2 || in.read()!=3 || in.read()!=-1)throw new AssertionError("Changed snapshot");
        }
        snapshot.close(); snapshot.close();
        if(directory.list().length!=0)throw new AssertionError("Leaked completed snapshot");
        try {
            ImportSnapshot.create(directory,new InputStream(){public int read()throws IOException{throw new IOException("Provider failure");}},"bad.zip");
            throw new AssertionError("Failure ignored");
        } catch(IOException expected){}
        if(directory.list().length!=0)throw new AssertionError("Leaked failed snapshot");
        System.out.println("PASS: stable repeated reads, cleanup and provider failure rollback");
    }
}
