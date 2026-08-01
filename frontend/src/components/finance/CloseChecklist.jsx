import PropTypes from 'prop-types'

export default function CloseChecklist({
  tasks,
  onComplete,
}) {
  return (
    <div className="close-checklist">
      {tasks
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((task) => (
          <article key={task.id}>
            <div>
              <strong>{task.name}</strong>
              <span>{task.category}</span>
            </div>

            <span className={`close-task-status is-${task.status}`}>
              {task.status}
            </span>

            {task.status !== 'completed' && (
              <button
                type="button"
                onClick={() => onComplete(task.id)}
              >
                Mark complete
              </button>
            )}
          </article>
        ))}
    </div>
  )
}

CloseChecklist.propTypes = {
  tasks: PropTypes.array.isRequired,
  onComplete: PropTypes.func.isRequired,
}
