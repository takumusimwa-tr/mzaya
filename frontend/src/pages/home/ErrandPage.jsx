import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Icon from '../../components/ui/Icon'
import LocationPicker from '../../components/LocationPicker'

const TASK_TYPES = [
  { id: 'ZIMRA',        label: 'ZIMRA / Tax',        icon: 'zimra' },
  { id: 'bank_queue',   label: 'Bank Queue',          icon: 'bank' },
  { id: 'document',     label: 'Document Delivery',   icon: 'document' },
  { id: 'shopping',     label: 'Shopping Run',        icon: 'shopping' },
  { id: 'bill_payment', label: 'Bill Payment',        icon: 'bill' },
  { id: 'other',        label: 'Other',               icon: 'errand' },
]


export default function ErrandPage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  // Both ends of an errand need a real coordinate, for the same reason checkout
  // does: a Zimbabwean street address alone will have the Mzaya phoning you.
  //  • errand pin  — where they're going (ZIMRA, the bank, the shop)
  //  • your pin    — where they collect documents / return them to you
  const [errandCoords, setErrandCoords]     = useState(null)
  const [errandLandmark, setErrandLandmark] = useState('')
  const [yourCoords, setYourCoords]         = useState(null)
  const [yourLandmark, setYourLandmark]     = useState('')

  const [form, setForm] = useState({
    task_type:                  '',
    task_description:           '',
    errand_location:            '',
    pickup_address:             '',
    dropoff_address:            '',
    estimated_duration_minutes: '60',
    documents_required:         false,
    document_description:       '',
    cash_float_required:        false,
    cash_float_amount_usd:      '',
    payment_method:             'ecocash',
    special_instructions:       '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleTaskType = (id) => setForm({ ...form, task_type: id })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.task_type) {
      setError('Please select a task type')
      return
    }
    if (!form.task_description.trim()) {
      setError('Please describe what needs to be done')
      return
    }
    if (!form.errand_location.trim()) {
      setError('Please enter the errand location')
      return
    }
    if (!form.dropoff_address.trim()) {
      setError('Please enter your address for updates / document return')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        category_type:   'errand',
        city:            'harare',
        pickup_address:  form.errand_location,
        pickup_location: errandCoords || null,
        dropoff_address: form.dropoff_address,
        dropoff_location: yourCoords || null,
        dropoff_landmark: yourLandmark || null,
        payment_method:  form.payment_method,
        detail: {
          task_type:                  form.task_type,
          task_description:           form.task_description,
          errand_location:            form.errand_location,
          errand_coordinates:         errandCoords || null,
          errand_landmark:            errandLandmark || null,
          estimated_duration_minutes: parseInt(form.estimated_duration_minutes) || 60,
          documents_required:         form.documents_required,
          document_description:       form.documents_required ? form.document_description : null,
          cash_float_required:        form.cash_float_required,
          cash_float_amount_usd:      form.cash_float_required ? parseFloat(form.cash_float_amount_usd) : null,
          special_instructions:       form.special_instructions || null,
        },
      }

      const { data } = await orderAPI.place(orderData)
      navigate(`/orders/${data.order.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place errand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="bg-[#00A651] px-4 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full mb-4 inline-block">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Book an Errand</h1>
        <p className="text-white/80 text-sm mt-1">We'll send a rider to handle it for you</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Task type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">What type of errand?</h2>
          <div className="grid grid-cols-3 gap-2">
            {TASK_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTaskType(t.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
                  ${form.task_type === t.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <span className="text-2xl"><Icon name={t.icon} size={22} /></span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700">Errand details</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Describe the task <span className="text-red-500">*</span>
            </label>
            <textarea
              name="task_description"
              value={form.task_description}
              onChange={handleChange}
              placeholder="e.g. Submit VAT returns at ZIMRA Harare CBD office. Forms are in a brown envelope."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <Input
            label="Errand location (where to go)"
            name="errand_location"
            value={form.errand_location}
            onChange={handleChange}
            placeholder="e.g. ZIMRA Office, Cnr Livingstone Ave & Kwame Nkrumah"
            required
          />
          <LocationPicker
            coords={errandCoords}
            onCoords={setErrandCoords}
            landmark={errandLandmark}
            onLandmark={setErrandLandmark}
            label="Pin the errand location (recommended)"
            landmarkLabel="Landmark / directions for the Mzaya (optional)"
            landmarkPlaceholder="e.g. 3rd floor, entrance behind the bank"
            whatsappMessage="Hi! Please share the location pin for this errand so my Mzaya can find it."
          />

          <Input
            label="Your address (for updates / document return)"
            name="dropoff_address"
            value={form.dropoff_address}
            onChange={handleChange}
            placeholder="e.g. 15 Borrowdale Rd, Harare"
            required
          />
          <LocationPicker
            coords={yourCoords}
            onCoords={setYourCoords}
            landmark={yourLandmark}
            onLandmark={setYourLandmark}
            label="Pin your location (recommended)"
            landmarkLabel="Landmark / directions to you (optional)"
            landmarkPlaceholder="e.g. blue gate opposite Total garage, ask for tuckshop"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Estimated time needed</label>
            <select
              name="estimated_duration_minutes"
              value={form.estimated_duration_minutes}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">Half day (4 hours)</option>
            </select>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700">Additional requirements</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="documents_required"
              checked={form.documents_required}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">Documents need to be collected</p>
              <p className="text-xs text-gray-400">Your Mzaya will collect the documents from you first</p>
            </div>
          </label>

          {form.documents_required && (
            <Input
              label="Describe the documents"
              name="document_description"
              value={form.document_description}
              onChange={handleChange}
              placeholder="e.g. Brown envelope with VAT returns, on the desk"
            />
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="cash_float_required"
              checked={form.cash_float_required}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">Cash float required</p>
              <p className="text-xs text-gray-400">Your Mzaya will carry cash to pay the fees for you</p>
            </div>
          </label>

          {form.cash_float_required && (
            <Input
              label="Cash float amount (USD)"
              name="cash_float_amount_usd"
              type="number"
              value={form.cash_float_amount_usd}
              onChange={handleChange}
              placeholder="e.g. 20.00"
            />
          )}

          <Input
            label="Special instructions (optional)"
            name="special_instructions"
            value={form.special_instructions}
            onChange={handleChange}
            placeholder="e.g. Ask for Mr Moyo at the front desk"
          />
        </div>

        {/* Payment is chosen on the order page, at the moment it's actually
            taken — not here, and not twice. */}
      </form>

      {/* Submit button */}
      {/* Sits DIRECTLY on the bottom nav — no floating gap.
          It used to be `bottom-20`, which parked the button 80px up and left a
          dead band of empty screen between it and the nav. That's prime real
          estate on a phone; it should either do something or not exist. */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pt-3 pb-3 z-30
                      bg-gradient-to-t from-white via-white to-transparent">
        <Button
          size="lg"
          loading={loading}
          onClick={handleSubmit}
          className="bg-[#00A651] hover:bg-[#00873F]"
        >
          Book errand
        </Button>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
