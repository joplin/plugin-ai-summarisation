function computeTF(processedSentences) {
  const tf = processedSentences.map((sentence) => {
    const termFrequency = {};
    const numOfWords = sentence.length;

    for (const word of sentence) {
      termFrequency[word] = !termFrequency[word] ? 1 : termFrequency[word] + 1;
    }

    for (const word of Object.keys(termFrequency)) {
      termFrequency[word] /= numOfWords;
    }
    return termFrequency;
  });

  return tf;
}

function computeIDF(processedSentences) {
  const idf = {};
  const numOfSentences = processedSentences.length;

  for (const sentence of processedSentences) {
    for (const word of new Set(sentence)) {
      idf[word] = !idf[word] ? 1 : idf[word] + 1;
    }
  }

  for (const word in idf) {
    idf[word] = Math.log(numOfSentences / idf[word]);
  }

  return idf;
}

function computeTFIDF(tf, idf) {
  const tfidf = tf.map((termFrequency) => {
    const tfidfSentence = {};
    for (const word of Object.keys(termFrequency)) {
      tfidfSentence[word] = termFrequency[word] * idf[word];
    }
    return tfidfSentence;
  });

  return tfidf;
}

function getTFIDF(processedSentences) {
  const tf = computeTF(processedSentences);
  const idf = computeIDF(processedSentences);
  const tfidf = computeTFIDF(tf, idf);

  return tfidf;
}

module.exports = {
  getTFIDF,
};
