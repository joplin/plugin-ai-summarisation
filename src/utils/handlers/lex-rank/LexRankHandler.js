import { AIHandler } from "../../base";
const natural = require('natural');

const path = require('path');
const fs = require('fs');
const os = require('os');

let w2v;
if (typeof __webpack_require__ === 'function') {
    w2v = require('word2vec');
} else {
    w2v = require(path.resolve(__dirname, 'dist/word2vec/lib'));
}

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
        const processedSentences = sentences.map(sentence =>
            wordTokenizer.tokenize(sentence).filter(word => !stopWords.has(word) && word.match(/^[a-z]+$/))
        );

        return { sentences, processedSentences };
    }

    async predict(note, topN = 8) {

        const { sentences, processedSentences } = this.preprocessNote(note);

        const inputFilePath = path.join(os.tmpdir(), 'input_note.txt');
        const outputFilePath = path.join(os.tmpdir(), 'output_phrases.txt');

        fs.writeFileSync(inputFilePath, note, 'utf8');
        if (!fs.existsSync(inputFilePath)) {
            console.error(`Input file ${inputFilePath} does not exist.`);
            return;
        }

        setTimeout(w2v.word2vec(inputFilePath, outputFilePath), 1000)

        setTimeout(() => {
            const phrases = fs.readFileSync(outputFilePath, 'utf8');
            console.log(phrases);
        }, 1000)

        const tf = this.computeTF(processedSentences);
        const idf = this.computeIDF(processedSentences);
        const tfidf = this.computeTFIDF(tf, idf);

        const similarityMatrix = this.constructSimilarityMatrix(tfidf, processedSentences.length);
        const scores = this.constructPageRank(similarityMatrix, processedSentences.length);

        const topSentences = this.rankSentences(scores, sentences, topN);
        const summary = topSentences.map(item => item.sentence).join(' ');

        // fs.unlinkSync(inputFilePath);
        // fs.unlinkSync(outputFilePath);

        return summary;   
    }

    computeTF(processedSentences) {
        const tf = processedSentences.map(sentence => {
            const termFrequency = {};
            const numOfWords = sentence.length;

            for (const word of sentence) {
                termFrequency[word] = (!termFrequency[word]) ? 1 : termFrequency[word] + 1;
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
                idf[word] = (!idf[word]) ? 1 : idf[word] + 1;
            }
        }

        for (const word in idf) {
            idf[word] = Math.log(numOfSentences / idf[word]);
        }

        return idf;
    }

    computeTFIDF(tf, idf) {
        const tfidf = tf.map(termFrequency => {
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
        let dotProduct = 0, normA = 0, normB = 0;

        words.forEach(word => {
            const tfidfA = tfidf1[word] || 0;
            const tfidfB = tfidf2[word] || 0;
            dotProduct += tfidfA * tfidfB;
            normA += tfidfA * tfidfA;
            normB += tfidfB * tfidfB;
        });

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    constructSimilarityMatrix(tfidf, n, threshold = 0.1) {
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        const degrees = Array(n).fill(0);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    const similarity = this.calculateIdfModifiedCosine(tfidf[i], tfidf[j]);
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

        const topSentences = scores
            .map((score, index) => ({ score, sentence: sentences[index] }))
            .filter(item => item.score >= averageScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

        return topSentences;
    }
}
