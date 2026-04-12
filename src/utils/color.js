function hueToHex(h) {
  // 1. Define HSL values (S=100%, L=50% for pure hue)
  const s = 100;
  const l = 50;

  // 2. Convert HSL to RGB
  const l_fraction = l / 100;
  const a = (s * Math.min(l_fraction, 1 - l_fraction)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l_fraction - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  // 3. Return as Hex string
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex) {
  // 1. Remove hash and expand shorthand hex (e.g., #f00 -> #ff0000)
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // 2. Parse hex to RGB decimals (0-255)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // 3. Find min/max values for HSL formula
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  // 4. Calculate Hue based on which RGB channel is dominant
  if (delta === 0) {
    h = 0; // Achromatic (gray/black/white)
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  // 5. Convert to degrees (0-360)
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return h;
}

export { hexToHue, hueToHex };
