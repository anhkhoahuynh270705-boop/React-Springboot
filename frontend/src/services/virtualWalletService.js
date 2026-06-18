/* eslint-disable no-empty */
const STORAGE_KEYS = {
  BALANCE: 'sandbox_wallet_balance',
  TXNS: 'sandbox_wallet_txns'
};

export function getBalance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return raw ? parseFloat(raw) : 0;
  } catch {
    return 0;
  }
}

export function setBalance(amount) {
  localStorage.setItem(STORAGE_KEYS.BALANCE, String(Math.max(0, Math.floor(amount))));
}

export function addFunds(amount, note = 'Top up') {
  const current = getBalance();
  const next = current + Math.max(0, Math.floor(amount));
  setBalance(next);
  recordTxn({ type: 'topup', amount, note });
  try {
    window.dispatchEvent(new CustomEvent('sandboxWalletUpdated', { detail: { balance: next, type: 'topup', amount } }));
  } catch {}
  return next;
}

export function canPay(amount) {
  return getBalance() >= amount;
}

export function pay(amount, note = 'Payment') {
  if (!canPay(amount)) return false;
  const current = getBalance();
  const next = current - Math.floor(amount);
  setBalance(next);
  recordTxn({ type: 'payment', amount: -Math.floor(amount), note });
  try {
    window.dispatchEvent(new CustomEvent('sandboxWalletUpdated', { detail: { balance: next, type: 'payment', amount: -Math.floor(amount) } }));
  } catch {}
  return true;
}

export function getTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TXNS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordTxn(txn) {
  try {
    const list = getTransactions();
    list.push({ id: Date.now().toString(), at: new Date().toISOString(), ...txn });
    localStorage.setItem(STORAGE_KEYS.TXNS, JSON.stringify(list));
  } catch {}
}


