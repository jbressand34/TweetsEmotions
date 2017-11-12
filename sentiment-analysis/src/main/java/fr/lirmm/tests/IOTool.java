package fr.lirmm.tests;



import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

public abstract class IOTool {

	
	public static ArrayList<String> readFile(String filePath) 
	{
		ArrayList<String> lines  = new ArrayList<String>();
		try
		{
		
		BufferedReader br = new BufferedReader(new FileReader(filePath));
		String line;
		while((line = br.readLine()) != null)
		{
			lines.add(line);
		}
		br.close();
		
		
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
		return lines;
	}
}
