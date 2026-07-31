import PropTypes from 'prop-types'
import UploadProgress from './UploadProgress'

export default function UploadQueue({ uploads, onCancel, onDismiss }) {
  if (!uploads.length) return null

  return (
    <section className="upload-queue" aria-label="Uploads">
      {uploads.map((upload) => (
        <UploadProgress
          key={upload.id}
          upload={upload}
          onCancel={onCancel}
          onDismiss={onDismiss}
        />
      ))}
    </section>
  )
}

UploadQueue.propTypes = {
  uploads: PropTypes.array.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
}
