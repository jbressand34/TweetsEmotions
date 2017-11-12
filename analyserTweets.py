from flask import Flask, json
from flaskext.mysql import MySQL
from random import randint
import time
import sys
import nltk
from nltk.corpus import stopwords
from treetagger import TreeTagger

file_ids = open("database_identifiers.json","r")
ids = json.load(file_ids)
file_ids.close()


# Traitement de texte
stop = set(stopwords.words('english'))
reload(sys)
sys.setdefaultencoding("utf-8")

tt = TreeTagger(language='english')

""" Optimisations faites : 
  faire des executemany a la place
 des execute pour l'insertion dans la base de donnee
 fait gagner du temps en execution.
  l'execution de treetagger prend beaucoup de temps, 
 au lieu d'appeler la methode tag de treetagger sur
 chaque texte de tweet individuel, on groupe les textes par 10
 et on execute treetagger sur ces paquets de texte
"""
def analyserTexte(idTweets, textes, conn, cursor):
	deb = time.time()
	lis = tt.tag(" NOTATOKEN ".join(textes))
	tttime = time.time()
	print "Temps TreeTagger : "+str(tttime-deb)+"s\n"
	nostop= [[] for i in range(0,len(textes))]
	keywords = []
	indiceTexte = 0
	for k in lis :
		if str(k[0]) == "NOTATOKEN":
			indiceTexte += 1
		elif len(k)>=2 and k[0] not in stop :
			if ( 'NN' in  k[1]) or ( 'NP' in  k[1]) or \
			( 'JJ' in  k[1] ) or ( 'VB' in  k[1]) or \
			( '#' in k[0] ) and (len(k[0]) > 3) :
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
					nostop[indiceTexte].append(motcle)
					if motcle not in keywords and motcle.replace(" ","")!="":
						keywords.append(str(motcle))
	for1 = time.time()
	print "Temps 1ere boucle for : "+str(for1-tttime)+"s\n"

	queryKeywords1 = "select k from ("
	queryKeywords2 = ")toto where k is not null and \
	k not in (select convert(cast(mot as binary) using utf8) \
	from keyword)"
	subQueryKeywords = "select null as k"
	queryInsertKeywords = """insert into keyword values (%s)"""
	query2 = """INSERT INTO linkKeywordTweet (tweetId,mot) VALUES (%s,%s)"""				
	query4 = "select * from linkKeywordTweet  where mot = (%s) and tweetId = (%s)"


	for k in keywords :
		subQueryKeywords += " union select '"+k+"'"
	cur.execute(queryKeywords1+subQueryKeywords+queryKeywords2)
	dataMysqlKeywords = cur.fetchall()
	newKeywords = [k[0] for k in dataMysqlKeywords]
	cur.executemany(queryInsertKeywords,newKeywords)
	conn.commit()
	for2 = time.time()
	print "Temps 2ere boucle for : "+str(for2-for1)+"s\n"

	links = []
	for i in range(0,len(textes)):
		for mot in nostop[i]:
			s =str(mot)
			if len(s) < 31 and (str(idTweets[i]),s) not in links:
				links.append((str(idTweets[i]),s))
	cur.executemany(query2, links)

				#if dataMysql3 == ():
				#	cur.execute(query1,(str(mot)))
				#else:
				#	print ' that shit existe so no insert into keyword'
				#cur.execute(query4,(s,str(idTweets[i])))
				#dataMysql4 = cur.fetchall()
				#if dataMysql4 == ():
					#	print str(mot)
					#	print str(idt)
					#print s + '------ add it '	
					#cur.execute(query2,(str(idTweets[i]),s))
					#else:
					#	print ' that shit existe so no insert into linkKeywordTweet'
					#else :
					#print s + '------ couldnt add it because of reasons '					
					#conn.commit()
	for3 = time.time()
	print "Temps 3eme boucle for : "+str(for3-for2)+"s\n"
	print "Temps total analyse texte : "+str(time.time()-deb)+"s\n"

#####################


mysql = MySQL()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['MYSQL_DATABASE_USER'] = str(ids['login'])
app.config['MYSQL_DATABASE_PASSWORD'] = str(ids['password'])
app.config['MYSQL_DATABASE_DB'] = str(ids['database_name'])
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)	

conn = mysql.connect()
cur=conn.cursor()

queryNormal = "SELECT * FROM tweetNonAnalyser WHERE tweetId > (%s) LIMIT 10"
queryInsert = """INSERT into tweetAnalyser VALUES (%s,%s,%s,%s,%s,%s)"""
queryVerif = "SELECT * FROM tweetAnalyser WHERE tweetId = (%s)"

cur.execute("SELECT MAX(tweetId) FROM tweetAnalyser")
dataBegin = cur.fetchall()

if len(dataBegin)>0 and dataBegin[0][0] != None :
	print dataBegin
	lastTweetId = int(dataBegin[0][0])
else :
	lastTweetId = 0

print lastTweetId

tailleBatch = 10
batchTextes = []
batchIdTweets = []

while True :
	cur.execute(queryNormal, (str(lastTweetId)))
	dataTweets = cur.fetchall()

	if len(dataTweets)>0:

		for elt in dataTweets :
			deb = time.time()
			tweetId = elt[0]
			texte = elt[1]
			latitude = elt[2]
			longitude = elt[3]
			temps = elt[4]
			emotion = randint(0,4)
			
			cur.execute(queryVerif,(str(tweetId)))

			print lastTweetId
			lastTweetId += 1

			if cur.fetchall() == () :
				batchTextes.append(texte)
				batchIdTweets.append(str(tweetId))
				if len(batchIdTweets) >= tailleBatch:
					analyserTexte(batchIdTweets,batchTextes,conn,cur)
					batchTextes = []
					batchIdTweets = []
				cur.execute(queryInsert, (str(tweetId),texte,str(latitude),\
					str(longitude),temps,str(emotion)))
				print (str(tweetId),texte,str(latitude),\
					str(longitude),str(temps),str(emotion))
				conn.commit()
				print "Temps analyse tweet : "+str(time.time()-deb)+"s\n"
	else :
		print "dataTweets vide"
		print lastTweetId
		if len(batchIdTweets) > 0:
			analyserTexte(batchIdTweets,batchTextes,conn,cur)
			batchTextes = []
			batchIdTweets = []
		time.sleep(10)
		conn.close()
		mysql = MySQL()
		app = Flask(__name__)
		app.config['SECRET_KEY'] = 'secret!'
		app.config['MYSQL_DATABASE_USER'] = 'root'
		app.config['MYSQL_DATABASE_PASSWORD'] = 'password'
		app.config['MYSQL_DATABASE_DB'] = 'tweets'
		app.config['MYSQL_DATABASE_HOST'] = 'localhost'
		mysql.init_app(app)
		
		conn = mysql.connect()
		cur = conn.cursor()
	time.sleep(1)

conn.close()