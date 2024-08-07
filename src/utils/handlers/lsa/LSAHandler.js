import { AIHandler } from "../../base";
import { preprocessNote } from "../../helpers/preprocessNote";

const math = require("mathjs");
const { SVD } = require("svd-js");

export class LSAHandler extends AIHandler {
  describe() {
    return `
        LSA from https://aishwaryap.github.io/iitm/NLPProject.pdf
        `;
  }

  predict(note, topN = 50) {
    const { sentences, processedSentences } = preprocessNote(note);
    const binaryMatrix = this.createBinaryMatrix(processedSentences);
    const { U, S, V } = this.constructSVD(binaryMatrix);
    const scores = this.scoreSentences(U, S, sentences, topN);
    const result = scores.map((item) => item.sentence).join(" ");

    return result;
  }

  predictBatch(note) {
    const { sentences, processedSentences } = preprocessNote(note);
    const binaryMatrix = this.createBinaryMatrix(processedSentences);
    const { U, S, V } = this.constructSVD(binaryMatrix);

    const scoresShort = this.scoreSentences(U, S, sentences, 6);
    const scorestMedium = this.scoreSentences(U, S, sentences, 18);
    const scoresLong = this.scoreSentences(U, S, sentences, 30);

    const summaryShort = scoresShort.map((item) => item.sentence).join(" ");
    const summaryMedium = scorestMedium.map((item) => item.sentence).join(" ");
    const summaryLong = scoresLong.map((item) => item.sentence).join(" ");

    return {
      summaryShort: summaryShort,
      summaryMedium: summaryMedium,
      summaryLong: summaryLong,
    };
  }

  createBinaryMatrix(sentences) {
    const allWords = Array.from(new Set(sentences.flat()));
    const matrix = sentences.map((sentence) => {
      return allWords.map((word) => (sentence.includes(word) ? 1 : 0));
    });

    return matrix;
  }

  constructSVD(matrix) {
    const { u, q, v } = SVD(math.transpose(matrix));
    return { U: u, S: q, V: v };
  }

  scoreSentences(U, S, sentences, topN) {
    const scores = sentences.map((sentence, i) => {
      const uRow = U[i];
      const score = math.norm(math.multiply(uRow, S));
      return { sentence, score };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topN);
  }
}
