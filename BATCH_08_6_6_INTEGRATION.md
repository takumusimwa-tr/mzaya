# Batch 08.6.6 Integration

Purpose: turn the proven 08.6.5B staging boot behavior into a repeatable deployment contract.

Changes:
- constrain supported Node to the proven 24.x runtime line;
- add Sequelize CLI migration commands and environment-aware configuration;
- add a no-op migration-history baseline for the already-bootstrapped staging database;
- add reproducible production-dependency audit commands;
- document safe deployment order and the production bootstrap boundary.

Preserved behavior:
- no finance posting semantics changed;
- no external payment/provider behavior changed;
- no business-table DDL is performed by the baseline;
- finance replay safeguards remain unchanged.

Required local gate after overlay:
1. `npm install` (required because sequelize-cli is newly declared; commit resulting package-lock)
2. `npm run test:finance:readiness`
3. `npm run test:finance:observability`
4. `npm run test:finance:stress`
5. `npm run security:audit`

Review audit output before dependency remediation. Do not use `npm audit fix --force`.
