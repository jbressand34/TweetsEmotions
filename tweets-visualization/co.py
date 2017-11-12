import nltk
from nltk.corpus import stopwords
stop = set(stopwords.words('english'))
sentence = """At eight o'clock on Thursday morning... Arthur didn't feel very good."""

tokens =nltk.tokenize.word_tokenize(sentence)

print tokens

tagged = nltk.pos_tag(tokens)

print tagged

print [i for i in sentence.lower().split() if i not in stop]






# import nltk
# from nltk.corpus import stopwords
# stop = set(stopwords.words('english'))
# lista = []
#	for lis in str(df.text).split("\n") :
#		print [i for i in lis.lower().split() if i not in stop]

@app.route("/data")
def get_data():
	df = pd.read_csv(data_path + 'csvTweets.csv')
	cols_to_keep = ['sentiment', 'longitude', 'latitude', 'text']
	df_clean = df[cols_to_keep].dropna()
	lista = []
	j = 0
	while j < len(df.text) :
		print [i for i in str(df.text[j]).lower().split() if i not in stop]
		lista.append(str(df.text[j]))
		j = j+1
	for lis in lista:
		print lis
	return df_clean.to_json(orient='records')