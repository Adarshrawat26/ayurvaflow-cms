export interface TreatmentPackage {
  id: string
  name: string
  duration: string
  durationDays: number
  totalSessions: number
  price: number
  description: string
  therapies: string[]
  conditionHint: string
  highlight?: string
}

export const TREATMENT_PACKAGES: TreatmentPackage[] = [
  {
    id: 'PKG001',
    name: 'Panchakarma Complete',
    duration: '21 days',
    durationDays: 21,
    totalSessions: 21,
    price: 65000,
    description: 'Full body detoxification — root-cause cleansing of accumulated toxins (Ama)',
    therapies: ['Panchakarma', 'Basti', 'Virechana', 'Nasya'],
    conditionHint: 'Detox / Panchakarma',
    highlight: 'Most popular',
  },
  {
    id: 'PKG002',
    name: 'Rasayana Rejuvenation',
    duration: '28 days',
    durationDays: 28,
    totalSessions: 28,
    price: 85000,
    description: 'Anti-ageing and immunity-building programme using classical Kerala herbs',
    therapies: ['Rasayana', 'Abhyangam', 'Shirodhara', 'Herbal medicines'],
    conditionHint: 'Rejuvenation / Rasayana',
  },
  {
    id: 'PKG003',
    name: 'Veda Diet Programme',
    duration: '30 days',
    durationDays: 30,
    totalSessions: 30,
    price: 35000,
    description: 'Customised Ayurvedic nutrition plan targeting weight management through Prakriti analysis',
    therapies: ['Diet counselling', 'Udhwarthanam', 'Follow-up reviews'],
    conditionHint: 'Weight management',
  },
  {
    id: 'PKG004',
    name: 'Pain & Neuro Care',
    duration: '14 days',
    durationDays: 14,
    totalSessions: 14,
    price: 48000,
    description: 'Elakizhi + Navarakizhi + Basti protocol for chronic pain and neurological conditions',
    therapies: ['Elakizhi', 'Navarakizhi', 'Basti', 'Pizhichil'],
    conditionHint: 'Pain management',
  },
  {
    id: 'PKG005',
    name: 'Skin Renewal',
    duration: '7 days',
    durationDays: 7,
    totalSessions: 7,
    price: 22000,
    description: 'Nasyam + herbal therapy for skin disorders — addresses root cause, not symptoms',
    therapies: ['Nasyam', 'Manjusha therapy', 'Lepam'],
    conditionHint: 'Skin disorders',
  },
  {
    id: 'PKG006',
    name: 'Abhyangam Wellness',
    duration: 'Per session',
    durationDays: 1,
    totalSessions: 1,
    price: 2000,
    description: 'Signature Kerala full-body oil massage. Book single sessions or build a custom series.',
    therapies: ['Abhyangam'],
    conditionHint: 'General wellness / stress relief',
  },
]
