import { useState } from 'react'
import PropTypes from 'prop-types'
import useFinanceReports from '../../hooks/useFinanceReports'

export default function FinanceExportDialog({
  open,
  filters,
  onClose,
  onCreated,
}) {
  const [format, setFormat] = useState('csv')
  const { creating, createExport } = useFinanceReports()

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()

    const job = await createExport({
      exportType: 'dashboard',
      format,
      filters,
    })

    onCreated?.(job)
    onClose()
  }

  return (
    <div className="finance-export-dialog" role="dialog" aria-modal="true">
      <form onSubmit={submit}>
        <header>
          <p className="finance-eyebrow">Finance export</p>
          <h2>Create report</h2>
        </header>

        <label>
          Format
          <select value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={creating}>
            {creating ? 'Preparing…' : 'Create export'}
          </button>
        </footer>
      </form>
    </div>
  )
}

FinanceExportDialog.propTypes = {
  open: PropTypes.bool,
  filters: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
}

FinanceExportDialog.defaultProps = {
  open: false,
  onCreated: null,
}
