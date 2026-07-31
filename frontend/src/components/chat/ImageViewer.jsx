import PropTypes from 'prop-types'

export default function ImageViewer({ src, alt, onClose }) {
  return (
    <div className="image-viewer" role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} aria-label="Close image">
        ×
      </button>
      <img src={src} alt={alt} />
    </div>
  )
}

ImageViewer.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

ImageViewer.defaultProps = {
  alt: 'Shared attachment',
}
