function accountingEventIsSatisfied(accountingEvent) {
  if (!accountingEvent) return false;

  if (accountingEvent.ledger_transaction_id) {
    return true;
  }

  return (
    accountingEvent.status === 'posted' &&
    accountingEvent.metadata?.nonPosting === true
  );
}

module.exports = {
  accountingEventIsSatisfied,
};
