'use strict';
const assert = require('node:assert/strict');
const { assertIntegrationUrl } = require('../tests/integrationDatabaseGuard');
for (const host of ['localhost', '127.0.0.1']) assert.doesNotThrow(() => assertIntegrationUrl(`postgresql://user:fake@${host}:5432/mzaya_integration_test`));
for (const url of ['', 'invalid', 'postgres://localhost/mzaya', 'postgres://localhost/mzaya_test', 'postgres://remote/mzaya_integration_test', 'postgres://localhost/mzaya_integration_test?options=x', 'postgres://localhost/mzaya_integration_test#x', 'http://localhost/mzaya_integration_test']) assert.throws(() => assertIntegrationUrl(url));
console.log('PASS: 10 offline database guard cases');
