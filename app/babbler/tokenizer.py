import os
import pickle
import nltk
import babbler
import re
import string

startSymbol = "NODATA"
stopSymbol = "THISISTHEEND"

def tokenizeString(sentence):
    sentence = string.lower(sentence)
    tokens = nltk.word_tokenize(sentence)
    return tokens

'''
sentence = """At eight o'clock on Thursday morning
... Arthur didn't feel very good."""
tokens = nltk.word_tokenize(sentence)
print(tokens)
'''

def generateNGram(tokens, n):
    wordCounts = dict()

    history = "".join([startSymbol + "|"] * n)
    for token in tokens:
        entry = history + token
        if(not (entry in wordCounts)):
            wordCounts[entry] = 0;
        if(n != 0):
            history = history[history.find("|") + 1:] + token + "|"

    history = "".join([startSymbol + "|"] * n)
    for token in tokens:
        entry = history + token
        wordCounts[entry] += 1
        if(n != 0):
           history = history[history.find("|") + 1:] + token + "|"
    wordCounts[history + stopSymbol] = 1;

    return wordCounts

def sanitizeString(inputString):
    filter = re.compile('\w+:\/{2}[\d\w-]+(\.[\d\w-]+)*(?:(?:\/[^\s/]*))*')
    input = re.sub(filter, "", inputString);
    return input;

#goal, split text into lines, each line is a sentence. Take each lines POS structure and throw
#into a freq table. Take it and use it to babble.

"""
data = pickle.load( open( "../test/corpus.dat", "rb" ) )
print data[1]

print sanitizeString("hi http://url.com/bla1/blah1/");


replySentences = []
for query_reply in data:
    query = query_reply[0]
    reply = query_reply[0]
    for line in reply.split("\n"):
        line = sanitizeString(line)
        replySentences.append(line)
"""
def get_freq_count(replySentences, n):
    totalTokenCounts = dict()
    for reply in replySentences:
        tokens = tokenizeString(reply);
        tokenCounts = generateNGram(tokens, n);
        for tkCount in tokenCounts:
            if not (tkCount in totalTokenCounts):
                totalTokenCounts[tkCount] = 0;
            totalTokenCounts[tkCount] += tokenCounts[tkCount]
    return totalTokenCounts
"""
structureTable = dict()
for line in sentence.split("\n"):
    tokens = tokenizeString(line)
    partsOfSpeech = nltk.pos_tag(tokens);
    postStructure = []
    for tokTag in partsOfSpeech:
        postStructure.append(tokTag[1])
    structure = tuple(postStructure)
    if not(structure in structureTable):
        structureTable[structure] = 0;
    structureTable[structure] += 1;
#print structureTable;
"""

#tokens = tokenizeString(sentence);
#tokenCounts = generateNGram(tokens, 2);


def get_reply(replySentences, n=1):
    return babbler.babble(get_freq_count(replySentences, n), n)
