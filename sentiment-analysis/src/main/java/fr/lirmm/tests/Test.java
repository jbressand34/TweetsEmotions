package fr.lirmm.tests;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

public class Test {

	public static void main(String[] args)
	{
	
		/*StanfordLemmatizer sl = new StanfordLemmatizer();
		List<String> parts = sl.lemmatize("For anyone wanna not and what lol car et bah je sais non CONTACTS contact me #work #tesst professionally http://www.work.com here's my e-mail : RassNess@hotmail.com @REF1 @REF2");
		ArrayList<String> emails = new ArrayList<String>();
		ArrayList<String> hashtags = new ArrayList<String>();
		ArrayList<String> refs = new ArrayList<String>();
		ArrayList<String> links = new ArrayList<String>();
		boolean is ;
		for(String part: parts)
			{
			is = Tool.isEmail(part);
			System.out.println("-----isEmail:  " + is);
			if(is == true)
				emails.add(part);
			}
	
		for(String part: parts)
			{
			is = Tool.isHashtag(part);
			System.out.println("-----isHashtag:  " + is);
			if(is == true)
				hashtags.add(part);
			}
		
		for(String part: parts)
			{
			is = Tool.isRef(part);
			System.out.println("-----isRef:  " + is);
			if(is == true)
				refs.add(part);
			}
		
		for(String part: parts)
			{
			is = Tool.isLink(part);
			System.out.println("-----isLink:  " + is);
			if(is == true)
				links.add(part);
			}
		
		
		//teeest
		System.out.println("emails: --" + emails);
		System.out.println("hashtags: --" + hashtags);
		System.out.println("refs: --" + refs);
		System.out.println("links: --" + links);
		
		
		
		System.out.println("---------------------------");
		String text = "For anyone who wanna  no  WORKS works wannnts to contact me #work #tesst professionallly http://www.work.com here's WOOOO my e-mail: RassNess@hotmail.com @REF1 @REF2  not good te!st";
		ArrayList<String> terms = new ArrayList<String>(Tool.preTreat(text));
		System.out.println(terms);
		System.out.println(Tool.lengtheningFeature(terms));
		System.out.println(Tool.negatorsFeature(terms));
		System.out.println(Tool.feelSentimentFeature(terms)[0]);
		System.out.println(Tool.ngramFeature(terms, 2));
		TweetsFeatureScoresHandler f = new TweetsFeatureScoresHandler();
		f.addTweetFeatureScore("text", "f1", 1);
		System.out.println(f.addTweetFeatureScore("text", "f2", 3));
		System.out.println(f.addTweetFeatureScore("text2", "f1", 0));
		System.out.println(f.addTweetFeatureScore("text2", "f2", 5));
		System.out.println(f.addTweetFeatureScore("text", "f3", 0));
		System.out.println(f.addTweetFeatureScore("text3", "f1", 1));
		//System.out.println(f.processFeatureScores(text));
		
		System.out.println("-------------------");*/
		TweetsFeatureScoresHandler f;
		String t1 = "RT @Ashton5SOS: Thanks for being a great vibe and awesome dudes on the tour @State_Champs good luck in the future! See you soon! ???? http:/�";
		String t2 = "Je ne sais plus que faire avec ma vie, je vais peut être mettre fin à ma misère...";
		String t3 = "C'est pas à quoi je m'attendais mais ca peut aller.";
		String t4 = "Je m'attendais pas du tout à ca .. WOUAH!!";
		String t5 = "NNNNOOOOOOOOOOOOONNNNNNN";
		HashMap<String, String> classifiedAs = new HashMap<String, String>();
		classifiedAs = Tool.extractStressClass("tt");
		ArrayList<String> tweets = new ArrayList<String>();
//		tweets.add(t1);
//		tweets.add(t2);
//		tweets.add(t3);
//		tweets.add(t4);
//		tweets.add(t5);
		int nbtweets = 0;
		for(int i=0; i<classifiedAs.keySet().size(); i++)
			{
			tweets.add(new ArrayList<String>(classifiedAs.keySet()).get(i));
			}
		
		f = new TweetsFeatureScoresHandler();
		
		System.setErr(new PrintStream(new OutputStream() {
		    public void write(int b) {
		    }
		}));
		f.processAndStoreFeatureScores(tweets);
//		System.out.println(f);
	
	
	
//		for(String tweet: tweets)
//		{
//			classifiedAs.put(tweet, "peur");
//		}
//		System.out.println(Tool.makeArff("Classy", f.tweetFeatureScores, classifiedAs));

		
		try{
		    PrintWriter writer = new PrintWriter("the-file-name.txt", "UTF-8");
		    String arff =Tool.makeArff("Classy", f.tweetFeatureScores, classifiedAs);
		   	for(String line: arff.split("\n"))
		   		{
		   		writer.write(line);
		   		writer.write("\r\n");
		   		}
		    writer.close();
		} catch (IOException e) {
		   // do something
		}
	}
}
