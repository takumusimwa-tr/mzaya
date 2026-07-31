import PropTypes from 'prop-types'

export default function FileBubble({ attachment, onOpen }) {
  return (
    <button
      type="button"
      className="file-bubble"
      onClick={() => onOpen(attachment)}
    >
      <span className="file-bubble__icon">DOC</span>
      <span>
        <strong>{attachment.original_name}</strong>
        <small>
          {(Number(attachment.byte_size) / 1024 / 1024).toFixed(2)} MB
        </small>
      </span>
    </button>
  )
}

FileBubble.propTypes = {
  attachment: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
}
