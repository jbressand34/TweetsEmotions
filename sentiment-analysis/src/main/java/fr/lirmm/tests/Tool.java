package fr.lirmm.tests;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import edu.stanford.nlp.tagger.maxent.MaxentTagger;
import weka.core.Attribute;
import weka.core.FastVector;
import weka.core.Instance;
import weka.core.Instances;
public abstract class Tool {

	public static ArrayList<String> negators;
	public static ArrayList<String> emoticons;
	public static ArrayList<String> positiveFeel;
	public static ArrayList<String> negativeFeel;
	public static final int NBEMOCLASSES = 6;
	public static final ArrayList<String> EMOTIONCLASSES = new ArrayList<String>(Arrays.asList("joie", "surprise", "tristesse", "peur", "angoisse", "degout"));
	public static ArrayList<String> classes;
	public static ArrayList<ArrayList<String>> emoFeel;
	public static final ArrayList<String> CLASSIFICATIONCLASSES = new ArrayList<String>(Arrays.asList("joie", "surprise", "tristesse", "peur", "angoisse", "degout", "stress", "relaxation"));

	
	public static void loadNegators(String negatorsPath)
	{
		ArrayList<String> n = IOTool.readFile(negatorsPath);
		negators = new ArrayList<String>();
		for(String negator: n)
			if(!negator.equals(""))
			negators.add(negator.toLowerCase());
	}
	
	public static void loadEmoticons(String emoticonsPath)
	{
		ArrayList<String> n = IOTool.readFile(emoticonsPath);
		emoticons = new ArrayList<String>();
		for(String emoticon: n)
			if(!emoticon.equals(""))
			emoticons.add(emoticon);
	}
	
	public static void loadFeel(String feelPath)
	{
		positiveFeel = new ArrayList<String>();
		negativeFeel = new ArrayList<String>();
		emoFeel = new ArrayList<ArrayList<String>>();
		for(int i=0; i<NBEMOCLASSES; i++)
			emoFeel.add(new ArrayList<String>());
			
		ArrayList<String> n = IOTool.readFile(feelPath);
		ArrayList<String> split;
	    for(String line: n)
	    {
	    	split = new ArrayList<String>(Arrays.asList(line.split(";")));
	    	
	    	 switch (split.get(2)) 
	    	 {
             case "positive":
                 positiveFeel.add(split.get(1).toLowerCase());
                 break;
             case "negative":
                 negativeFeel.add(split.get(1).toLowerCase());
                 break;
	    	 }
	    	 
	    	 
	    	 classes = new ArrayList<String>();
	    	 classes.add("confiance");
	    	 classes.add("joie");
	    	 classes.add("colère");
	    	 classes.add("tristesse");
	    	 classes.add("dégout");
	    	 classes.add("surprise");
	    	 classes.add("peur");
	    	 ArrayList<String> filteredClasses = new ArrayList<String>();
	    	 for (int i=0; i<NBEMOCLASSES; i++)
	    		 {
	    		 filteredClasses.add(classes.get(i));
	    		 if (split.get(i+3).equals("1")) 
	    			 emoFeel.get(i).add(split.get(1).toLowerCase());
	    		 }
	    	 classes = filteredClasses;
	    }
	                
	}
	
	public static List<String> preTreat(String text)
	{
		StanfordLemmatizer sl = new StanfordLemmatizer();
		List<String> parts = sl.lemmatize(text);
		String part;
		for(int i = 0; i<parts.size(); i++)
		{
			part = parts.get(i);
			if(isEmail(part))
				parts.set(i, "EMAIL");
				else
					if(isHashtag(part))
						parts.set(i, "@TAG");
					else
						if(isLink(part))
							parts.set(i, "lienHTTP");
							else
								if(isRef(part))
									parts.set(i, "REF");
		}
		return parts;
	}
	
	public static boolean isEmail(String text)
	{
	Boolean found = false;
		
		
	    Matcher m = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+").matcher(text);
	    while (m.find()) {
	    	found = true;
	    }
	    if(found==false)
	    	return false;
	    else 
	    	return true;
	}
	
	public static boolean isHashtag(String text)
	{
		if(text.charAt(0) == '#')
			return true;
		else
			return false;
	}
	
	public static boolean isRef(String text)
	{
		if(text.charAt(0) == '@')
			return true;
		else
			return false;
		
	}
	
	public static boolean isLink(String text)
	{
		text = text.trim();
		boolean found = false;
		  Matcher m = Pattern.compile("(http|https)://www\\.[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-.]+").matcher(text);
		    while (m.find()) {
		    	found = true;
		    }
		    if(found==false)
		    	return false;
		    else 
		    	return true;
		
	}
	
	public static boolean isSequenceOfPunct(String text)
	{
		if(text.trim().equals(""))
			return false;
			for(char c: text.toCharArray())
			if(c != '!' && c!= '?')
				return false;
		return true;
	}
	
	
	public static boolean containsPunct(String last)
	{
		for(char c: last.toCharArray())
			if(c == '!' || c == '?')
				return true;
		return false;
	}
	
	
	public static int[] punctFeature(ArrayList<String> terms) //First field of the array is the number of sequences of punctuation, second is 1 if the last term contains punctuation --- punctuation here is either an exclamation mar or a question mark.
	{
		int[] fScores = new int[2];
		fScores[0] = 0;    
		fScores[1] = 0;
		for(String term: terms)
			if(isSequenceOfPunct(term))
				fScores[0]++;
		if(containsPunct(terms.get(terms.size()-1)))
			fScores[1]++;
		
		return fScores;
	}
	
	public static int lengtheningFeature(ArrayList<String> terms) //number of lengthened terms
	{
		int lengthened = 0;
		int conseq;
		for(String term: terms)
			{
			conseq = 1;
			char lastChar = ' ';
			
			for(char c: term.toCharArray())
			{
				if(c == lastChar)
					{
					conseq++;
					if(conseq == 3)
					{
						lengthened++;
						break;
					}
					}
				else
				{
					conseq = 1;
					lastChar = c;
				}
			}
			}
		return lengthened;
	}
	
	public static int negatorsFeature(ArrayList<String> terms) // 1 or 0
	{
		
		if(negators == null)
			loadNegators("Negators");
		for(String term: terms)
			if(negators.contains(term.toLowerCase()))
				return 1;
			
		return 0;
	}
	
	public static int emoticonsFeature(ArrayList<String> terms) //1 or 0
	{
		if(emoticons == null)
			loadEmoticons("Emoticons");
		for(String term: terms)
			if(negators.contains(term.toLowerCase()))
				return 1;
			
		return 0;
	}
	
	public static int[] feelSentimentFeature(ArrayList<String> terms) // [0] is the number of positive terms, [1] number of negative terms
	{
		int[] fScores = new int[2];
		fScores[0] = 0;    
		fScores[1] = 0;
		if(positiveFeel == null)
			loadFeel("FEEL");
		for(String term: terms)
			{
			if(positiveFeel.contains(term.toLowerCase()))
				fScores[0]++;
			else
				if(negativeFeel.contains(term.toLowerCase()))
					fScores[1]++;
			}
				
		return fScores;
	}
	
	public static HashMap<String, Integer> feelEmotionFeature(ArrayList<String> terms)//joie surprise tristesse peur angoisse degout
	{
		HashMap<String, Integer> emotions = new HashMap<String, Integer>();
		for(int i=0; i<NBEMOCLASSES; i++)
			emotions.put(EMOTIONCLASSES.get(i), new Integer(0));
		if(emoFeel == null)
			loadFeel("FEEL");
		for(String term: terms)
			{
			
			
				for(int i=0; i<NBEMOCLASSES; i++)
				{
					if(emoFeel.get(i).contains(term))
						emotions.put(EMOTIONCLASSES.get(i), emotions.get(EMOTIONCLASSES.get(i))+1);
				}
			}
				
		return emotions;
	}
	
	public static ArrayList<String> ngramFeature(ArrayList<String> terms, int n)
	{
		  ArrayList<String> ngrams = new ArrayList<String>();
		  
		  for(int k=0; k<(terms.size()-n+1); k++){
		    String s="";
		    int start=k;
		    int end=k+n;
		    for(int j=start; j<end; j++){
		     s=s+""+terms.get(j);
		    }
		    
		    ngrams.add(s);
	}
		  return ngrams;
	}
	
	public static int stanfordAnalyserFeature(String text)
	{
		StanfordCoreNlpSenttest st = new StanfordCoreNlpSenttest(); 
		return st.findSentiment(text);
	}
	
	public static ArrayList<String> concatenateAllArrayListsOnHashMap(HashMap<String, ArrayList<String>> map)
	{
		ArrayList<String> values = new ArrayList<String>();
		
		for(String key: map.keySet())
		{
			values.addAll(map.get(key));
		}
		
		return values;
	}
	
	public static String makeArff(String relationName, HashMap<String, HashMap<String, Integer>> attributesValues)
	{
		ArrayList<String> tweets = new ArrayList<String>(attributesValues.keySet());
		FastVector attributes = new FastVector();
		FastVector classes = new FastVector();
		for(String aClass: CLASSIFICATIONCLASSES)
			classes.addElement(aClass);
		Instances data;
		double[] vals;
		int i;
		ArrayList<String> ngrams = new ArrayList<String>();
		
		for(String attribute: attributesValues.get(tweets.get(0)).keySet())
		{
			if(!attribute.endsWith("-gram"))
			attributes.addElement(new Attribute(attribute));		
			else
				ngrams.add(attribute);
			
		}
		
		for(String ngram: ngrams)
			attributes.addElement(new Attribute(ngram));
		
		attributes.addElement(new Attribute("class", classes));
		data = new Instances(relationName, attributes, 0);
		
		for(String tweet: tweets)
		{
			vals = new double[data.numAttributes()];
			i = 0;
			
			for(String attribute: attributesValues.get(tweet).keySet())
				if(!attribute.endsWith("-gram"))
				{
					vals[i] = attributesValues.get(tweet).get(attribute);
					i++;
				}
			
			for(String ngram: ngrams)
			{
				vals[i] = attributesValues.get(tweet).get(ngram);
				i++;
			}
			data.add(new Instance(1.0, vals));
		}

		return data.toString();
	}
	
	public static String makeArff(String relationName, HashMap<String, HashMap<String, Integer>> attributesValues, HashMap<String, String> classifiedAs)
	{

		ArrayList<String> tweets = new ArrayList<String>(attributesValues.keySet());
		FastVector attributes = new FastVector();
		FastVector classes = new FastVector();
		for(String aClass: CLASSIFICATIONCLASSES)
			classes.addElement(aClass);
		Instances data;
		double[] vals;
		int i;
		ArrayList<String> ngrams = new ArrayList<String>();
		
		for(String attribute: attributesValues.get(tweets.get(0)).keySet())
		{
			if(!attribute.endsWith("-gram"))
			attributes.addElement(new Attribute(attribute));		
			else
				ngrams.add(attribute);
			
		}
		
		for(String ngram: ngrams)
			attributes.addElement(new Attribute(ngram));
		
		attributes.addElement(new Attribute("class", classes));
		data = new Instances(relationName, attributes, 0);
		
		for(String tweet: tweets)
		{
			vals = new double[data.numAttributes()];
			i = 0;
			
			for(String attribute: attributesValues.get(tweet).keySet())
				if(!attribute.endsWith("-gram"))
				{
					vals[i] = attributesValues.get(tweet).get(attribute);
					i++;
				}
			
			for(String ngram: ngrams)
			{
				vals[i] = attributesValues.get(tweet).get(ngram);
				i++;
			}
			vals[i] = classes.indexOf(classifiedAs.get(tweet));
			data.add(new Instance(1.0, vals));
		}

		return data.toString();
	}
	
	public static ArrayList<String> clean(ArrayList<String> terms)
	{
		ArrayList<String> lessTerms = new ArrayList<String>();
		String REGX = ".,;:'‘’\"()?[]!-_\\/“<>$&®´…«»1234567890`";
		char[] specs = REGX.toCharArray();
		for(String term: terms)
		{ 
			for(char spec: specs)
				term = term.replace("" + spec, "");
			  
			if(!term.equals(""))
				lessTerms.add(term);
		}
		return lessTerms;
	}
	
	 public static ArrayList<String> replaceLenghenedTerms(ArrayList<String> terms)
	 {
		 ArrayList<String> replaced = new ArrayList<String>();
	     for(String term: terms)
	    	 replaced.add(term = replaceLengthenedCharactersInString(term));
	     return replaced;
	 }
	 
	 
	 public static String replaceLengthenedCharactersInString(String string){
	        String result="";
	        char c1=' ';
	        char c2=' ';
	        string = string.toLowerCase();
	        for (int i=0; i<string.length(); i++){
	            if (string.charAt(i)!=c1 || string.charAt(i)!=c2) result+=string.charAt(i);
	            c1=c2;
	            c2=string.charAt(i);
	        }
	        return result;
	    }
	 
	 public static String formStringFromArrayList(ArrayList<String> terms, String separator)
	 {
		 String text = "";
		 for(String term: terms)
			 text += term + separator;
		 
		 return text;
	 }
	 
	 public static HashMap<String, String> extractStressClass(String stressFilePath)
	 {
		 HashMap<String, String> stressSentiment = new HashMap<String, String>();
		 ArrayList<String> lines = IOTool.readFile(stressFilePath);
		 ArrayList<String> split;
		 int stress;
		 int relaxation;
		 for(String line: lines)
		 {
			 split = new ArrayList<String>(Arrays.asList(line.split("\t")));
			 stress = Integer.parseInt(split.get(1));
			 relaxation = Integer.parseInt(split.get(0));
			 
			 split.remove(0);
			 split.remove(0);
			
			 if( Math.abs(stress) > relaxation)
				 stressSentiment.put(Tool.formStringFromArrayList(split, " "), "stress");
			 else
				 if(Math.abs(stress) < relaxation)
					 stressSentiment.put(Tool.formStringFromArrayList(split, " "), "relaxation");
			
			
		 }
		 return stressSentiment;
	 }
	 
	
}
