import { getTFIDF } from '../src/utils/helpers/constructTFIDF';

describe('getTFIDF', () => {
  it('should compute correct TF-IDF for given sentences', () => {
    const processedSentences = [
      ["this", "is", "a", "test"],
      ["this", "test", "is", "a", "test"]
    ];
    const tfidf = getTFIDF(processedSentences);

    expect(tfidf).toEqual([
      expect.objectContaining({
        "this": expect.any(Number),
        "is": expect.any(Number),
        "a": expect.any(Number),
        "test": expect.any(Number)
      }),
      expect.objectContaining({
        "this": expect.any(Number),
        "test": expect.any(Number),
        "is": expect.any(Number),
        "a": expect.any(Number)
      })
    ]);
  });
});
