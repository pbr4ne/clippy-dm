function toCodePoints(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    out.push(cp);
    if (cp > 0xffff) i++;
  }
  return out;
}

function filterVariationSelectors(codepoints) {
  const VS16 = 0xfe0f;
  const VS15 = 0xfe0e;
  const ZWJ = 0x200d;
  const KEYCAP = 0x20e3;

  const out = [];
  for (let i = 0; i < codepoints.length; i++) {
    const cp = codepoints[i];
    if (cp === VS16 || cp === VS15) {
      const next = codepoints[i + 1];
      if (next === ZWJ || next === KEYCAP) out.push(cp);
      continue;
    }
    out.push(cp);
  }
  return out;
}

function emojiToUrl(emoji, size = 72, cdnBase = 'https://twemoji.maxcdn.com/v/latest') {
  if (!emoji) return null;
  const cps = toCodePoints(emoji);
  const filtered = filterVariationSelectors(cps);
  const hex = filtered.map(cp => cp.toString(16)).join('-');
  return `${cdnBase}/${size}x${size}/${hex}.png`;
}

module.exports = { emojiToUrl };
