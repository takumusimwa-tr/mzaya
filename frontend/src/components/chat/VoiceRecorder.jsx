import PropTypes from 'prop-types'
import useVoiceRecorder from '../../hooks/useVoiceRecorder'

export default function VoiceRecorder({ onSend, disabled }) {
  const {
    status,
    durationMs,
    blob,
    start,
    stop,
    reset,
  } = useVoiceRecorder()

  const send = async () => {
    if (!blob) return

    const file = new File(
      [blob],
      `voice-note-${Date.now()}.webm`,
      { type: blob.type || 'audio/webm' }
    )

    await onSend({ file, durationMs })
    reset()
  }

  return (
    <div className="voice-recorder">
      {status === 'idle' && (
        <button type="button" disabled={disabled} onClick={start}>
          Record
        </button>
      )}

      {status === 'recording' && (
        <>
          <span>{Math.ceil(durationMs / 1000)}s</span>
          <button type="button" onClick={stop}>Stop</button>
        </>
      )}

      {status === 'ready' && (
        <>
          <audio controls src={URL.createObjectURL(blob)} />
          <button type="button" onClick={send}>Send</button>
          <button type="button" onClick={reset}>Discard</button>
        </>
      )}
    </div>
  )
}

VoiceRecorder.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

VoiceRecorder.defaultProps = {
  disabled: false,
}
