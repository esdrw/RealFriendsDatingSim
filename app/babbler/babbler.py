import os
import random
import math
import heapq
import string

unknownSymbol = "UNKNOWNWORD"
startSymbol = "NODATA"
stopSymbol = "THISISTHEEND"

def generatePrefixDict(inputDict):
    prefixWordCounts = dict();
    for token in inputDict:
        prefix = token[:token.rfind("|") + 1]
        word = token[token.rfind("|") + 1:]
        if(not (prefix in prefixWordCounts)):
            prefixWordCounts[prefix] = [];
        for i in range(inputDict[token]):
            prefixWordCounts[prefix].append(word);
    return prefixWordCounts;

def generatePrefixCounts(inputDict):
    historyCounts = dict();
    for key in inputDict:
        historyCounts[key[:len(key)-1]] = len(inputDict[key])
    return historyCounts

#frequencyDict is a dictionary containing our frequencies of historyLength
def babble(frequencyDict, historyLength):
    topLevelHistory = "".join([startSymbol + "|"] * historyLength)
    topLevelHistoryDict = generatePrefixDict(frequencyDict)
    text = ""
    ans = ""


    while (text != stopSymbol):
        historyDict = topLevelHistoryDict
        history = topLevelHistory

        """
        while not (history in historyDict):
            historyCounts = generatePrefixCounts(historyDict)
            historyDict = generatePrefixDict(historyCounts)
            history = history[:history[:len(history)-1].rfind("|") + 1]

        #note, this increases the nonsense that comes out
        while(len(set(historyDict[history])) == 1):
            historyCounts = generatePrefixCounts(historyDict)
            historyDict = generatePrefixDict(historyCounts)
            history = history[:history[:len(history)-1].rfind("|") + 1]

        """
        text = random.choice(historyDict[history])

        if not (topLevelHistory in topLevelHistoryDict):
            topLevelHistoryDict[topLevelHistory] = []
            topLevelHistoryDict[topLevelHistory].append(text)

        topLevelHistory = topLevelHistory[topLevelHistory.find("|") + 1:] + text + "|"
        if text != stopSymbol:
            if text in string.punctuation:
                ans += text
            else:
                ans += " " + text
    return ans
