package fr.lirmm.tests;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Iterator;
import java.util.zip.GZIPInputStream;
import org.apache.commons.io.LineIterator;


/**
 * @author Bilel-Pth
 * Read a GZ (or gzip) file and return a line iterator over the file
 */
public class GzippedFileReader implements Iterable<String>{
    private final File mFile;
    private LineIterator mReaderIterator;
  
    public GzippedFileReader(File path) {
        mFile = path;
        mReaderIterator = null;
    }
  
    public GzippedFileReader(String path) {
        this(new File(path));
    }
  
    public void open() throws FileNotFoundException, IOException {
        FileInputStream inFileStream = new FileInputStream(mFile);
        GZIPInputStream gzippedStream = new
GZIPInputStream(inFileStream, 65536);
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(gzippedStream,
Charset.forName("UTF-8")));
        mReaderIterator = new LineIterator(reader);
    }
  
    public LineIterator getLineIterator() throws FileNotFoundException,
IOException {
        FileInputStream inFileStream = new FileInputStream(mFile);
        GZIPInputStream gzippedStream = new
GZIPInputStream(inFileStream, 65536);
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(gzippedStream,
Charset.forName("UTF-8")));
        return new LineIterator(reader);
      
    }
  
  
    public Iterator<String> iterator() {
        return mReaderIterator;
    }
  
    public void close() {
        LineIterator.closeQuietly(mReaderIterator);
    }
}
