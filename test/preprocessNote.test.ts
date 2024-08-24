import { preprocessNote } from '../src/utils/helpers/preprocessNote';

describe('preprocessNote', () => {
  it('should tokenize and process a note correctly', () => {
    const note = "This is a simple note. It has two sentences!";
    const { sentences, processedSentences } = preprocessNote(note);

    expect(sentences).toEqual(["This is a simple note.", "It has two sentences!"]);
    expect(processedSentences).toEqual([
      ["simple", "note"],
      ["two", "sentences"]
    ]);
  });

  it('should remove stopwords and non-alphabetical characters', () => {
    const note = "This is a cool sentence. This is the best plugin ever!";
    const { sentences, processedSentences } = preprocessNote(note);

    expect(sentences).toEqual(["This is a cool sentence.", "This is the best plugin ever!"]);
    expect(processedSentences).toEqual([
      ["cool", "sentence"],
      ["best", "plugin", "ever"]
    ]);
  });
});
