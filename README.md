# Visualization of Emotion Discrepancy in response to Trending Events in Social Medias

This document will guide you through the installation and execution of this application.
The aim of this application is to get real time tweets from the social media Twitter, to do emotion analysis on them and finally to render all these data on a webpage.

## Prerequies

* Python  2.7.6
* Virtualenv 1.11.4
* (X/L/_)Ubuntu LTS x86_64 >= 14.04.5
* MySql 14.14
	* Create a database with the name of your choice
	* Specify a login, a password and a database name in 
	* database_identifiers.json

## Installation

1. Create a virtual environment. For exemple:

	`virtualenv venv`

	`source venv/bin/activate`

2. Configure your database
	1. Connect to your database
	2. To create the tables needed, do:

		`source creationDB.sql`

3. To install all packages needed and update environment variables, do:

	`source install.sh`

4. The previous step for installing all packages can take one hour, indeed we install NumPy and Pandas which are big packages. 

## Execution

1. To get real time tweets from Twitter, do:

	`python tweets_from_tweepy_to_database.py`

2. To do emotion analysis on the tweets in your database, do:

	`python analyserTweets.py`

3. To start the server, do :

	`cd tweets-visualization`

	`python app.py`

4. To visualize your data, open a navigator and write in the adress bar:

	`localhost:5000`

## Ending

You can shut the server and all other programs by typing C+c

To exit the virtual environment, type `deactivate`

## Contacts

ELGABSI Moez: moez.elgabsi@etu.umontpellier.fr

PRYSIAZHNIUK Anastasiia: anastasiia.prysiazhniuk@etu.umontpellier.fr

BRESSAND Jérémy: jeremy.bressand@etu.umontpellier.fr