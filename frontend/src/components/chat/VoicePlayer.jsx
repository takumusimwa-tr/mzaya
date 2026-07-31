import PropTypes from 'prop-types'

export default function VoicePlayer({ src, durationMs, waveform }) {
  return (
    <div className="voice-player">
      {waveform?.length > 0 && (
        <div className="voice-player__waveform" aria-hidden="true">
          {waveform.map((value, index) => (
            <span
              key={`${index}-${value}`}
              style={{ height: `${Math.max(8, value * 34)}px` }}
            />
          ))}
        </div>
      )}

      <audio controls preload="metadata" src={src} />
      {durationMs && <small>{Math.ceil(durationMs / 1000)} seconds</small>}
    </div>
  )
}

VoicePlayer.propTypes = {
  src: PropTypes.string.isRequired,
  durationMs: PropTypes.number,
  waveform: PropTypes.array,
}

VoicePlayer.defaultProps = {
  durationMs: null,
  waveform: [],
}
