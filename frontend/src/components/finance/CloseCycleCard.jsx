import PropTypes from 'prop-types'
import CloseChecklist from './CloseChecklist'

export default function CloseCycleCard({
  cycle,
  onCompleteTask,
  onGenerateTrialBalance,
  onCompleteClose,
}) {
  const completed = (cycle.tasks || [])
    .filter((task) => task.status === 'completed')
    .length

  return (
    <article className="close-cycle-card">
      <header>
        <div>
          <strong>{cycle.close_reference}</strong>
          <span>{completed}/{cycle.tasks?.length || 0} tasks complete</span>
        </div>

        <span className={`close-cycle-status is-${cycle.status}`}>
          {cycle.status}
        </span>
      </header>

      <CloseChecklist
        tasks={cycle.tasks || []}
        onComplete={onCompleteTask}
      />

      <footer>
        <button
          type="button"
          onClick={() => onGenerateTrialBalance(cycle.id, 'USD', 'final')}
        >
          Generate final trial balance
        </button>

        <button
          type="button"
          onClick={() => onCompleteClose(cycle.id)}
        >
          Complete close
        </button>
      </footer>
    </article>
  )
}

CloseCycleCard.propTypes = {
  cycle: PropTypes.object.isRequired,
  onCompleteTask: PropTypes.func.isRequired,
  onGenerateTrialBalance: PropTypes.func.isRequired,
  onCompleteClose: PropTypes.func.isRequired,
}
