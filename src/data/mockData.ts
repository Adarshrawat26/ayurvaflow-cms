// Kairali-aligned mock data

export const THERAPIES = [
  'Abhyangam',
  'Shirodhara',
  'Pizhichil',
  'Navarakizhi',
  'Elakizhi',
  'Udhwarthanam',
  'Kadikizhi',
  'Nasyam',
  'Basti',
  'Panchakarma',
  'Rasayana',
  'Veda Diet Program',
]

export const CONDITIONS = [
  'Weight Management',
  'Pain Management',
  'Skin Disorders',
  'Panchakarma / Detox',
  'Hypertension',
  'Infertility',
  'Stress & Anxiety',
  'Neurological Disorders',
  'Rejuvenation',
  'General Wellness',
]

export const PRAKRITI_TYPES = [
  'Vata', 'Pitta', 'Kapha',
  'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha',
]

export const DOCTORS = [
  { id: 'D001', name: 'Dr. Arathi Menon', specialization: 'Panchakarma & Detox', experience: 14, patients: 132, rating: 4.9 },
  { id: 'D002', name: 'Dr. Manjusha Mohan', specialization: 'Skin Disorders & Rasayana', experience: 11, patients: 108, rating: 4.8 },
  { id: 'D003', name: 'Dr. Pratibha Nair', specialization: 'Neurological & Pain Management', experience: 9, patients: 84, rating: 4.7 },
]

export interface StaffMember {
  id: string
  name: string
  role: 'doctor' | 'receptionist' | 'therapist' | 'admin'
  specialization: string
  experience: number
  phone: string
  email: string
  status: 'active' | 'inactive'
  joinDate: string
}

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'S001', name: 'Vikram Nair', role: 'admin', specialization: 'Administration', experience: 8, phone: '9876540001', email: 'admin@kairali.com', status: 'active', joinDate: '2018-04-01' },
  { id: 'S002', name: 'Deepa Pillai', role: 'receptionist', specialization: 'Front Desk', experience: 4, phone: '9876540002', email: 'reception@kairali.com', status: 'active', joinDate: '2021-06-15' },
  { id: 'S003', name: 'Dr. Arathi Menon', role: 'doctor', specialization: 'Panchakarma & Detox', experience: 14, phone: '9876540003', email: 'arathi@kairali.com', status: 'active', joinDate: '2016-01-10' },
  { id: 'S004', name: 'Dr. Manjusha Mohan', role: 'doctor', specialization: 'Skin Disorders & Rasayana', experience: 11, phone: '9876540004', email: 'manjusha@kairali.com', status: 'active', joinDate: '2017-03-20' },
  { id: 'S005', name: 'Dr. Pratibha Nair', role: 'doctor', specialization: 'Neurological & Pain Management', experience: 9, phone: '9876540005', email: 'pratibha@kairali.com', status: 'active', joinDate: '2019-07-01' },
  { id: 'S006', name: 'Arun Krishnan', role: 'therapist', specialization: 'Abhyangam & Shirodhara', experience: 6, phone: '9876540006', email: 'arun@kairali.com', status: 'active', joinDate: '2020-02-14' },
  { id: 'S007', name: 'Sujatha Varma', role: 'therapist', specialization: 'Pizhichil & Navarakizhi', experience: 7, phone: '9876540007', email: 'sujatha@kairali.com', status: 'active', joinDate: '2019-11-01' },
]

export const PATIENTS = [
  { id: 'P001', name: 'Priya Sharma', age: 34, gender: 'F', phone: '9876543210', email: 'priya@email.com', city: 'Mumbai', referral: 'Online', purpose: 'Stress & Anxiety', prakriti: 'Vata', status: 'active', lastVisit: '2024-01-10', balance: 0, occupation: 'Software Engineer', nationality: 'Indian' },
  { id: 'P002', name: 'Raj Mehta', age: 45, gender: 'M', phone: '9876543211', email: 'raj@email.com', city: 'Delhi', referral: 'Doctor Referral', purpose: 'Pain Management', prakriti: 'Pitta', status: 'active', lastVisit: '2024-01-09', balance: 26700, occupation: 'Business Owner', nationality: 'Indian' },
  { id: 'P003', name: 'Anita Nair', age: 28, gender: 'F', phone: '9876543212', email: 'anita@email.com', city: 'Kochi', referral: 'Online', purpose: 'Skin Disorders', prakriti: 'Pitta-Kapha', status: 'active', lastVisit: '2024-01-08', balance: 0, occupation: 'Teacher', nationality: 'Indian' },
  { id: 'P004', name: 'James Wilson', age: 52, gender: 'M', phone: '9876543213', email: 'james@email.com', city: 'Bangalore', referral: 'Friend / Family', purpose: 'Panchakarma / Detox', prakriti: 'Vata-Pitta', status: 'active', lastVisit: '2024-01-07', balance: 0, occupation: 'Consultant', nationality: 'British' },
  { id: 'P005', name: 'Meera Pillai', age: 39, gender: 'F', phone: '9876543214', email: 'meera@email.com', city: 'Chennai', referral: 'Doctor Referral', purpose: 'Hypertension', prakriti: 'Pitta', status: 'completed', lastVisit: '2023-12-20', balance: 0, occupation: 'Doctor', nationality: 'Indian' },
  { id: 'P006', name: 'David Chen', age: 41, gender: 'M', phone: '9876543215', email: 'david@email.com', city: 'Hyderabad', referral: 'Online', purpose: 'Weight Management', prakriti: 'Kapha', status: 'active', lastVisit: '2024-01-06', balance: 13276, occupation: 'Engineer', nationality: 'Singaporean' },
  { id: 'P007', name: 'Kavya Reddy', age: 31, gender: 'F', phone: '9876543216', email: 'kavya@email.com', city: 'Pune', referral: 'Walk-in', purpose: 'Pain Management', prakriti: 'Vata', status: 'active', lastVisit: '2024-01-05', balance: 0, occupation: 'Architect', nationality: 'Indian' },
  { id: 'P008', name: 'Ahmed Al-Rashid', age: 55, gender: 'M', phone: '9876543217', email: 'ahmed@email.com', city: 'Goa', referral: 'Travel Agent', purpose: 'Rejuvenation', prakriti: 'Pitta-Kapha', status: 'active', lastVisit: '2024-01-04', balance: 100300, occupation: 'Executive', nationality: 'UAE' },
]

export const APPOINTMENTS = [
  { id: 'A001', patientId: 'P001', patient: 'Priya Sharma', doctor: 'Dr. Arathi Menon', date: '2024-01-11', time: '09:00', type: 'Consultation', status: 'scheduled', duration: 45 },
  { id: 'A002', patientId: 'P002', patient: 'Raj Mehta', doctor: 'Dr. Pratibha Nair', date: '2024-01-11', time: '10:00', type: 'Elakizhi', status: 'arrived', duration: 60 },
  { id: 'A003', patientId: 'P003', patient: 'Anita Nair', doctor: 'Dr. Manjusha Mohan', date: '2024-01-11', time: '11:00', type: 'Follow-up', status: 'in_progress', duration: 45 },
  { id: 'A004', patientId: 'P004', patient: 'James Wilson', doctor: 'Dr. Arathi Menon', date: '2024-01-11', time: '12:00', type: 'Panchakarma', status: 'completed', duration: 90 },
  { id: 'A005', patientId: 'P005', patient: 'Meera Pillai', doctor: 'Dr. Manjusha Mohan', date: '2024-01-11', time: '14:00', type: 'Consultation', status: 'scheduled', duration: 45 },
  { id: 'A006', patientId: 'P006', patient: 'David Chen', doctor: 'Dr. Arathi Menon', date: '2024-01-12', time: '09:30', type: 'Udhwarthanam', status: 'scheduled', duration: 60 },
  { id: 'A007', patientId: 'P007', patient: 'Kavya Reddy', doctor: 'Dr. Pratibha Nair', date: '2024-01-12', time: '10:30', type: 'Navarakizhi', status: 'scheduled', duration: 60 },
  { id: 'A008', patientId: 'P008', patient: 'Ahmed Al-Rashid', doctor: 'Dr. Arathi Menon', date: '2024-01-12', time: '11:30', type: 'Pizhichil', status: 'scheduled', duration: 90 },
]

export const TREATMENTS = [
  { id: 'T001', patientId: 'P001', patient: 'Priya Sharma', type: 'Shirodhara', condition: 'Stress & Anxiety', totalSessions: 14, completedSessions: 8, startDate: '2024-01-01', endDate: '2024-01-21', doctor: 'Dr. Arathi Menon', status: 'active', cost: 28000 },
  { id: 'T002', patientId: 'P002', patient: 'Raj Mehta', type: 'Panchakarma', condition: 'Pain Management', totalSessions: 21, completedSessions: 12, startDate: '2023-12-20', endDate: '2024-01-20', doctor: 'Dr. Pratibha Nair', status: 'active', cost: 65000 },
  { id: 'T003', patientId: 'P003', patient: 'Anita Nair', type: 'Nasyam', condition: 'Skin Disorders', totalSessions: 7, completedSessions: 3, startDate: '2024-01-05', endDate: '2024-01-15', doctor: 'Dr. Manjusha Mohan', status: 'active', cost: 18000 },
  { id: 'T004', patientId: 'P004', patient: 'James Wilson', type: 'Pizhichil', condition: 'Panchakarma / Detox', totalSessions: 10, completedSessions: 10, startDate: '2023-12-01', endDate: '2023-12-15', doctor: 'Dr. Arathi Menon', status: 'completed', cost: 42000 },
  { id: 'T005', patientId: 'P008', patient: 'Ahmed Al-Rashid', type: 'Rasayana', condition: 'Rejuvenation', totalSessions: 28, completedSessions: 5, startDate: '2024-01-08', endDate: '2024-02-10', doctor: 'Dr. Manjusha Mohan', status: 'active', cost: 85000 },
  { id: 'T006', patientId: 'P006', patient: 'David Chen', type: 'Veda Diet Program', condition: 'Weight Management', totalSessions: 30, completedSessions: 6, startDate: '2024-01-06', endDate: '2024-02-15', doctor: 'Dr. Arathi Menon', status: 'active', cost: 35000 },
]

export const INVOICES = [
  { id: 'INV001', patientId: 'P001', patient: 'Priya Sharma', date: '2024-01-10', items: [{ desc: 'Shirodhara (8 sessions)', qty: 8, rate: 2000, amount: 16000 }, { desc: 'Herbal Medicines', qty: 1, rate: 3500, amount: 3500 }], subtotal: 19500, tax: 3510, total: 23010, paid: 23010, status: 'paid' },
  { id: 'INV002', patientId: 'P002', patient: 'Raj Mehta', date: '2024-01-09', items: [{ desc: 'Panchakarma Package (21 sessions)', qty: 1, rate: 65000, amount: 65000 }], subtotal: 65000, tax: 11700, total: 76700, paid: 50000, status: 'partial' },
  { id: 'INV003', patientId: 'P004', patient: 'James Wilson', date: '2024-01-07', items: [{ desc: 'Pizhichil (10 sessions)', qty: 10, rate: 4200, amount: 42000 }, { desc: 'Initial Consultation', qty: 1, rate: 1500, amount: 1500 }], subtotal: 43500, tax: 7830, total: 51330, paid: 51330, status: 'paid' },
  { id: 'INV004', patientId: 'P008', patient: 'Ahmed Al-Rashid', date: '2024-01-08', items: [{ desc: 'Rasayana Programme (28 sessions)', qty: 1, rate: 85000, amount: 85000 }], subtotal: 85000, tax: 15300, total: 100300, paid: 0, status: 'unpaid' },
  { id: 'INV005', patientId: 'P006', patient: 'David Chen', date: '2024-01-06', items: [{ desc: 'Veda Diet Program', qty: 1, rate: 15000, amount: 15000 }, { desc: 'Udhwarthanam (6 sessions)', qty: 6, rate: 2200, amount: 13200 }], subtotal: 28200, tax: 5076, total: 33276, paid: 20000, status: 'partial' },
]

export const REVENUE_DATA = [
  { month: 'Aug', revenue: 285000 },
  { month: 'Sep', revenue: 312000 },
  { month: 'Oct', revenue: 298000 },
  { month: 'Nov', revenue: 345000 },
  { month: 'Dec', revenue: 389000 },
  { month: 'Jan', revenue: 421000 },
]

/** @deprecated Use TREATMENT_PACKAGES from ./packages */
export { TREATMENT_PACKAGES as PACKAGES } from './packages'
