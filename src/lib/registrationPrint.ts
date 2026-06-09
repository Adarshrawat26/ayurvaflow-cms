import { CONSENT_CLAUSES, CONSENT_PREAMBLE, COMPANY_REGISTERED_ADDRESS, NABH_SEAL_TEXT } from '@/data/consentClauses'
import type { ClinicSettings } from '@/types/clinic'
import type { PatientRegistrationRecord } from '@/types/registration'
import { fullNameFromForm, hearAboutLabel, purposeLabel } from '@/types/registration'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sigImg(data: string, label: string) {
  if (!data) return `<p>${esc(label)}: _________________________</p>`
  return `<p>${esc(label)}:</p><img src="${data}" style="max-height:60px;max-width:240px" alt="signature"/>`
}

function fmtDate(iso: string) {
  if (!iso) return '___ / ___ / ______'
  const [y, m, d] = iso.split('-')
  return `${d} / ${m} / ${y}`
}

export function printRegistration(reg: PatientRegistrationRecord, clinic: ClinicSettings) {
  const f = reg.formData
  const name = fullNameFromForm(f)
  const regNo = reg.regNumber
  const centreLine = `${clinic.name.toUpperCase()} | ${clinic.address} | T: ${clinic.phone} | E: ${clinic.email} | W: ${clinic.website.replace(/^https?:\/\//, '')}`
  const preamble = CONSENT_PREAMBLE(clinic.address, COMPANY_REGISTERED_ADDRESS, clinic.phone, clinic.email)

  const page1 = `
  <div class="page">
    <div class="logo">Kairali Ayurvedic Centre</div>
    <h1>ONE TIME REGISTRATION FORM</h1>
    <p class="center-meta">${esc(centreLine)}</p>
    <p class="nabh">${esc(NABH_SEAL_TEXT)}</p>
    <p><strong>Date:</strong> ${fmtDate(f.regDate)}</p>
    <p><strong>Reg No:</strong> ${esc(regNo)} <span class="muted">(To be filled by Office staff)</span></p>
    <p class="banner">(To be filled in English with Black Ink in Capital Letters)</p>
    <table class="grid">
      <tr><td>Title</td><td>${esc(f.title)} ${esc(f.titleOther)}</td><td>Last (Surname)</td><td>${esc(f.lastName)}</td></tr>
      <tr><td>First Name</td><td>${esc(f.firstName)}</td><td>Middle Name</td><td>${esc(f.middleName)}</td></tr>
      <tr><td>Date of Birth</td><td>${fmtDate(f.dateOfBirth)}</td><td>Age</td><td>${esc(f.ageYears)} Years ${esc(f.ageMonths)} Months</td></tr>
      <tr><td>Gender</td><td colspan="3">${f.gender === 'M' ? '☑ Male' : '☐ Male'} &nbsp; ${f.gender === 'F' ? '☑ Female' : '☐ Female'} &nbsp; ${f.gender === 'O' ? '☑ Others' : '☐ Others'}</td></tr>
      <tr><td>Occupation</td><td colspan="3">${esc(f.occupation)}</td></tr>
      <tr><td>Resl. Address</td><td colspan="3">${esc(f.addressLine1)}<br/>${esc(f.addressLine2)}<br/>${esc(f.addressLine3)}</td></tr>
      <tr><td>City / Town</td><td>${esc(f.city)}</td><td>Pin / Zip</td><td>${esc(f.pinCode)}</td></tr>
      <tr><td>State</td><td>${esc(f.state)}</td><td>Country</td><td>${esc(f.country)}</td></tr>
      <tr><td>Nationality</td><td colspan="3">${esc(f.nationality)}</td></tr>
      <tr><td>Tel (Res)</td><td>${esc(f.telResStd)} ${esc(f.telResNumber)}</td><td>Office</td><td>${esc(f.telOfficeStd)} ${esc(f.telOfficeNumber)}</td></tr>
      <tr><td>Mobile 1</td><td>${esc(f.mobile1)}</td><td>Mobile 2</td><td>${esc(f.mobile2)}</td></tr>
      <tr><td>Email-Id</td><td colspan="3">${esc(f.email)}</td></tr>
    </table>
    <h2>Responsible Person / Kin Details</h2>
    <table class="grid">
      <tr><td>Relation</td><td colspan="3">${esc(f.kin.relation)} ${esc(f.kin.relationOther)}</td></tr>
      <tr><td>Kin Name</td><td colspan="3">${esc(f.kin.title)} ${esc(f.kin.firstName)} ${esc(f.kin.middleName)} ${esc(f.kin.lastName)}</td></tr>
      <tr><td>Contact</td><td>${esc(f.kin.contactNo)}</td><td>Emergency</td><td>${esc(f.kin.emergencyContactNo)}</td></tr>
      <tr><td>Referred by</td><td colspan="3">${esc(f.referredByLine1)}<br/>${esc(f.referredByLine2)}</td></tr>
      <tr><td>How did you hear about us</td><td colspan="3">${esc(hearAboutLabel(f.hearAbout, f.hearAboutOther))}</td></tr>
      <tr><td>Purpose of Visit</td><td colspan="3">${esc(purposeLabel(f.visitPurpose))}</td></tr>
    </table>
    <p>Signature: ${esc(f.executionSignature || '_________________')} &nbsp; Patient: ${f.signerType === 'patient' ? '☑' : '☐'} &nbsp; Responsible Person: ${f.signerType === 'responsible' ? '☑' : '☐'}</p>
  </div>`

  const clauses1 = CONSENT_CLAUSES.slice(0, 4).map(c =>
    `<h3>Clause ${c.id}: ${esc(c.title)}</h3><p>${esc(c.text)}</p>`
  ).join('')

  const page2 = `
  <div class="page">
    <h1>GENERAL CONSENT FOR TREATMENT / THERAPY (PART 1)</h1>
    <p class="legal">${esc(preamble)}</p>
    ${clauses1}
  </div>`

  const clauses2 = CONSENT_CLAUSES.slice(4).map(c =>
    `<h3>Clause ${c.id}: ${esc(c.title)}</h3><p>${esc(c.text)}</p>`
  ).join('')

  const page3 = `
  <div class="page">
    <h1>GENERAL CONSENT FOR TREATMENT / THERAPY (PART 2)</h1>
    ${clauses2}
    <p><strong>Name of Patient:</strong> ${esc(name)} &nbsp; <strong>Age:</strong> ${esc(f.ageYears)}</p>
    <p><strong>Address:</strong> ${esc([f.addressLine1, f.city, f.state].filter(Boolean).join(', '))}</p>
    <p><strong>Nationality:</strong> ${esc(f.nationality)}</p>
    <p><strong>Previous Ayurveda Treatments:</strong><br/>${esc(f.previousAyurvedaTreatments)}</p>
    <p><strong>Known Allergies / Reactions:</strong><br/>${esc(f.knownAllergies)}</p>
    <p><strong>Allopathic Medications:</strong><br/>${esc(f.allopathicMedications)}</p>
    <p><strong>Lifestyle Diseases / Medical History:</strong><br/>${esc(f.lifestyleDiseases)}</p>
    ${sigImg(f.kairaliRepSignature, 'Authorized Representative of Kairali')}
    ${f.kairaliRepComments ? `<p>Comments: ${esc(f.kairaliRepComments)}</p>` : ''}
    ${sigImg(f.patientSignature, 'Signature Patient')}
    <div class="office">
      <h2>FOR OFFICE USE ONLY</h2>
      <p><strong>DIAGNOSIS:</strong> ${esc(f.officeUse.diagnosis)}</p>
      <p><strong>PRESENT COMPLAINTS:</strong> ${esc(f.officeUse.presentComplaints)}</p>
      <p><strong>TREATMENT PRESCRIBED BY DOCTOR:</strong> ${esc(f.officeUse.treatmentPrescribed)}</p>
      <p><strong>SIGNATURE OF DOCTOR:</strong> ${esc(f.officeUse.doctorSignature)}</p>
    </div>
    <p class="muted">Signed digitally on ${new Date(reg.signedAt).toLocaleString('en-IN')}</p>
  </div>`

  const html = `<!DOCTYPE html><html><head><title>Registration ${esc(regNo)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: 'Times New Roman', serif; font-size: 11px; color: #111; line-height: 1.45; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 14px; text-align: center; text-transform: uppercase; margin: 12px 0; }
  h2 { font-size: 12px; margin: 14px 0 6px; border-bottom: 1px solid #333; }
  h3 { font-size: 11px; margin: 10px 0 4px; }
  .logo { text-align: center; font-weight: bold; font-size: 13px; color: #1B4332; }
  .center-meta, .nabh { text-align: center; font-size: 9px; margin: 4px 0; }
  .nabh { font-style: italic; padding: 6px; border: 1px solid #ccc; }
  .banner { background: #f3f4f6; padding: 6px; text-align: center; font-weight: bold; font-size: 10px; }
  .muted { color: #666; font-size: 9px; }
  .legal { text-align: justify; }
  table.grid { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
  table.grid td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; }
  .office { border: 2px solid #111; padding: 10px; margin-top: 16px; }
</style></head><body>
${page1}${page2}${page3}
</body></html>`

  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
}
