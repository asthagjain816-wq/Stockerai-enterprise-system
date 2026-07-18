// Offline Barcode Generator (Code 39 format)
const CODE39_ALPHABET = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101'
};

export function getBarcodeSVG(text) {
  // Normalize text: Code 39 requires uppercase alphanumeric
  let raw = String(text).toUpperCase();
  let clean = '';
  for (let i = 0; i < raw.length; i++) {
    if (CODE39_ALPHABET[raw[i]]) {
      clean += raw[i];
    }
  }
  
  if (clean.length === 0) clean = 'SKU';
  
  // Wrap with start/stop character *
  const finalString = `*${clean}*`;
  
  // Build binary sequence
  let bits = '';
  for (let i = 0; i < finalString.length; i++) {
    bits += CODE39_ALPHABET[finalString[i]] + '0'; // '0' is gap between characters
  }
  
  // Construct SVG rects
  const barWidth = 2;
  const height = 65;
  const padding = 10;
  const totalWidth = bits.length * barWidth + padding * 2;
  
  let rects = [];
  let currentX = padding;
  
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      rects.push(`<rect x="${currentX}" y="5" width="${barWidth}" height="${height}" fill="black" />`);
    }
    currentX += barWidth;
  }
  
  return `
    <svg width="100%" height="90" viewBox="0 0 ${totalWidth} 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" />
      ${rects.join('\n')}
      <text x="${totalWidth / 2}" y="82" font-family="monospace" font-size="11" font-weight="bold" fill="black" text-anchor="middle">${clean}</text>
    </svg>
  `;
}
