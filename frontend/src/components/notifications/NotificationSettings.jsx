import PropTypes from 'prop-types'

const CHANNELS = [
  { id: 'in_app', label: 'In-app' },
  { id: 'push', label: 'Push' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
]

export default function NotificationSettings({
  preferences,
  onChange,
  disabled,
}) {
  return (
    <div className="notification-settings">
      {Object.entries(preferences).map(([category, channels]) => (
        <section className="notification-settings__row" key={category}>
          <div>
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <p>Control how you receive {category} updates.</p>
          </div>

          <div className="notification-settings__channels">
            {CHANNELS.map((channel) => (
              <label key={channel.id}>
                <input
                  type="checkbox"
                  checked={Boolean(channels[channel.id])}
                  disabled={disabled || channel.id === 'in_app'}
                  onChange={(event) =>
                    onChange(category, channel.id, event.target.checked)
                  }
                />
                <span>{channel.label}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

NotificationSettings.propTypes = {
  preferences: PropTypes.objectOf(
    PropTypes.objectOf(PropTypes.bool)
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

NotificationSettings.defaultProps = {
  disabled: false,
}
