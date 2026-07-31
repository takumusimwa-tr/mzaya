import { useState } from 'react'
import PropTypes from 'prop-types'

export default function InternalNotesPanel({ notes, onAdd }) {
  const [body, setBody] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const value = body.trim()
    if (!value) return

    await onAdd(value)
    setBody('')
  }

  return (
    <aside className="internal-notes">
      <div>
        <p className="eyebrow">Private workspace</p>
        <h2>Internal notes</h2>
      </div>

      <div className="internal-notes__list">
        {notes?.map((note) => (
          <article key={note.id}>
            <strong>
              {note.author?.first_name} {note.author?.last_name}
            </strong>
            <p>{note.body}</p>
            <time dateTime={note.created_at}>
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(note.created_at))}
            </time>
          </article>
        ))}
      </div>

      <form onSubmit={submit}>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a private note for the support team"
          maxLength="5000"
        />
        <button type="submit" disabled={!body.trim()}>
          Add note
        </button>
      </form>
    </aside>
  )
}

InternalNotesPanel.propTypes = {
  notes: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
}

InternalNotesPanel.defaultProps = {
  notes: [],
}
