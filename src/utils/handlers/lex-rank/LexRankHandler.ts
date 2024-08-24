import { AIHandler } from "../../base";

const natural = require("natural");

export class LexRankHandler extends AIHandler {
  static describe() {
    return `
            LexRank based on this implementation: https://rishabh71510.medium.com/understanding-lexrank-text-summarization-algorithm-fb2c5415e0b6
        `;
  }

  preprocessNote(note) {
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const wordTokenizer = new natural.TreebankWordTokenizer();
    const stopWords = new Set(natural.stopwords);

    const sentences = sentenceTokenizer.tokenize(note);
    const processedSentences = sentences.map((sentence) =>
      wordTokenizer
        .tokenize(sentence)
        .filter((word) => !stopWords.has(word) && word.match(/^[a-z]+$/)),
    );

    return { sentences, processedSentences };
  }

  predict(note, topN = 10) {
    const { sentences, processedSentences } = this.preprocessNote(note.replace(/\[.*?\]/g, ''));
    const tf = this.computeTF(processedSentences);
    const idf = this.computeIDF(processedSentences);
    const tfidf = this.computeTFIDF(tf, idf);

    const similarityMatrix = this.constructSimilarityMatrix(
      tfidf,
      processedSentences.length,
    );
    const scores = this.constructPageRank(
      similarityMatrix,
      processedSentences.length,
    );

    const topSentences = this.rankSentences(scores, sentences, topN);

    //const summary = topSentences.map((item) => item.sentence).join(" ");
    const groupedSentences = this.groupSimilarSentences(topSentences);
    const summary = groupedSentences
      .map((group) => group.map((item) => item.sentence).join(" "))
      .join("\n\n");

    return summary;
  }

  groupSimilarSentences(topSentences, similarityThreshold = 0.6) {
    const groups = [];
    let currentGroup = [topSentences[0]];

    for (let i = 1; i < topSentences.length; i++) {
      const prevSentence = topSentences[i - 1];
      const currentSentence = topSentences[i];

      const similarityScore = this.calculateIdfModifiedCosine(
        prevSentence.sentence.split(" "),
        currentSentence.sentence.split(" "),
      );

      if (similarityScore >= similarityThreshold) {
        currentGroup.push(currentSentence);
      } else {
        groups.push(currentGroup);
        currentGroup = [currentSentence];
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  predictBatch(note) {
    const { sentences, processedSentences } = this.preprocessNote(note.replace(/\[.*?\]/g, ''));
    const tf = this.computeTF(processedSentences);
    const idf = this.computeIDF(processedSentences);
    const tfidf = this.computeTFIDF(tf, idf);

    const similarityMatrix = this.constructSimilarityMatrix(
      tfidf,
      processedSentences.length,
    );
    const scores = this.constructPageRank(
      similarityMatrix,
      processedSentences.length,
    );

    const topSentencesShort = this.rankSentences(scores, sentences, 6);
    const topSentencesMedium = this.rankSentences(scores, sentences, 18);
    const topSentencesLong = this.rankSentences(scores, sentences, 30);

    const summaryShort = topSentencesShort
      .map((item) => item.sentence)
      .join(" ");
    const summaryMedium = topSentencesMedium
      .map((item) => item.sentence)
      .join(" ");
    const summaryLong = topSentencesLong.map((item) => item.sentence).join(" ");

    return {
      summaryShort: summaryShort,
      summaryMedium: summaryMedium,
      summaryLong: summaryLong,
    };
  }

  computeTF(processedSentences) {
    const tf = processedSentences.map((sentence) => {
      const termFrequency = {};
      const numOfWords = sentence.length;

      for (const word of sentence) {
        termFrequency[word] = !termFrequency[word]
          ? 1
          : termFrequency[word] + 1;
      }

      for (const word of Object.keys(termFrequency)) {
        termFrequency[word] /= numOfWords;
      }
      return termFrequency;
    });

    return tf;
  }

  computeIDF(processedSentences) {
    const idf = {};
    const numOfSentences = processedSentences.length;

    for (const sentence of processedSentences) {
      for (const word of new Set(sentence)) {
        // @ts-ignore
        idf[word] = !idf[word] ? 1 : idf[word] + 1;
      }
    }

    for (const word in idf) {
      idf[word] = Math.log(numOfSentences / idf[word]);
    }

    return idf;
  }

  computeTFIDF(tf, idf) {
    const tfidf = tf.map((termFrequency) => {
      const tfidfSentence = {};
      for (const word of Object.keys(termFrequency)) {
        tfidfSentence[word] = termFrequency[word] * idf[word];
      }
      return tfidfSentence;
    });

    return tfidf;
  }

  calculateIdfModifiedCosine(tfidf1, tfidf2) {
    const words = new Set([...Object.keys(tfidf1), ...Object.keys(tfidf2)]);
    let dotProduct = 0,
      normA = 0,
      normB = 0;

    words.forEach((word) => {
      const tfidfA = tfidf1[word] || 0;
      const tfidfB = tfidf2[word] || 0;
      dotProduct += tfidfA * tfidfB;
      normA += tfidfA * tfidfA;
      normB += tfidfB * tfidfB;
    });

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  constructSimilarityMatrix(tfidf, n, threshold = 0.1) {
    const matrix = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    const degrees = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const similarity = this.calculateIdfModifiedCosine(
            tfidf[i],
            tfidf[j],
          );
          if (similarity > threshold) {
            matrix[i][j] = similarity;
            degrees[i]++;
          } else {
            matrix[i][j] = 0;
          }
        }
      }
    }

    for (let i = 0; i < n; i++) {
      if (degrees[i] > 0) {
        for (let j = 0; j < n; j++) {
          matrix[i][j] /= degrees[i];
        }
      }
    }

    return matrix;
  }

  constructPageRank(matrix, n, iterations = 100, dampingFactor = 0.85) {
    let scores = Array(n).fill(1 / n);

    for (let iter = 0; iter < iterations; iter++) {
      const newScores = Array(n).fill((1 - dampingFactor) / n);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newScores[i] += dampingFactor * matrix[j][i] * scores[j];
        }
      }

      scores = newScores;
    }
    return scores;
  }

  rankSentences(scores, sentences, topN) {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    let seenSentences = new Set();

    const topSentences = scores
      .map((score, index) => ({ score, sentence: sentences[index] }))
      .filter((item) => item.score >= averageScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .filter((item) => {
        if (seenSentences.has(item.sentence)) {
          return false;
        } else {
          seenSentences.add(item.sentence);
          return true;
        }
      })
      .sort(
        (a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence),
      );

    return topSentences;
  }
}
