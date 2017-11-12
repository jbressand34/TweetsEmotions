drop table linkKeywordTweet;
drop table keyword;
drop table tweetNonAnalyser;
drop table tweetAnalyser;

create table tweetNonAnalyser ( 
	tweetId INT NOT NULL AUTO_INCREMENT, 	
	texte VARCHAR(500), 
	latitude double, 
	longitude double, 
	temps TIMESTAMP, 
	primary key(tweetId) 
);

create table tweetAnalyser (
	tweetId INT NOT NULL AUTO_INCREMENT, 	
	texte VARCHAR(500), 
	latitude double, 
	longitude double, 
	temps TIMESTAMP, 
	valeurEmotion INT,
	primary key(tweetId) 
);

/*
insert into  tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love good banane', 43.6745677, 3.67568586,  TIMESTAMP('2012-12-31'), 3);
insert into tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love good chocolat', 43.6745677, 3.67568586, TIMESTAMP('2003-12-31'), 5);
insert into  tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love banane1', 43.6745677, 3.67568586,  TIMESTAMP('2012-12-31'), 3);
insert into tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love chocolat1', 43.6745677, 3.67568586, TIMESTAMP('2003-12-31'), 5);
insert into  tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love banane2', 43.6745677, 3.67568586,  TIMESTAMP('2012-12-31'), 3);
insert into tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love chocolat2', 43.6745677, 3.67568586, TIMESTAMP('2003-12-31'), 5);
insert into  tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love banane3', 43.6745677, 3.67568586,  TIMESTAMP('2012-12-31'), 3);
insert into tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love chocolat3', 43.6745677, 3.67568586, TIMESTAMP('2003-12-31'), 5);
insert into  tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love banane4', 43.6745677, 3.67568586,  TIMESTAMP('2012-12-31'), 3);
insert into tweetAnalyser (texte,latitude,longitude,temps,valeurEmotion) values ('i love chocolat4', 43.6745677, 3.67568586, TIMESTAMP('2003-12-31'), 5);
*/

create table keyword ( 
	mot VARCHAR(30) PRIMARY KEY
);

/*insert into keyword values ("chocolat1"),("banane1");*/

create table linkKeywordTweet ( 
	tweetId INT, 
	mot varchar(30), 
	constraint fk_keyword foreign key (mot) references keyword(mot), 
	constraint fk_tweet foreign key (tweetId) references tweetNonAnalyser(tweetId), 
	constraint pk_link primary key(tweetId,mot)
);

/*insert into linkKeywordTweet values (1,"banane1");*/