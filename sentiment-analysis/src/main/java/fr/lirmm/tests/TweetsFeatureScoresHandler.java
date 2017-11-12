package fr.lirmm.tests;

import java.util.ArrayList;
import java.util.HashMap;

public class TweetsFeatureScoresHandler {

	HashMap<String, HashMap<String, Integer>> tweetFeatureScores;// Tweet -> Feature -> Score
	final int NGRAMS = 2;
	
	public TweetsFeatureScoresHandler()
	{
		tweetFeatureScores = new HashMap<String, HashMap<String, Integer>>();
	}
	
	public HashMap<String, HashMap<String, Integer>> addTweetFeatureScore(String tweet, String featureName, int score)
	{
		HashMap<String, Integer> currentFeatureScores = tweetFeatureScores.get(tweet);
		
		if(currentFeatureScores == null)
		{
			currentFeatureScores = new HashMap<String, Integer>();
			tweetFeatureScores.put(tweet, currentFeatureScores);
		}
		currentFeatureScores.put(featureName, score);
		
		return tweetFeatureScores;
		
	}
	
	public HashMap<String, HashMap<String, Integer>> processAndStoreFeatureScores(ArrayList<String> tweets)
	{
		int nbTweets = tweets.size();
		int nbTweets2 = nbTweets;
		ArrayList<String> termsNoSpec;
		System.out.println("Loading...");
		System.out.println( nbTweets + " tweets");
		HashMap<String, ArrayList<String>> ngramsPerTweet = new HashMap<String, ArrayList<String>>();
		ArrayList<String> allNgrams = new ArrayList<String>();
		
		
		for(String tweet: tweets)
			{
			System.out.println("pre-treating...");
			ArrayList<String> terms = 	new ArrayList<String>(Tool.preTreat(tweet));
			System.out.println("processing...");
			tweetFeatureScores.put(tweet, processFeatureScores(tweet, terms));
			termsNoSpec = Tool.clean(terms);
			termsNoSpec = Tool.replaceLenghenedTerms(termsNoSpec);
			ngramsPerTweet.put(tweet, Tool.ngramFeature(termsNoSpec, NGRAMS));
			
			nbTweets--;
			
			if(nbTweets>1)
			System.out.println("tweet proccessed - " + nbTweets + " tweets left ...");
			else
				if(nbTweets>0)
					System.out.println("tweet proccessed - " + nbTweets + " tweet left ...");
//			System.out.println(((nbTweets2-nbTweets)*100/nbTweets2) + "%");
			}

		allNgrams = Tool.concatenateAllArrayListsOnHashMap(ngramsPerTweet);
		
			for(String tweet: ngramsPerTweet.keySet())
			{
				for(String ngram: allNgrams)
					if(ngramsPerTweet.get(tweet).contains(ngram))
						addTweetFeatureScore(tweet, ngram + "   && " + NGRAMS + "-gram", 1);
						else
							addTweetFeatureScore(tweet, ngram + "   && " + NGRAMS + "-gram", 0);
			}
		return tweetFeatureScores;
	}
	
	public HashMap<String, Integer> processFeatureScores(String tweet, ArrayList<String> terms)
	{
		HashMap<String, Integer> tweetFeatureScores = new HashMap<String, Integer>();
		
		//punct
		int[] punctFeature = Tool.punctFeature(terms);
		tweetFeatureScores.put("punctSeq", punctFeature[0]);
		tweetFeatureScores.put("lastPunct", punctFeature[1]);
		//lengthening
		tweetFeatureScores.put("lengthening", Tool.lengtheningFeature(terms));
		//negators
		tweetFeatureScores.put("negators", Tool.negatorsFeature(terms));
		//emoticons
		tweetFeatureScores.put("emoticons", Tool.emoticonsFeature(terms));
		//FEEL sentiment
		int[] feelSentimentFeature = Tool.feelSentimentFeature(terms);
		tweetFeatureScores.put("posFEEL", feelSentimentFeature[0]);
		tweetFeatureScores.put("negFEEL", feelSentimentFeature[1]);
		//FEEL emotion
		HashMap<String, Integer> feelEmotionFeature = Tool.feelEmotionFeature(terms);
		for(int i=0; i<Tool.NBEMOCLASSES; i++)
			tweetFeatureScores.put(Tool.EMOTIONCLASSES.get(i), feelEmotionFeature.get(Tool.EMOTIONCLASSES.get(i)));
		//NLP analyzer
		tweetFeatureScores.put("NLP", Tool.stanfordAnalyserFeature(tweet));
		return tweetFeatureScores;
	}
	
	public String toString()
	{
		String desc = "";
		ArrayList<String> ngrams = new ArrayList<String>();
		
		for(String tweet: tweetFeatureScores.keySet())
			{
			if(desc.equals(""))
				desc = tweetFeatureScores.get(tweet).keySet().size() + " Feature----\n";
			
			
			desc = desc + tweet + ":\n";
			for(String feature: tweetFeatureScores.get(tweet).keySet())
				{
				if(!feature.endsWith("   && -gram"))
				desc = desc + feature + ": " + tweetFeatureScores.get(tweet).get(feature) + "\n";
				else
					ngrams.add(feature);
				}
			for(String ngram: ngrams)
				desc = desc + ngram + ": " + tweetFeatureScores.get(tweet).get(ngram) + "\n";
			ngrams = new ArrayList<String>();
			desc += "----------------------------------------------------------------------------------\n";
			}
		
		return desc;
	}
}
