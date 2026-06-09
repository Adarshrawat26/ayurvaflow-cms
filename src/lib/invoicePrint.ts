import type { ClinicSettings } from '@/types/clinic'
import type { Invoice } from '@/types/entities'

export function printInvoice(inv: Invoice, clinic: ClinicSettings) {
  const balance = inv.total - inv.paid
  const html = `<!DOCTYPE html><html><head><title>Invoice ${inv.id}</title>
<style>
  body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:720px;margin:0 auto}
  h1{font-size:20px;margin:0} .muted{color:#666;font-size:13px}
  table{width:100%;border-collapse:collapse;margin:20px 0;font-size:14px}
  th,td{padding:8px 0;border-bottom:1px solid #eee;text-align:left}
  td.r{text-align:right} .total{font-weight:700;font-size:16px}
  .header{display:flex;justify-content:space-between;margin-bottom:24px}
</style></head><body>
<div class="header">
  <div><h1>${clinic.name}</h1><p class="muted">${clinic.address}</p><p class="muted">${clinic.phone} · ${clinic.email}</p>${clinic.gst ? `<p class="muted">GSTIN: ${clinic.gst}</p>` : ''}</div>
  <div style="text-align:right"><h1>INVOICE</h1><p class="muted">${inv.id}</p><p class="muted">${inv.date}</p></div>
</div>
<p><strong>Bill to:</strong> ${inv.patient}</p>
<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>
${inv.items.map(i => `<tr><td>${i.desc}</td><td class="r">${i.qty}</td><td class="r">₹${i.rate.toLocaleString('en-IN')}</td><td class="r">₹${i.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
</tbody></table>
<p class="r">Subtotal: ₹${inv.subtotal.toLocaleString('en-IN')}</p>
<p class="r">GST (18%): ₹${inv.tax.toLocaleString('en-IN')}</p>
<p class="r total">Total: ₹${inv.total.toLocaleString('en-IN')}</p>
<p class="r">Paid: ₹${inv.paid.toLocaleString('en-IN')}</p>
${balance > 0 ? `<p class="r" style="color:#dc2626">Balance due: ₹${balance.toLocaleString('en-IN')}</p>` : ''}
<p class="muted" style="margin-top:32px">Thank you for choosing ${clinic.name}.</p>
</body></html>`

  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
}

export function sendInvoiceToPatient(inv: Invoice, patientEmail: string, clinic: ClinicSettings) {
  const balance = inv.total - inv.paid
  const subject = encodeURIComponent(`Invoice ${inv.id} from ${clinic.name}`)
  const body = encodeURIComponent(
    `Dear ${inv.patient},\n\nPlease find your invoice summary:\n\nInvoice: ${inv.id}\nDate: ${inv.date}\nTotal: ₹${inv.total.toLocaleString('en-IN')}\nPaid: ₹${inv.paid.toLocaleString('en-IN')}\n${balance > 0 ? `Balance due: ₹${balance.toLocaleString('en-IN')}\n` : ''}\nThank you,\n${clinic.name}\n${clinic.phone}`,
  )
  const mailto = patientEmail
    ? `mailto:${patientEmail}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`
  window.location.href = mailto
}
