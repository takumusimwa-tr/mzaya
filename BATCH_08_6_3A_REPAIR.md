# Batch 08.6.3A — Missing Finance Model Repair

The finance stress suite failed before running any tests because `associations.js`
referenced seven Batch 08.5.8 Sequelize model modules that were absent from the
repository.

This repair adds those seven models directly from the existing
`finance_cross_domain_cutover.sql` schema and completes the inverse Sequelize
associations used by cutover/reconciliation.

No finance behavior or test expectations were weakened.

After overlaying this batch, rerun:

    cd backend
    npm run test:finance:stress

If another failure appears, send the full output; that will be the next runtime
failure rather than this module-resolution blocker.
