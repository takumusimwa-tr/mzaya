import { useState } from 'react'
import PropTypes from 'prop-types'
import useSettlementProfile from '../../hooks/useSettlementProfile'

export default function SettlementProfileForm({
  ownerType,
  ownerId,
  currency,
  onSaved,
}) {
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [accountLast4, setAccountLast4] = useState('')
  const [schedule, setSchedule] = useState('weekly')
  const [minimumPayoutMinor, setMinimumPayoutMinor] = useState(0)
  const { saveProfile, saving } = useSettlementProfile()

  const submit = async (event) => {
    event.preventDefault()

    const profile = await saveProfile({
      ownerType,
      ownerId,
      currency,
      payoutMethod,
      payoutDestination: {
        beneficiaryName,
        accountLast4,
      },
      minimumPayoutMinor: Number(minimumPayoutMinor),
      schedule,
      holdDays: 2,
    })

    onSaved?.(profile)
  }

  return (
    <form className="settlement-profile-form" onSubmit={submit}>
      <header>
        <p className="finance-eyebrow">Payout configuration</p>
        <h2>Settlement profile</h2>
      </header>

      <label>
        Payout method
        <select
          value={payoutMethod}
          onChange={(event) => setPayoutMethod(event.target.value)}
        >
          <option value="bank_transfer">Bank transfer</option>
          <option value="mobile_money">Mobile money</option>
          <option value="manual">Manual payout</option>
        </select>
      </label>

      <label>
        Beneficiary name
        <input
          value={beneficiaryName}
          onChange={(event) => setBeneficiaryName(event.target.value)}
          required
        />
      </label>

      <label>
        Account last four digits
        <input
          value={accountLast4}
          onChange={(event) => setAccountLast4(event.target.value)}
          maxLength="4"
          required
        />
      </label>

      <label>
        Schedule
        <select
          value={schedule}
          onChange={(event) => setSchedule(event.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every two weeks</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label>
        Minimum payout in minor units
        <input
          type="number"
          min="0"
          value={minimumPayoutMinor}
          onChange={(event) => setMinimumPayoutMinor(event.target.value)}
        />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save settlement profile'}
      </button>
    </form>
  )
}

SettlementProfileForm.propTypes = {
  ownerType: PropTypes.oneOf(['vendor', 'rider']).isRequired,
  ownerId: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  onSaved: PropTypes.func,
}

SettlementProfileForm.defaultProps = {
  onSaved: null,
}
