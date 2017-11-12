# -*- coding: utf-8 -*-

import pandas as pd

from flask import Flask, request, jsonify, json
from flask import render_template

#request to go through the file
#from flask import request
import json as jsonIm

from flask_socketio import SocketIO, emit
from flaskext.mysql import MySQL
from datetime import datetime
from threading import Thread, Event
import time
from treetagger import TreeTagger

import os
#import independance 
import sys
import nltk
from nltk.corpus import stopwords

file_ids = open("../database_identifiers.json","r")
ids = json.load(file_ids)
file_ids.close()

stop = set(stopwords.words('english'))
reload(sys)
sys.setdefaultencoding("utf-8")


data_path = './input/'
n_samples = 30

#get root path
APP_ROOT = os.path.dirname(os.path.abspath(__file__))


with open(data_path + '/geojson/europe.json') as data_file:    #europe.json
	provinces_json = jsonIm.load(data_file)

mysql = MySQL()

app = Flask(__name__)

@app.route("/")
def index():
	return render_template("index.html")



#method of upload and saving a file


@app.route("/upload", methods=["POST"])
def index1():
	target = os.path.join(APP_ROOT,'input/')
	for file in request.files.getlist("file"):
		destination = "/".join([target,'csvTweets.csv'])
		file.save(destination)
	return render_template("index.html")



listm= []
@app.route("/data")
def get_data():
	debTime = time.time()
	df = pd.read_csv(data_path + 'csvTweets.csv')
	cols_to_keep = ['sentiment', 'longitude', 'latitude', 'text']
	df_clean = df[cols_to_keep].dropna()
	lista = []
	j = 0
	liststop = []
	listval= []
	while j < len(df.text) :
		tt = TreeTagger(language='english')
		lis = tt.tag(str(df.text[j]).lower())
		for i in lis :
			if ( 'NN' in  i[1]) or ( 'NP' in  i[1]) or   ( 'JJ' in  i[1] ) or ( 'VB' in  i[1]) or  ( '#' in i[0] ) and (len(i[0]) > 3) :
				if i[0] not in stop :
					if "#" in i[0] :
						i[0] =i[0].replace("#","")
					if "." in i[0] :
						i[0] = i[0].replace(".","")							
					lis = []
					if "-" in i[0] :
						lis = i[0].split("-")
						if "" in lis :
							lis.remove("")
						i[0] = ' '.join(lis)
					if "_" in i[0] :
						lis = i[0].split("_")
						if "" in lis :
							lis.remove("")
						i[0] = ' '.join(lis)
					inc = 1
					for letter in i[0]:
						if not letter in "abcdefghijklmnopqrstuvwxyz ":
						     inc = 0
					if (inc != 0) and (len(i[0])>3):
						if i[0] in liststop :
							listval[liststop.index(i[0])] = listval[liststop.index(i[0])]+1
						else :
							listval.append(1)
							liststop.append(i[0])
		j = j+1
	js = []
	j = 0
	lenval =  len(listval)
	pod = 0
	kickval = ""
	kickstop = ""
	while j < lenval:
		pod = listval.index(max(listval))
		kickval = listval.pop(pod)
		kickstop = liststop.pop(pod)
		js = [kickstop,kickval]
		listm.append(js)
		j = j+1
	duree = time.time() - debTime
	print "\n"
	print "   @--- Overhead /data socket : "+\
	str(duree)+" seconds ---@"
	print "\n" 
	return df_clean.to_json(orient='records')

@app.route("/countries")
def get_counties():
	debTime = time.time()
	df = pd.read_csv(data_path + 'countries.csv')
	cols_to_keep = ['country', 'latitude', 'longitude']
	df_clean = df[cols_to_keep].dropna()
	duree = time.time() - debTime
	print "\n"
	print "   @--- Overhead /countries socket : "+\
	str(duree)+" seconds ---@"
	print "\n"
	return df_clean.to_json(orient='records')

@app.route("/cities")
def get_cities():
	debTime = time.time()
	df = pd.read_csv(data_path + 'cities.csv')
	cols_to_keep = ['city', 'lat', 'lng']
	df_clean = df[cols_to_keep].dropna()
	duree = time.time() - debTime
	print "\n"
	print "   @--- Overhead /cities socket : "+\
	str(duree)+" seconds ---@"
	print "\n"
	return df_clean.to_json(orient='records')
 

app.config['SECRET_KEY'] = 'secret!'
app.config['MYSQL_DATABASE_USER'] = str(ids['login'])
app.config['MYSQL_DATABASE_PASSWORD'] = str(ids['password'])
app.config['MYSQL_DATABASE_DB'] = str(ids['database_name'])
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

conn = mysql.connect()
	
socketio = SocketIO(app, max_http_buffer_size=2048)


thread = Thread()
thread_stop_event = Event()

class Streaming(Thread):
	#termine = True
	#lastTime = None
	def _init_(self):
		#self.delay = 1
		super(Streaming, self)._init_()

	def envoiTweets(self):
		print "@----Envoi des tweets--@"
		cursor = conn.cursor()
		lastId = "0"
		query = "SELECT * FROM tweetAnalyser WHERE temps > (now() - interval 20 second - interval 2 hour) and tweetId > "+ lastId
		query50 = "SELECT DISTINCT mot, COUNT(tweetId) AS frequency FROM linkKeywordTweet GROUP BY mot ORDER BY frequency DESC LIMIT 10"
		while not thread_stop_event.isSet():
			cursor.execute(query)
			dataMysql = cursor.fetchall()
			cursor.execute(query50)
			dataMysql50 = cursor.fetchall()
			listmotkey= []	
			for elt in dataMysql50 :
				coooo=(elt[0],elt[1])
				listmotkey.append(coooo)
			liste = []
			for elt in dataMysql:
				texte = elt[1][2:][:len(elt[1])-4]
				new = (texte,elt[2],elt[3],json.dumps(elt[4]))#,elt[5])
				socketio.emit('reponse', {'motsCles':listmotkey, 'tweets':[new]})
				liste.append(new)
				idt= elt[0]
				if lastId <= str(idt) :	
					lastId = str(idt)
				s = elt[1].split()
#				print idt
				tt = TreeTagger(language='english')
				lis =[]
				lis = tt.tag(s)
				nostop= []
#				print lis
				for k in lis :
					if k[0] not in stop :
						if ( 'NN' in  k[1]) or ( 'NP' in  k[1]) or   ( 'JJ' in  k[1] ) or ( 'VB' in  k[1]) or  ( '#' in k[0] ) and (len(k[0]) > 3) :
	#						print k[1]
	#						print k [0]
							motcle = k[0]
							if "#" in k[0] :
								motcle =motcle.replace("#","")
							if "." in k[0] :
								motcle = motcle.replace(".","")							
					 		motcle = motcle.lower()
							lis = []
							if "-" in motcle :
								lis = motcle.split("-")
								if "" in lis :
									lis.remove("")
								motcle = ' '.join(lis)
							if "_" in motcle :
								lis = motcle.split("_")
								if "" in lis :
									lis.remove("")
								motcle = ' '.join(lis)
							inc = 1
							for letter in motcle:
								if not letter in "abcdefghijklmnopqrstuvwxyz ":
								     inc = 0
							if (inc != 0) and (len(motcle)>3):
								nostop.append(motcle)
					
							#print motcle
						
				for mot in nostop :
					query1 = """INSERT INTO keyword (mot) VALUES (%s)"""
					query2 = """INSERT INTO linkKeywordTweet (tweetId,mot) VALUES (%s,%s)"""
					query3 = "select * from keyword where mot = (%s)"				
					query4 = "select * from linkKeywordTweet  where mot = (%s) and tweetId = (%s)"
								
					cur=conn.cursor()
					cur.execute(query3,(str(mot)))
					dataMysql3 = cur.fetchall()
					
					s =str(mot)
					if len(s) < 31:
					
						if dataMysql3 == ():
							cur.execute(query1,(str(mot)))
						#else:
						#	print ' that shit existe so no insert into keyword'
						cur.execute(query4,(str(mot),str(idt)))
						dataMysql4 = cur.fetchall()
						if dataMysql4 == ():
						#	print str(mot)
						#	print str(idt)
							#print s + '------ add it '	
							cur.execute(query2,(str(idt),str(mot)))
						#else:
						#	print ' that shit existe so no insert into linkKeywordTweet'
					#else :
						#print s + '------ couldnt add it because of reasons '					
					conn.commit()
				nostop= []
			conn.commit()
#			time.sleep(5)


	def run(self):
		self.envoiTweets()
		

	def stop(self):
		self.termine = False 

#stream = Streaming()

@socketio.on('connect temps reel', namespace='/')
def test_message():
	global thread
	print "in connect temps reel"
	if not thread.isAlive():
		thread = Streaming()
		thread.start()
	"""
	if(stream.termine):
		print ("@-------@ Activation du stream !!")
		stream.run()
	"""

@socketio.on('streamgraph', namespace='/')
def get_streamgraph():
	print "@--- debut chargement data streamgraph --@"
	connStatic = mysql.connect()
	curStatic = connStatic.cursor()
	queryStatic = "select t1.t, t1.v, t2.c from ("
	queryStatic += "select t, v from ( "
	queryStatic += "select distinct date_sub(temps, interval second(temps) second) as t from tweetAnalyser"
	queryStatic += ") as t1 cross join ("
	queryStatic += "select distinct valeurEmotion as v from tweetAnalyser"
	queryStatic += ") as t2"
	queryStatic += ") as t1 left join ("
	queryStatic += "select date_sub(temps, interval second(temps) second) as t, valeurEmotion as v, count(*) as c from tweetAnalyser group by t, v"
	queryStatic += ") as t2 on t1.t = t2.t and t1.v = t2.v "
	queryStatic += "order by t1.t, t1.v"
	curStatic.execute(queryStatic)
	dataStatic = curStatic.fetchall()
	socketio.emit("streamgraph", {"tweets":json.dumps(dataStatic),"mots":json.dumps(listm)})
	connStatic.close()
	print "@--- fin chargement data streamgraph --@"


@socketio.on('disconnect temps reel', namespace='/')
def test_message():
	stream.stop()

@socketio.on('mots cles', namespace='/')
def test_message(message):
	print (message)
	

@socketio.on('periode temps', '/')
def test_message(message):
	print (message)

@socketio.on('sentiments', '/')
def test_message(message):
	emit('reponse', {
	"motsCles": [
		{"mot": "chocolat", "nbTweets": 10},
		{"mot": "banane", "nbTweets": 15}
	],
	"tweets": [
		{
			"texte": "J'aime le chocolat",
			"latitude": 43.6854547,
			"longitude": 3.5765765,
			"temps": "Wed Aug 27 13:08:45 +0000 2008",
			"valeurEmotion": 2
		},
		{
			"texte": "J'aime la banane",
			"latitude": 43.67586,
			"longitude": 3.89068,
			"temps": "Wed Aug 27 13:08:45 +0000 2008",
			"valeurEmotion": 3
		}
	]
	})


if __name__ == "__main__":
	#app.run(host='0.0.0.0',port=5000,debug=True)
	socketio.run(app,host='0.0.0.0', log_output=True)
