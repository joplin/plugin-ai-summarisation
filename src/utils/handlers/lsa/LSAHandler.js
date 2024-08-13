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

    const groupedSentences = this.groupSimilarSentences(scores);
    const summary = groupedSentences.map(group => group.join(" ")).join("\n\n");

    return summary;
  }

  groupSimilarSentences(scores, similarityThreshold = 0.5) {
    const groups = [];
    let currentGroup = [scores[0].sentence];

    for (let i = 1; i < scores.length; i++) {
      const prevSentence = scores[i - 1];
      const currentSentence = scores[i];

      if (Math.abs(prevSentence.score - currentSentence.score) < similarityThreshold) {
        currentGroup.push(currentSentence.sentence);
      } else {
        groups.push(currentGroup);
        currentGroup = [currentSentence.sentence];
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
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
