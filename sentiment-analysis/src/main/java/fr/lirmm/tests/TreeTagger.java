package fr.lirmm.tests;


import java.io.IOException;
import java.util.ArrayList;
import java.util.StringTokenizer;

import org.annolab.tt4j.TokenHandler;
import org.annolab.tt4j.TreeTaggerWrapper;

import static java.util.Arrays.asList;

/**
 *
 * 
 */
public class TreeTagger{
	
	 private static ArrayList<String> termes;
	  
	 
	public static void main(String[] args) throws Exception {
	

			System.setProperty("treetagger.home","/TreeTagger");
			TreeTaggerWrapper  tt = new TreeTaggerWrapper<String>();
			try {
				tt.setModel("french.par:UTF8");
				tt.setHandler(new TokenHandler<String>() {
					

					@Override
					public void token(String token, String pos, String lemma) {
						// TODO Auto-generated method stub
			System.out.println("termes : " +token + "\t" +pos + "\t" +lemma);	
					
						
					}

				});
				// tt.process(termes);
			tt.process(asList(new String[] {"Le","bien","qu’il",",","il"," le", "fait"," bien","."}));

		
				
			}
			finally{
				tt.destroy();
			}
		}


	}  