export interface ClinicSettings {
  name: string
  address: string
  phone: string
  email: string
  gst: string
  openTime: string
  closeTime: string
  website: string
}

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  name: 'Kairali Ayurvedic Centre',
  address: '3056 P, Sector 46, Gurgaon 122033',
  phone: '+91 8800661733',
  email: 'gurgaon@kairalicentres.com',
  gst: '32AABCK0123A1Z5',
  openTime: '08:00',
  closeTime: '20:00',
  website: 'https://www.kairalicentres.com',
}
