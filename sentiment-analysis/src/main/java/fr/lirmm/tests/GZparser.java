package fr.lirmm.tests;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.logging.Level;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.LineIterator;
import org.apache.log4j.Logger;
import org.omg.CORBA.Environment;

import fr.lirmm.tests.GzippedFileReader;
import twitter4j.JSONException;
import twitter4j.JSONObject;
import twitter4j.Status;
import twitter4j.TwitterException;
import twitter4j.TwitterObjectFactory;

import org.json.*;

public class GZparser{
	private LinkedBlockingQueue<File> queue;
	private File[] allgzFiles;
	private File currentfile;
	private LineIterator lineIterator;
	public void open(File file) throws JSONException {
		File gzDirectory = file;
		System.out.println("File : "+ gzDirectory.toString());
		queue = new LinkedBlockingQueue<File>();

		allgzFiles = gzDirectory.listFiles();
		System.out.println("AllGzFiles : "+ allgzFiles.toString());
		// Sort files by ascending order of their names
		Arrays.sort(allgzFiles);
		for (File gzfile : allgzFiles) {
			// if (gzfile.getName().endsWith("gz"))
			System.out.println("Order : " + gzfile.getName());
			queue.offer(gzfile);
		}
		System.out.println(queue.size() + " files to process...");
		this.currentfile = queue.poll();

		try {
			if (this.currentfile.getName().endsWith("gz") || this.currentfile.getName().startsWith("statuses.log.")) {
				GzippedFileReader fzreader = new GzippedFileReader(this.currentfile);
				this.lineIterator = fzreader.getLineIterator();
				String str = "First open! processing file : " + this.currentfile.getName();
				System.out.println(str);

				if ((this.lineIterator != null)) {
					System.out.println("line it ININ is good " );

					while (this.lineIterator.hasNext()) {
						String line = this.lineIterator.nextLine().toString();
						if (line != null) {

							if (!(line.isEmpty()) && !line.startsWith("{\"delete\":{")) {
								try {
									JSONObject obj = new JSONObject(line);
									String txt = obj.getString("text");
									System.out.println(txt);
									Status status = TwitterObjectFactory.createStatus(line);
									if (status != null) {
										//nbline++;
									}
								} catch (TwitterException e) {
									// System.out.println("Exception Spout statuseslog :
									// " + this.currentfile.getName() + " : "
									// + " line : " + line + " - " + e.getMessage());
									// TODO : deleted statuses should be removed from
									// the databases !
								}
							}
						}
					}
				}

						
			} else
				System.out.println("First open! ignoring file : " + this.currentfile.getName());

			
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
	public static void main(String[] args) throws JSONException{
		GZparser fp = new GZparser();
		File f = new File("./statuses.log");
		System.out.println(f.getAbsolutePath());
		fp.open(f);
	}
}




	
