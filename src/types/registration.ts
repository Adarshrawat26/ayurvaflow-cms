export type TitleOption = 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.' | 'Other'
export type KinRelation = 'father' | 'mother' | 'husband' | 'wife' | 'other'
export type SignerType = 'patient' | 'responsible'
export type HearAbout = 'website' | 'social' | 'advertisements' | 'other'
export type VisitPurpose = 'consultation' | 'maintenance' | 'preventive'

export interface KinDetails {
  relation: KinRelation
  relationOther: string
  title: TitleOption
  titleOther: string
  lastName: string
  firstName: string
  middleName: string
  contactNo: string
  emergencyContactNo: string
}

export interface OfficeUseBlock {
  diagnosis: string
  presentComplaints: string
  treatmentPrescribed: string
  doctorSignature: string
  filledAt: string
  filledBy: string
}

export interface RegistrationForm {
  regDate: string
  regSeq1: string
  regSeq2: string
  regSeq3: string
  title: TitleOption
  titleOther: string
  lastName: string
  firstName: string
  middleName: string
  dateOfBirth: string
  ageYears: string
  ageMonths: string
  gender: 'M' | 'F' | 'O'
  occupation: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  pinCode: string
  state: string
  country: string
  nationality: string
  telResStd: string
  telResNumber: string
  telOfficeStd: string
  telOfficeNumber: string
  mobile1: string
  mobile2: string
  email: string
  kin: KinDetails
  referredByLine1: string
  referredByLine2: string
  hearAbout: HearAbout[]
  hearAboutOther: string
  visitPurpose: VisitPurpose[]
  executionSignature: string
  signerType: SignerType
  consentPart1Accepted: boolean
  consentPart2Accepted: boolean
  clauseAcknowledgements: boolean[]
  previousAyurvedaTreatments: string
  knownAllergies: string
  allopathicMedications: string
  lifestyleDiseases: string
  patientSignature: string
  kairaliRepSignature: string
  kairaliRepComments: string
  officeUse: OfficeUseBlock
}

export interface PatientRegistrationRecord {
  id: string
  patientId: string
  regNumber: string
  formData: RegistrationForm
  patientSignature: string
  signerType: SignerType
  kairaliRepSignature: string
  signedAt: string
  signedByUserId: string
}

export const EMPTY_KIN: KinDetails = {
  relation: 'father',
  relationOther: '',
  title: 'Mr.',
  titleOther: '',
  lastName: '',
  firstName: '',
  middleName: '',
  contactNo: '',
  emergencyContactNo: '',
}

export const EMPTY_OFFICE_USE: OfficeUseBlock = {
  diagnosis: '',
  presentComplaints: '',
  treatmentPrescribed: '',
  doctorSignature: '',
  filledAt: '',
  filledBy: '',
}

export function emptyRegistrationForm(): RegistrationForm {
  const today = new Date().toISOString().slice(0, 10)
  return {
    regDate: today,
    regSeq1: '',
    regSeq2: '',
    regSeq3: '',
    title: 'Mr.',
    titleOther: '',
    lastName: '',
    firstName: '',
    middleName: '',
    dateOfBirth: '',
    ageYears: '',
    ageMonths: '',
    gender: 'M',
    occupation: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    pinCode: '',
    state: '',
    country: 'India',
    nationality: 'Indian',
    telResStd: '',
    telResNumber: '',
    telOfficeStd: '',
    telOfficeNumber: '',
    mobile1: '',
    mobile2: '',
    email: '',
    kin: { ...EMPTY_KIN },
    referredByLine1: '',
    referredByLine2: '',
    hearAbout: [],
    hearAboutOther: '',
    visitPurpose: [],
    executionSignature: '',
    signerType: 'patient',
    consentPart1Accepted: false,
    consentPart2Accepted: false,
    clauseAcknowledgements: Array(8).fill(false),
    previousAyurvedaTreatments: '',
    knownAllergies: '',
    allopathicMedications: '',
    lifestyleDiseases: '',
    patientSignature: '',
    kairaliRepSignature: '',
    kairaliRepComments: '',
    officeUse: { ...EMPTY_OFFICE_USE },
  }
}

export function fullNameFromForm(f: RegistrationForm) {
  return [f.firstName, f.middleName, f.lastName].filter(Boolean).join(' ').trim()
    || [f.title, f.lastName].filter(Boolean).join(' ').trim()
}

export function computeAgeFromDob(dob: string): { years: string; months: string } {
  if (!dob) return { years: '', months: '' }
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return { years: '', months: '' }
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  const years = Math.floor(months / 12)
  return { years: String(years), months: String(months % 12) }
}

export function purposeLabel(purposes: VisitPurpose[]) {
  const map: Record<VisitPurpose, string> = {
    consultation: "Doctor's Consultation",
    maintenance: 'Maintenance of Health',
    preventive: 'Preventive Measure',
  }
  return purposes.map(p => map[p]).join(', ')
}

export function hearAboutLabel(items: HearAbout[], other: string) {
  const map: Record<HearAbout, string> = {
    website: 'Kairali Website',
    social: 'Social Media',
    advertisements: 'Advertisements',
    other: other || 'Others',
  }
  return items.map(h => map[h]).join(', ')
}
