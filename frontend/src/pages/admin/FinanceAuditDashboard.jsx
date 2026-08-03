import useFinanceAudits from '../../hooks/useFinanceAudits'
import AuditPlanCard from '../../components/finance/AuditPlanCard'
import ControlAssessmentCard from '../../components/finance/ControlAssessmentCard'
import '../../components/finance/financeAudit.css'

export default function FinanceAuditDashboard() {
  const {
    plans,
    engagements,
    assessments,
    evidence,
    loading,
  } = useFinanceAudits()

  if (loading) {
    return <p className="finance-audit-state">Loading finance assurance…</p>
  }

  return (
    <main className="finance-audit-page">
      <header>
        <p className="finance-eyebrow">Finance assurance</p>
        <h1>Audit & controls</h1>
        <p>
          Audit plans, control effectiveness, evidence, findings, and remediation.
        </p>
      </header>

      <section className="finance-audit-kpis">
        <article>
          <span>Audit plans</span>
          <strong>{plans.length}</strong>
        </article>
        <article>
          <span>Engagements</span>
          <strong>{engagements.length}</strong>
        </article>
        <article>
          <span>Assessments</span>
          <strong>{assessments.length}</strong>
        </article>
        <article>
          <span>Evidence items</span>
          <strong>{evidence.length}</strong>
        </article>
      </section>

      <section className="finance-audit-grid">
        <div>
          <h2>Audit plans</h2>
          <div className="audit-plan-grid">
            {plans.map((plan) => (
              <AuditPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        <div>
          <h2>Latest assessments</h2>
          <div className="assessment-grid">
            {assessments.map((assessment) => (
              <ControlAssessmentCard
                key={assessment.id}
                assessment={assessment}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
