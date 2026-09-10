import batteryImage from '../assets/battery-safety.jpg';
import facilityImage from '../assets/circular-facility.jpg';
import recoveryImage from '../assets/material-recovery.jpg';
import devicesImage from '../assets/responsible-devices.jpg';
import heroImage from '../assets/hero-circular-economy.jpg';

export type NewsCategory = 'Policy & Cities' | 'Battery Safety' | 'Material Recovery' | 'Responsible Disposal' | 'People & Work' | 'Circular Economy';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  date: string;
  image: string;
  imageAlt: string;
  readingTime: string;
}

export const newsDemoNotice = 'Local editorial demo content created for the Re-Circuit hackathon experience. It is not a live news feed.';

export const newsArticles: NewsArticle[] = [
  {
    id: 'indias-growing-ewaste-challenge',
    title: 'Why India’s growing e-waste challenge needs visible local hand-offs',
    summary: 'Collection becomes more trustworthy when households, independent collectors and formal facilities can see the same journey.',
    content: [
      'Electronic products change hands many times before their materials are recovered. The difficult part is often not willingness to recycle, but knowing who will collect an item, what it is worth and where it will go next.',
      'A local traceability layer can make those hand-offs legible. A source records an item, a collector confirms pickup, and an authorized recycler acknowledges the resulting lot. Each role sees the information relevant to its decision.',
      'Re-Circuit presents this as a demonstration workflow. The opportunity is to make responsible disposal feel as understandable and convenient as any modern delivery experience.',
    ],
    category: 'Policy & Cities', date: '2026-08-28', image: devicesImage, imageAlt: 'Used phones and electronics organized for responsible collection', readingTime: '4 min read',
  },
  {
    id: 'lithium-battery-safety-chain',
    title: 'Lithium battery safety starts before the recycling facility',
    summary: 'Simple choices during storage, pickup and transport can reduce risk for households and collection workers.',
    content: [
      'A battery that is swollen, punctured, unusually hot or leaking should be treated differently from an ordinary device. It should be kept away from heat and conductive objects and handled by trained people.',
      'Collection interfaces can help by asking clear safety questions before a pickup is accepted. That gives the collector time to prepare suitable containment and prevents damaged batteries from being mixed into an ordinary load.',
      'Digital guidance cannot replace professional assessment. It can, however, place the right warning at the moment a user decides what to do next.',
    ],
    category: 'Battery Safety', date: '2026-08-22', image: batteryImage, imageAlt: 'Gloved technician sorting batteries into safe trays', readingTime: '3 min read',
  },
  {
    id: 'recovering-metals-from-electronics',
    title: 'The quiet value inside circuit boards, cables and motors',
    summary: 'Better sorting helps formal recyclers recover useful fractions while managing hazardous material more safely.',
    content: [
      'Electronics combine many materials in a small space. Copper wiring, circuit boards, steel, aluminium and engineering plastics each need a different recovery path.',
      'When collectors maintain categories and weights in a digital lot, recyclers receive a clearer picture before transport. That can support safer planning and more transparent commercial decisions.',
      'Recovery is only one part of circularity. Repair and reuse should come first whenever a product can remain useful; formal recycling is essential when it can no longer do so.',
    ],
    category: 'Material Recovery', date: '2026-08-15', image: recoveryImage, imageAlt: 'Recovered copper and circuit boards arranged in a recycling lab', readingTime: '5 min read',
  },
  {
    id: 'responsible-smartphone-disposal',
    title: 'A practical checklist before handing over an old smartphone',
    summary: 'Back up, sign out, remove removable storage, reset the device and disclose any damaged battery.',
    content: [
      'Start by saving the photos, contacts and files you want to keep. Sign out of device accounts and remove SIM or memory cards before completing the manufacturer’s recommended reset process.',
      'Inspect the phone for battery swelling, heat or physical damage. Tell the collector about any safety issue in advance rather than concealing it inside packaging.',
      'Finally, ask for a traceable receipt or transaction reference. It provides a useful record that the device entered a responsible collection route.',
    ],
    category: 'Responsible Disposal', date: '2026-08-07', image: devicesImage, imageAlt: 'Smartphones arranged neatly before collection', readingTime: '3 min read',
  },
  {
    id: 'formal-and-informal-recycling',
    title: 'Connecting independent collectors with safer formal recycling',
    summary: 'A fair transition should recognize collection expertise while improving access to authorized downstream facilities.',
    content: [
      'Independent collectors already provide convenient neighbourhood collection in many cities. Their knowledge and relationships are an important part of any practical e-waste solution.',
      'Digital lots can help aggregate smaller pickups into batches that formal facilities can evaluate. Clear weights, categories and hand-off records create a common language across the chain.',
      'The goal is not to erase existing livelihoods. It is to make safer routes, fairer offers and formal recycler access easier to reach.',
    ],
    category: 'People & Work', date: '2026-07-30', image: heroImage, imageAlt: 'People collaborating in an authorized electronics recycling facility', readingTime: '5 min read',
  },
  {
    id: 'circular-economy-opportunity',
    title: 'Designing a circular economy around the second life of electronics',
    summary: 'Traceability can connect reuse, collection and material recovery into one understandable system.',
    content: [
      'Circularity begins by keeping a useful product in service. Repair, refurbishment and responsible resale preserve more of the energy and work already embodied in a device.',
      'When reuse is no longer appropriate, collection and recycling should preserve material value while containing hazardous fractions. That requires collaboration rather than isolated actions.',
      'Re-Circuit’s three-part model gives sources, collectors and recyclers equal visibility. It demonstrates how a shared transaction trail can support a more circular local market.',
    ],
    category: 'Circular Economy', date: '2026-07-21', image: facilityImage, imageAlt: 'Organized circular electronics sorting facility', readingTime: '4 min read',
  },
];

export const newsCategories = ['All', ...Array.from(new Set(newsArticles.map((article) => article.category)))] as const;

export const findNewsArticle = (id: string): NewsArticle | undefined => newsArticles.find((article) => article.id === id);
