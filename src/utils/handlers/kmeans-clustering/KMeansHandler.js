import { AIHandler } from "../../base";
import { preprocessNote } from  "../../helpers/preprocessNote";
const natural = require('natural');

export class KMeansClustering extends AIHandler {

    describe() {
        return `
        KMeans Clustering
        `;
    }

    predict(note, topN=6) {
        const { sentences, processedSentences } = preprocessNote(note);
        
    }


}