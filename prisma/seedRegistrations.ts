/** Sample one-time registration payloads for seed data */
export function sampleRegistrationForm(overrides: {
  firstName: string
  lastName: string
  dateOfBirth: string
  ageYears: string
  gender: 'M' | 'F'
  mobile1: string
  email: string
  city: string
  occupation: string
  nationality: string
  addressLine1: string
  visitPurpose: string[]
  hearAbout: string[]
}) {
  const today = new Date().toISOString().slice(0, 10)
  return {
    regDate: today,
    regSeq1: '',
    regSeq2: '',
    regSeq3: '',
    title: overrides.gender === 'F' ? 'Ms.' : 'Mr.',
    titleOther: '',
    firstName: overrides.firstName,
    lastName: overrides.lastName,
    middleName: '',
    dateOfBirth: overrides.dateOfBirth,
    ageYears: overrides.ageYears,
    ageMonths: '0',
    gender: overrides.gender,
    occupation: overrides.occupation,
    addressLine1: overrides.addressLine1,
    addressLine2: '',
    addressLine3: '',
    city: overrides.city,
    pinCode: '122033',
    state: 'Haryana',
    country: 'India',
    nationality: overrides.nationality,
    telResStd: '91',
    telResNumber: '',
    telOfficeStd: '',
    telOfficeNumber: '',
    mobile1: overrides.mobile1,
    mobile2: '',
    email: overrides.email,
    kin: {
      relation: 'husband',
      relationOther: '',
      title: 'Mr.',
      titleOther: '',
      lastName: 'Sharma',
      firstName: 'Rahul',
      middleName: '',
      contactNo: '9876500001',
      emergencyContactNo: '9876500002',
    },
    referredByLine1: 'Dr. Kumar',
    referredByLine2: '',
    hearAbout: overrides.hearAbout,
    hearAboutOther: '',
    visitPurpose: overrides.visitPurpose,
    executionSignature: '',
    signerType: 'patient',
    consentPart1Accepted: true,
    consentPart2Accepted: true,
    clauseAcknowledgements: Array(8).fill(true),
    previousAyurvedaTreatments: 'None',
    knownAllergies: 'None known',
    allopathicMedications: 'None',
    lifestyleDiseases: 'None',
    patientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    kairaliRepSignature: '',
    kairaliRepComments: '',
    officeUse: {
      diagnosis: 'Vata imbalance · stress',
      presentComplaints: 'Anxiety, poor sleep',
      treatmentPrescribed: 'Shirodhara programme',
      doctorSignature: 'Dr. Arathi Menon',
      filledAt: today,
      filledBy: 'Dr. Arathi Menon',
    },
  }
}
