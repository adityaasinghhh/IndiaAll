export function isValidEmail(email) {
  return (
    typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function isValidPhone(phone) {
  return typeof phone === 'string' && /^[\d\s\-+()]{6,30}$/.test(phone);
}

export function sanitizeString(str, maxLength = 2000) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

// Fallback list; the live list should come from the products collection (see note below)
export const FALLBACK_COMMODITIES = [
  'crude-oil', 'gasoline', 'bitumen', 'aviation-fuel', 'diesel-en590',
  'dap', 'd6', 'lng-lpg', 'petcoke', 'sulphur', 'urea', 'npk',
  'sugar', 'soybean', 'wheat', 'olive-oil', 'corn', 'sunflower-oil',
  'indian-rice', 'lentils', 'palm-oil', 'rapeseed-oil', 'chicken', 'beef', 'pork',
  'aluminium-ingot', 'copper-cathodes', 'gold-bars', 'copper-wire-scrap',
  'coal', 'manganese', 'ubc-aluminium-scrap',
];

export function isValidCommodity(commodity, allowed = FALLBACK_COMMODITIES) {
  return typeof commodity === 'string' && allowed.includes(commodity);
}
