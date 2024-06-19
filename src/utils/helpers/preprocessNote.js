const natural = require('natural');

function preprocessNote(note) {
    console.log(`NOTE: ${note}`);

    const sentenceTokenizer = new natural.SentenceTokenizer();
    const wordTokenizer = new natural.TreebankWordTokenizer();
    const stopWords = new Set(natural.stopwords);

    const sentences = sentenceTokenizer.tokenize(note);
    const processedSentences = sentences.map(sentence =>
        wordTokenizer.tokenize(sentence).filter(word => !stopWords.has(word) && word.match(/^[a-z]+$/))
    );

    return { sentences, processedSentences };
}

module.exports = {
    preprocessNote
}