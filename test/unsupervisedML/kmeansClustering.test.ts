import { KMeansClustering } from '../../src/utils/handlers/kmeans-clustering/KMeansHandler';

describe('KMeansClustering', () => {
  const handler = new KMeansClustering();

  it('should predict and cluster sentences correctly', async () => {
    const note = `
    The tiger (Panthera tigris) is the largest living cat species and a member of the genus Panthera native to Asia. It has a powerful, muscular body with a large head and paws, a long tail, and orange fur with black, mostly vertical stripes. It is traditionally classified into nine recent subspecies, though some recognise only two subspecies, mainland Asian tigers and island tigers of the Sunda Islands. The tiger has a typical felid morphology; its body is muscular with shortened legs, strong forelimbs, broad paws, a large head and a tail that is about half the length of the rest of its body.
There are five digits on the front feet and four on the back, all of which have retractile claws that are compact and curved. The tiger is the largest living felid species, with the Siberian and Bengal tigers being the largest. Bengal tigers average a total length of 3 m (9.8 ft), with males weighing 200–260 kg (440–570 lb) and females weighing 100–160 kg (220–350 lb). Island tigers are the smallest; the Sumatran tiger has a total length of 2.2–2.5 m (7 ft 3 in – 8 ft 2 in) with a weight of 100–140 kg (220–310 lb) for males and 75–110 kg (165–243 lb) for females. The extinct Bali tiger was even smaller. It has been hypothesised that body sizes of different tiger populations may be correlated with climate and be explained by thermoregulation and Bergmann's rule.
    `;
    const summary = await handler.predict(note, 3);

    expect(summary).toEqual(expect.any(String));
  });
});
