import tweepy
import csv
import time
from flask import Flask, render_template, request, jsonify, json
#from flask_socketio import SocketIO, emit
from flaskext.mysql import MySQL


CONSUMER_KEY = '4rM3O0ELiJQVcTWXQUzqkXMmv'
CONSUMER_SECRET = 'uKe69JY17yGeJVg6LBYqTuQLDcZdcALrASxeEOxOOD75vs7887'
ACCESS_TOKEN = '848864625655459841-BTtaJ7C6lca0kl18GMMVvJst7SuW4Ca'
ACCESS_TOKEN_SECRET = 'D5u9XAtt9HJeGlaldyVLtCgSNMSv06MZn4Pn8rlxamazJ'

auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
api = tweepy.API(auth)

file_ids = open("database_identifiers.json","r")
ids = json.load(file_ids)
file_ids.close()

#override tweepy.StreamListener to add logic to on_status
class MyStreamListener(tweepy.StreamListener):
	output = {}
	count = 0	
	limit = 10000
	mysql = MySQL()
	app = Flask(__name__)
	app.config['SECRET_KEY'] = 'secret!'
	app.config['MYSQL_DATABASE_USER'] = str(ids['login'])
	app.config['MYSQL_DATABASE_PASSWORD'] = str(ids['password'])
	app.config['MYSQL_DATABASE_DB'] = str(ids['database_name'])
	app.config['MYSQL_DATABASE_HOST'] = 'localhost'
	mysql.init_app(app)	

	conn = mysql.connect()
	query = """INSERT INTO tweetNonAnalyser (texte,latitude,longitude,temps) values (%s,%s,%s,TIMESTAMP(%s))"""
	cur=conn.cursor()

	#file = csv.writer(open("tweets10000.csv", "wb"))
	#file.writerow(["Texte","Longitude", "Latitude", "Time"])
	def on_status(self, status):
#		time.sleep(1)
		if(self.count < self.limit):
			if(status.coordinates != None):
				#self.file.writerow([" ".join(status.text.encode('utf-8').split("\n")),status.coordinates["coordinates"][0],status.coordinates["coordinates"][1],status.created_at.isoformat(' ')])
				self.output[status.id] = {
				'tweet': " ".join(status.text.encode('utf-8').split("\n")),
				'longitude': status.coordinates["coordinates"][0],
				'latitude': status.coordinates["coordinates"][1],
				'lang': status.lang, 
				'time':status.created_at.isoformat(' ')}
				print self.output[status.id]
#				self.count += 1
				s = str(" ".join(status.text.encode('utf-8').split("\n")))
				s.decode('utf-8')
				if status.lang == 'en':
					s.lstrip("\xe2")
					s.lstrip("\x80")
					s.lstrip("\xa6")
					s.lstrip("\xf0")
					s.lstrip("\x9f")
					s.lstrip("\x95")
					s.lstrip("\xb4")
					s.lstrip("\x9e")
					s.lstrip("\xbc")
					s.lstrip("\x94")
					s.lstrip("\x91")
					s.lstrip("\xaf")
					s.lstrip("\x98")
					s.lstrip("\x8d")
					s.lstrip("\xc4")
					s.lstrip("\xb0")
					s.lstrip("\xc2")
					s.lstrip("\xb0")
					s.lstrip("\x8e")
					s.lstrip("\xa3")
					s.lstrip("\xef")
					s.lstrip("\xb8")
					s.lstrip("\x8f")
					s.lstrip("\xb9")
					s.lstrip("\xa8")
					s.lstrip("\xa9")
					s.lstrip("\xbb")
					s.lstrip("\xc3")
					s.lstrip("\xba")
					s.lstrip("\x9c")
					s.lstrip("\xa1")
					s.lstrip("\x92")
					s.lstrip("\xa7")
					s.lstrip("\xb3")
					s.lstrip("\xba")
					self.cur.execute(self.query,((str(s.split("\n"))),(str(status.coordinates["coordinates"][0])),(str(status.coordinates["coordinates"][1])),(str(status.created_at.isoformat(' ')))))
					self.conn.commit()
				else: 
					print " not in englliiissshhhh ******************************"
				
		else:			
			return False
		
		


myStreamListener = MyStreamListener()
myStream = tweepy.Stream(auth = api.auth, listener=myStreamListener)
myStream.filter(locations=[-180,-90,180,90])

#myStream.filter(locations=[-74,40,-73,41])
