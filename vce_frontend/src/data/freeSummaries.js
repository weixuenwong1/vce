const fullyFreeSummaries = new Set([
  'physics/motion-and-energy/newton-s-laws-of-motion',
  'physics/fields/newton-s-universal-law-of-gravitation',
  'chemistry/supplying-energy/carbon-based-fuels',
  'chemistry/rate-and-yield/rates-of-chemical-reactions',
  'biology/proteins-and-nucleic-acids/nucleic-acids-and-proteins',
  'biology/biochemical-pathways/photosynthesis',
]);

export function isFullyFreeSummary(subject, chapterSlug, topicSlug) {
  return fullyFreeSummaries.has(
    `${subject?.toLowerCase()}/${chapterSlug}/${topicSlug}`,
  );
}
