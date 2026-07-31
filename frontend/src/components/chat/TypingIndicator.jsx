import PropTypes from 'prop-types'
export default function TypingIndicator({label}){return <div className="typing-indicator" aria-live="polite"><span>{label}</span><i/><i/><i/></div>}
TypingIndicator.propTypes={label:PropTypes.string};TypingIndicator.defaultProps={label:'Your Mzaya is typing'};