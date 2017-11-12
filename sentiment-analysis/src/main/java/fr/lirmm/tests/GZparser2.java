package fr.lirmm.tests;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.commons.io.LineIterator;

import twitter4j.JSONException;
import twitter4j.JSONObject;
import twitter4j.Status;
import twitter4j.TwitterException;
import twitter4j.TwitterObjectFactory;

public class GZparser2{
	private LinkedBlockingQueue<File> queue;
	private File[] allgzFiles;
	private File currentfile;
	private LineIterator lineIterator;
	private int nbTweets = 0;
	FileWriter fileWriter = null;
	public void open(File file, int nTweets) throws JSONException {
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

					StanfordCoreNlpSenttest st = new StanfordCoreNlpSenttest(); 
					
					FileWriter fr = new FileWriter("csvTweets.csv");			
					final String HEADER = "text,sentiment,user,longitude,latitude";
					final String LINE_SEPARATOR = "\n";
					String text;
					String longitude;
					String latitude;
					String sentiment;
					String user;
					
					fr.append(HEADER.toString());
					fr.append(LINE_SEPARATOR);
					
					while (this.lineIterator.hasNext() && nbTweets < nTweets) {
						nbTweets++;
						String line = this.lineIterator.nextLine().toString();
						if (line != null) {

							if (!(line.isEmpty()) && !line.startsWith("{\"delete\":{")) {
								try {
									JSONObject obj = new JSONObject(line);
									
									text = obj.getString("text").replaceAll(",", " ").replaceAll("\n", " ").replaceAll("[^\\x00-\\x7F]", "");
									user = String.valueOf(obj.getJSONObject("user").getString("name"));
									
									
									if(obj.getString("coordinates") != null && text.trim()!="" && user.trim() != "")
									{
										longitude = String.valueOf(obj.getJSONObject("coordinates").getJSONArray("coordinates").get(0));
										latitude = String.valueOf(obj.getJSONObject("coordinates").getJSONArray("coordinates").get(1));
										sentiment = String.valueOf(st.findSentiment(text));
										
										if(sentiment.trim() != null){
											fr.append(text);
											fr.append(",");
											fr.append(sentiment);
											fr.append(",");
											fr.append(user);
											fr.append(",");
											fr.append(longitude);
											fr.append(",");
											fr.append(latitude);
											fr.append(LINE_SEPARATOR);
										}
										
										System.out.println(sentiment +" ----" + longitude + "----" + latitude + "-----" + user);
									}
									
									
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
					fr.close();
				}

						
			} else
				System.out.println("First open! ignoring file : " + this.currentfile.getName());

			
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
	public static void main(String[] args) throws JSONException{
		GZparser2 fp = new GZparser2();
		File f = new File("tweets");
		fp.open(f, 5000);
	}
}




	
