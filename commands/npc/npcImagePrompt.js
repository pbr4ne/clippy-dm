function buildNpcImagePrompt({ gender, age, hairText, beard, eyesText, trait }) {
  const lines = [
    `Portrait of a ${age}-year-old ${gender}.`,
    `Hair: ${hairText}.`,
    beard ? `Beard: ${beard}.` : null,
    `Eyes: ${eyesText}.`,
    `Notable trait: ${trait}.`,
    `Clothing: appropriate for a resident of Barovia.`,
    `Medium: ink and watercolour, neutral background, waist-up, realistic proportions.`,
  ].filter(Boolean);

  return lines.join(' ');
}

module.exports = {
  buildNpcImagePrompt
};
