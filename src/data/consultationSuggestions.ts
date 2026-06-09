export type SuggestionPlan = {
  therapy: string
  sessions: string
  medicines: string[]
  pathya: string[]
  apathya: string[]
  lifestyle: string[]
  followUp: string
}

export const ASSESSMENT_SUGGESTIONS = {
  pulse: [
    'Vata-dominant — thin, irregular, snake-like',
    'Pitta-dominant — moderate, jumping, frog-like',
    'Kapha-dominant — slow, steady, swan-like',
    'Vata-Pitta — fast with heat signs',
    'Weak & depleted — low vitality',
  ],
  tongue: [
    'Dry, cracked — Vata aggravation',
    'Red tip, coated middle — Pitta imbalance',
    'Thick white coating — Kapha / Ama',
    'Pale, scalloped edges — digestive weakness',
    'Clean, pink, moist — balanced state',
  ],
  eyes: [
    'Dry, restless — Vata',
    'Red, burning — Pitta',
    'Dull, watery — Kapha',
    'Yellowish sclera — Pitta / liver involvement',
    'Clear, bright — balanced',
  ],
  skin: [
    'Dry, rough, cool — Vata',
    'Warm, oily, sensitive — Pitta',
    'Thick, cool, pale — Kapha',
    'Patchy dryness with redness — Vata-Pitta',
    'Smooth with good lustre — balanced',
  ],
} as const

export const PRAKRITI_PATHYA: Record<string, { pathya: string[]; apathya: string[]; lifestyle: string[] }> = {
  Vata: {
    pathya: ['Warm cooked meals', 'Sesame & ghee', 'Root vegetables', 'Sweet fruits (ripe)', 'Ginger tea'],
    apathya: ['Cold & raw foods', 'Dry snacks', 'Excessive fasting', 'Bitter greens alone', 'Carbonated drinks'],
    lifestyle: ['Regular sleep by 10 PM', 'Gentle oil massage (Abhyanga)', 'Light yoga & pranayama', 'Warm baths', 'Avoid overstimulation'],
  },
  Pitta: {
    pathya: ['Cooling foods', 'Coconut water', 'Sweet fruits', 'Leafy greens', 'Barley & rice'],
    apathya: ['Spicy & fried foods', 'Alcohol', 'Sour ferments', 'Excess salt', 'Midday sun exposure'],
    lifestyle: ['Moonlight walks', 'Sheetali pranayama', 'Moderate exercise before noon', 'Cool showers', 'Stress-free schedule'],
  },
  Kapha: {
    pathya: ['Light warm meals', 'Honey (in warm water)', 'Legumes & millets', 'Pungent spices', 'Steamed vegetables'],
    apathya: ['Heavy dairy', 'Cold desserts', 'Daytime naps', 'Excess sweets', 'Fried & oily foods'],
    lifestyle: ['Early morning exercise', 'Dry brushing', 'Active yoga (Surya Namaskar)', 'Avoid sedentary routine', 'Wake before 6 AM'],
  },
  'Vata-Pitta': {
    pathya: ['Warm, mildly spiced meals', 'Ghee in moderation', 'Sweet & bitter tastes', 'Cooked grains', 'Room-temperature water'],
    apathya: ['Very hot spices', 'Ice-cold drinks', 'Skipping meals', 'Late nights', 'Excess screen time'],
    lifestyle: ['Consistent meal times', 'Gentle morning walk', 'Alternate nostril breathing', 'Oil massage 2× weekly', 'Structured daily routine'],
  },
  'Pitta-Kapha': {
    pathya: ['Light, warm, spiced foods', 'Bitter greens', 'Millets & barley', 'Warm herbal teas', 'Seasonal vegetables'],
    apathya: ['Heavy oily meals', 'Excess dairy', 'Cold foods', 'Overeating', 'Sedentary afternoons'],
    lifestyle: ['Morning activity', 'Avoid daytime sleep', 'Moderate exercise', 'Regular detox teas', 'Evening wind-down routine'],
  },
  'Vata-Kapha': {
    pathya: ['Warm, light, digestible meals', 'Ginger & cumin', 'Steamed vegetables', 'Warm soups', 'Small frequent meals'],
    apathya: ['Cold & heavy combos', 'Raw salads', 'Excess cheese', 'Irregular eating', 'Overeating at night'],
    lifestyle: ['Daily movement', 'Warm oil massage', 'Light fasting (if advised)', 'Regular sleep cycle', 'Dry heat therapy'],
  },
  Tridosha: {
    pathya: ['Seasonal, freshly cooked meals', 'All six tastes in balance', 'Whole grains', 'Seasonal fruits', 'Herbal teas per season'],
    apathya: ['Processed foods', 'Opposite-quality meals', 'Irregular routine', 'Excess of any one taste', 'Stale leftovers'],
    lifestyle: ['Dinacharya (daily routine)', 'Seasonal regimen (Ritucharya)', 'Moderate exercise', 'Mindful eating', 'Regular Panchakarma review'],
  },
}

export const CONDITION_PLANS: Record<string, SuggestionPlan> = {
  'Stress & Anxiety': {
    therapy: 'Shirodhara',
    sessions: '14',
    medicines: ['Brahmi Ghrita', 'Ashwagandha churna', 'Jatamansi tablets'],
    pathya: ['Warm milk with nutmeg', 'Cooked vegetables', 'Basmati rice', 'Almonds (soaked)'],
    apathya: ['Caffeine', 'Late nights', 'Excess news / screens', 'Spicy food'],
    lifestyle: ['Shirodhara 3× weekly', 'Nadi Shodhana pranayama', 'Oil foot massage before sleep', 'Digital sunset by 9 PM'],
    followUp: '2 weeks',
  },
  'Pain Management': {
    therapy: 'Elakizhi',
    sessions: '14',
    medicines: ['Mahayograj guggulu', 'Dashmool kwath', 'Narayana tailam'],
    pathya: ['Warm soups', 'Ghee', 'Anti-inflammatory spices', 'Cooked leafy greens'],
    apathya: ['Cold exposure', 'Heavy lifting', 'Raw salads', 'Night curd'],
    lifestyle: ['Gentle stretching', 'Warm compress', 'Regular Kadikizhi / Elakizhi', 'Avoid Vata-aggravating posture'],
    followUp: '1 week',
  },
  'Skin Disorders': {
    therapy: 'Nasyam',
    sessions: '7',
    medicines: ['Manjishthadi kwath', 'Khadirarishta', 'Neem capsules'],
    pathya: ['Bitter gourd', 'Turmeric milk', 'Light khichdi', 'Coconut water'],
    apathya: ['Sour & fermented foods', 'Seafood (if Pitta dominant)', 'Excess sun', 'Synthetic cosmetics'],
    lifestyle: ['Herbal face packs', 'Blood-purifying diet', 'Stress reduction', 'Gentle sun only before 9 AM'],
    followUp: '2 weeks',
  },
  'Panchakarma / Detox': {
    therapy: 'Panchakarma',
    sessions: '21',
    medicines: ['Triphala churna', 'Gandharva tailam', 'Sukumara ghrita'],
    pathya: ['Kitchari diet', 'Warm water', 'Ghee (as prescribed)', 'Steamed vegetables'],
    apathya: ['All outside food', 'Cold drinks', 'Heavy exercise', 'Sexual activity during cleanse'],
    lifestyle: ['Full rest during peak detox', 'Steam & oil therapies', 'Meditation', 'Early sleep'],
    followUp: '4 weeks',
  },
  'Weight Management': {
    therapy: 'Udhwarthanam',
    sessions: '21',
    medicines: ['Triphala guggulu', 'Varanadi kwath', 'Medohar guggulu'],
    pathya: ['Millets', 'Barley water', 'Honey with warm water', 'Steamed vegetables'],
    apathya: ['Sweets', 'Fried snacks', 'Heavy dinner', 'Daytime sleep'],
    lifestyle: ['Udhwarthanam 3× weekly', 'Brisk morning walk', 'Kapalabhati (if suitable)', 'Portion control'],
    followUp: '2 weeks',
  },
  Hypertension: {
    therapy: 'Shirodhara',
    sessions: '14',
    medicines: ['Sarpagandha', 'Arjuna kwath', 'Brahmi vati'],
    pathya: ['Low-salt diet', 'Garlic (cooked)', 'Pomegranate', 'Oats & barley'],
    apathya: ['Excess salt', 'Alcohol', 'Anger triggers', 'Heavy non-veg'],
    lifestyle: ['Daily meditation', 'Gentle yoga', 'Regular BP monitoring', 'Consistent sleep'],
    followUp: '2 weeks',
  },
  'Neurological Disorders': {
    therapy: 'Navarakizhi',
    sessions: '14',
    medicines: ['Brahmi ghrita', 'Ashwagandha', 'Dhanwantharam tailam'],
    pathya: ['Warm nourishing foods', 'Ghee', 'Almond milk', 'Dates & figs'],
    apathya: ['Cold foods', 'Excess fasting', 'Overexertion', 'Late nights'],
    lifestyle: ['Navarakizhi protocol', 'Speech & motor therapy support', 'Oil therapies', 'Calm environment'],
    followUp: '2 weeks',
  },
  Rejuvenation: {
    therapy: 'Rasayana',
    sessions: '28',
    medicines: ['Chyawanprash', 'Amalaki rasayana', 'Brahma rasayana'],
    pathya: ['Seasonal fruits', 'Ghee & milk', 'Whole grains', 'Soaked nuts'],
    apathya: ['Processed food', 'Irregular meals', 'Excess travel', 'Stress overload'],
    lifestyle: ['Daily Abhyangam', 'Rasayana diet', 'Yoga & pranayama', 'Seasonal Panchakarma'],
    followUp: '4 weeks',
  },
  'General Wellness': {
    therapy: 'Abhyangam',
    sessions: '7',
    medicines: ['Triphala', 'Chyawanprash', 'Ashwagandha lehyam'],
    pathya: ['Seasonal diet', 'Warm cooked meals', 'Herbal teas', 'Fresh meals'],
    apathya: ['Junk food', 'Irregular sleep', 'Excess stimulants', 'Overeating'],
    lifestyle: ['Weekly Abhyangam', 'Morning walk', 'Pranayama', 'Balanced Dinacharya'],
    followUp: '4 weeks',
  },
}

const DEFAULT_PLAN = CONDITION_PLANS['General Wellness']

export function getPrakritiSuggestions(prakriti: string) {
  return PRAKRITI_PATHYA[prakriti] ?? PRAKRITI_PATHYA.Vata
}

export function getConditionPlan(condition: string): SuggestionPlan {
  return CONDITION_PLANS[condition] ?? DEFAULT_PLAN
}

export function formatDietAdvice(pathya: string[], apathya: string[]) {
  const include = pathya.length ? `Include: ${pathya.join(', ')}` : ''
  const avoid = apathya.length ? `Avoid: ${apathya.join(', ')}` : ''
  return [include, avoid].filter(Boolean).join('\n')
}

export function mergeChipValue(current: string, chip: string, separator = ', ') {
  const parts = current.split(separator).map(s => s.trim()).filter(Boolean)
  if (parts.includes(chip)) return current
  return parts.length ? `${current}${separator}${chip}` : chip
}
