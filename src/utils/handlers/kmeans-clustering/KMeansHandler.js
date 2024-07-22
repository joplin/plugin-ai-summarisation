import { AIHandler } from "../../base";
import { preprocessNote } from "../../helpers/preprocessNote";
import { getTFIDF } from "../../helpers/constructTFIDF";

const math = require("mathjs");
const logger = require("electron-log");

export class KMeansClustering extends AIHandler {
  describe() {
    return `
        KMeans Clustering: https://www.researchgate.net/publication/333081743_Extractive_based_Text_Summarization_Using_KMeans_and_TF-IDF?enrichId=rgreq-bba6fe10c210d4c37f34c4dcffa5fe8a-XXX&enrichSource=Y292ZXJQYWdlOzMzMzA4MTc0MztBUzo3NjEyMzM4Nzk4Nzk2ODJAMTU1ODUwMzcwODcwMQ%3D%3D&el=1_x_3&_esc=publicationCoverPdf
        `;
  }

  async predict(note, k = 6) {
    logger.info("KMeans Clustering: Starting the process...");
    const { sentences, processedSentences } = preprocessNote(note);
    const tfidf = getTFIDF(processedSentences);
    const sentenceVectors = this.vectorizeSentences(processedSentences, tfidf);
    const { centroids, assignments } = this.kmeans(sentenceVectors, k);
    const summary = this.extractSummary(
      sentences,
      sentenceVectors,
      assignments,
      centroids,
    );
    return summary.join(" ");
  }

  predictBatch(note) {
    const { sentences, processedSentences } = preprocessNote(note);
    const tfidf = getTFIDF(processedSentences);
    const sentenceVectors = this.vectorizeSentences(processedSentences, tfidf);

    let { centroids: centroidsShort, assignments: assignmentsShort } =
      this.kmeans(sentenceVectors, 6);
    const summaryShort = this.extractSummary(
      sentences,
      sentenceVectors,
      assignmentsShort,
      centroidsShort,
    );

    let { centroids: centroidsMedium, assignments: assignmentsMedium } =
      this.kmeans(sentenceVectors, 10);
    const summaryMedium = this.extractSummary(
      sentences,
      sentenceVectors,
      assignmentsMedium,
      centroidsMedium,
    );

    let { centroids: centroidsLong, assignments: assignmentsLong } =
      this.kmeans(sentenceVectors, 14);
    const summaryLong = this.extractSummary(
      sentences,
      sentenceVectors,
      assignmentsLong,
      centroidsLong,
    );

    return {
      summaryShort: summaryShort.join(" "),
      summaryMedium: summaryMedium.join(" "),
      summaryLong: summaryLong.join(" "),
    };
  }

  vectorizeSentences(processedSentences, tfidf) {
    const allWords = [...new Set(processedSentences.flat())];
    const sentenceVectors = tfidf.map((sentenceTfidf) =>
      allWords.map((word) => sentenceTfidf[word] || 0),
    );
    return sentenceVectors;
  }

  initializeCentroids(sentenceVectors, k) {
    logger.info("KMeans Clustering: Initializing centroids");
    const centroids = [];
    const usedIndexes = new Set();
    while (centroids.length < k) {
      const randomIndex = Math.floor(Math.random() * sentenceVectors.length);
      if (!usedIndexes.has(randomIndex)) {
        centroids.push(sentenceVectors[randomIndex]);
        usedIndexes.add(randomIndex);
      }
    }
    return centroids;
  }

  assignClusters(sentenceVectors, centroids) {
    logger.info("KMeans Clustering: Assigning vectors to centroids");
    return sentenceVectors.map((vector) => {
      let minDistance = Infinity;
      let closestCentroid = -1;
      centroids.forEach((centroid, index) => {
        const distance = math.distance(vector, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      return closestCentroid;
    });
  }

  updateCentroids(sentenceVectors, assignments, k) {
    const newCentroids = Array.from({ length: k }, () =>
      Array(sentenceVectors[0].length).fill(0),
    );
    const counts = Array(k).fill(0);

    sentenceVectors.forEach((vector, index) => {
      const cluster = assignments[index];
      counts[cluster] += 1;
      vector.forEach((value, dim) => {
        newCentroids[cluster][dim] += value;
      });
    });

    return newCentroids.map((centroid, index) =>
      centroid.map((value) => value / counts[index]),
    );
  }

  hasConverged(oldCentroids, newCentroids, threshold = 0.001) {
    for (let i = 0; i < oldCentroids.length; i++) {
      if (math.distance(oldCentroids[i], newCentroids[i]) > threshold) {
        return false;
      }
    }
    return true;
  }

  kmeans(sentenceVectors, k, maxIterations = 1000) {
    logger.info("KMeans Clustering: Start clustering");
    let centroids = this.initializeCentroids(sentenceVectors, k);
    let assignments = this.assignClusters(sentenceVectors, centroids);

    for (let i = 0; i < maxIterations; i++) {
      const newCentroids = this.updateCentroids(
        sentenceVectors,
        assignments,
        k,
      );
      if (this.hasConverged(centroids, newCentroids)) break;
      centroids = newCentroids;
      assignments = this.assignClusters(sentenceVectors, centroids);
    }

    return { centroids, assignments };
  }

  extractSummary(tokenizedSentences, sentenceVectors, assignments, centroids) {
    logger.info("KMeans Clustering: Creating a summary");
    const summary = [];
    const clusters = Array.from({ length: centroids.length }, () => []);

    sentenceVectors.forEach((vector, index) => {
      const cluster = assignments[index];
      clusters[cluster].push({ vector, sentence: tokenizedSentences[index] });
    });

    clusters.forEach((cluster) => {
      let minDistance = Infinity;
      let representativeSentence = "";
      cluster.forEach(({ vector, sentence }) => {
        const distance = math.distance(
          vector,
          centroids[clusters.indexOf(cluster)],
        );
        if (distance < minDistance) {
          minDistance = distance;
          representativeSentence = sentence;
        }
      });
      summary.push(representativeSentence);
    });

    return summary;
  }
}
