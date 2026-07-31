import PropTypes from 'prop-types'

export default function UploadProgress({ upload, onCancel, onDismiss }) {
  return (
    <article className="upload-progress">
      <div>
        <strong>{upload.file?.name || 'Attachment'}</strong>
        <span>{upload.status}</span>
      </div>

      <progress value={upload.progress || 0} max="100" />

      {['uploading', 'creating', 'finalizing'].includes(upload.status) && (
        <button type="button" onClick={() => onCancel(upload.id)}>
          Cancel
        </button>
      )}

      {['failed', 'cancelled', 'complete'].includes(upload.status) && (
        <button type="button" onClick={() => onDismiss(upload.id)}>
          Dismiss
        </button>
      )}
    </article>
  )
}

UploadProgress.propTypes = {
  upload: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
}
