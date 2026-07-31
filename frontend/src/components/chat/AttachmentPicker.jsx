import { useRef } from 'react'
import PropTypes from 'prop-types'

export default function AttachmentPicker({ onSelect, disabled }) {
  const inputRef = useRef(null)

  return (
    <>
      <button
        type="button"
        className="attachment-picker"
        aria-label="Attach a file"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        +
      </button>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,audio/*"
        onChange={(event) => {
          const [file] = event.target.files || []
          if (file) onSelect(file)
          event.target.value = ''
        }}
      />
    </>
  )
}

AttachmentPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

AttachmentPicker.defaultProps = {
  disabled: false,
}
