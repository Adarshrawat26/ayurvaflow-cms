import { useState } from 'react'
import { Plus, ArrowLeft, Download, X, Mail } from 'lucide-react'
import type { Page } from '../App'
import type { Invoice } from '../types/entities'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectClinicSettings, selectInvoices, selectPatients } from '../store/selectors'
import { createInvoiceApi, recordInvoicePaymentApi } from '../store/thunks/apiThunks'
import { printInvoice, sendInvoiceToPatient } from '../lib/invoicePrint'

const S: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
}

function InvoiceView({
  inv,
  onBack,
  onPayment,
}: {
  inv: Invoice
  onBack: () => void
  onPayment: (inv: Invoice) => void
}) {
  const clinic = useAppSelector(selectClinicSettings)
  const patients = useAppSelector(selectPatients)
  const patient = patients.find(p => p.id === inv.patientId)
  const balance = inv.total - inv.paid

  return (
    <div className="p-4 lg:p-6 w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to billing
      </button>
      <div className="card p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs text-gray-400 mb-1">Invoice</div>
            <h2 className="text-lg font-semibold text-gray-900">{inv.id}</h2>
            <p className="text-sm text-gray-500">{inv.patient} · {inv.date}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${S[inv.status]}`}>{inv.status}</span>
        </div>

        <table className="w-full text-sm mb-5">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              <th className="text-left pb-2">Description</th>
              <th className="text-right pb-2">Qty</th>
              <th className="text-right pb-2">Rate</th>
              <th className="text-right pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2 text-gray-900">{item.desc}</td>
                <td className="py-2 text-right text-gray-600">{item.qty}</td>
                <td className="py-2 text-right text-gray-600">₹{item.rate.toLocaleString()}</td>
                <td className="py-2 text-right font-medium">₹{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{inv.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>₹{inv.tax.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2"><span>Total</span><span>₹{inv.total.toLocaleString()}</span></div>
          <div className="flex justify-between text-[#52B788]"><span>Paid</span><span>₹{inv.paid.toLocaleString()}</span></div>
          {balance > 0 && (
            <div className="flex justify-between text-red-600 font-medium"><span>Balance Due</span><span>₹{balance.toLocaleString()}</span></div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button type="button" className="btn-outline flex items-center gap-2" onClick={() => printInvoice(inv, clinic)}>
            <Download size={14} /> Download / Print
          </button>
          <button
            type="button"
            className="btn-outline flex items-center gap-2"
            onClick={() => sendInvoiceToPatient(inv, patient?.email ?? '', clinic)}
          >
            <Mail size={14} /> Send to Patient
          </button>
          {balance > 0 && (
            <button type="button" className="btn-primary flex-1 min-w-[140px]" onClick={() => onPayment(inv)}>
              Record Payment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Billing(_props: { onNavigate: (p: Page) => void; user?: unknown }) {
  const dispatch = useAppDispatch()
  const invoices = useAppSelector(selectInvoices)
  const patients = useAppSelector(selectPatients)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [form, setForm] = useState({ patient: '', desc: '', qty: '1', rate: '' })

  const subtotal = Number(form.rate) * Number(form.qty)
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  const create = () => {
    const patient = patients.find(p => p.id === form.patient)
    const newInv: Invoice = {
      id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
      patientId: form.patient,
      patient: patient?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      items: [{ desc: form.desc, qty: Number(form.qty), rate: Number(form.rate), amount: subtotal }],
      subtotal, tax, total,
      paid: 0,
      status: 'unpaid',
    }
    dispatch(createInvoiceApi(newInv))
    setShowModal(false)
    setForm({ patient: '', desc: '', qty: '1', rate: '' })
  }

  const openPayment = (inv: Invoice) => {
    setPaymentInvoice(inv)
    setPaymentAmount(String(inv.total - inv.paid))
    setShowPayment(true)
  }

  const submitPayment = async () => {
    if (!paymentInvoice) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) return
    const updated = await dispatch(recordInvoicePaymentApi({ id: paymentInvoice.id, amount })).unwrap()
    setSelected(prev => (prev?.id === updated.id ? updated : prev))
    setShowPayment(false)
    setPaymentInvoice(null)
  }

  if (selected) {
    return (
      <InvoiceView
        inv={selected}
        onBack={() => setSelected(null)}
        onPayment={openPayment}
      />
    )
  }

  const totalRevenue = invoices.reduce((a, i) => a + i.paid, 0)
  const totalOutstanding = invoices.reduce((a, i) => a + (i.total - i.paid), 0)

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K` },
          { label: 'Outstanding', value: `₹${(totalOutstanding / 1000).toFixed(0)}K` },
          { label: 'Invoices', value: invoices.length },
        ].map(k => (
          <div key={k.label} className="card p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{k.value}</div>
            <div className="text-[10px] text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> <span className="hidden sm:inline">New Invoice</span>
        </button>
      </div>

      <div className="lg:hidden space-y-2">
        {invoices.map(inv => (
          <button key={inv.id} onClick={() => setSelected(inv)} className="card w-full p-4 text-left flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{inv.patient}</div>
              <div className="text-xs text-gray-400">{inv.id} · {inv.date}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-gray-900">₹{inv.total.toLocaleString()}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${S[inv.status]}`}>{inv.status}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr className="text-xs text-gray-500">
              {['Invoice', 'Patient', 'Date', 'Total', 'Paid', 'Balance', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} onClick={() => setSelected(inv)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{inv.id}</td>
                <td className="px-4 py-3 text-gray-700">{inv.patient}</td>
                <td className="px-4 py-3 text-gray-500">{inv.date}</td>
                <td className="px-4 py-3 font-medium">₹{inv.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-[#52B788]">₹{inv.paid.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-600">₹{(inv.total - inv.paid).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${S[inv.status]}`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">New Invoice</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Patient</label>
                <select className="input-field" value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><input className="input-field" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Qty</label><input className="input-field" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} /></div>
                <div><label className="label">Rate (₹)</label><input className="input-field" type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} /></div>
              </div>
              <div className="card p-3 bg-gray-50 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
            <button className="btn-primary w-full mt-4" onClick={create} disabled={!form.patient || !form.desc || !form.rate}>Create Invoice</button>
          </div>
        </div>
      )}

      {showPayment && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPayment(false)} />
          <div className="relative bg-white w-full lg:max-w-sm rounded-t-2xl lg:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowPayment(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {paymentInvoice.id} · Balance ₹{(paymentInvoice.total - paymentInvoice.paid).toLocaleString('en-IN')}
            </p>
            <label className="label">Amount (₹)</label>
            <input
              className="input-field mb-4"
              type="number"
              min={1}
              max={paymentInvoice.total - paymentInvoice.paid}
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" className="btn-outline flex-1" onClick={() => setShowPayment(false)}>Cancel</button>
              <button type="button" className="btn-primary flex-1" onClick={submitPayment}>Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
