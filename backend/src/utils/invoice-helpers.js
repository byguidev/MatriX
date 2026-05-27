const BILLING_CYCLE_DAYS = {
    DIARIA: 1,
    SEMANAL: 7,
    MENSAL: 30,
    ANUAL: 365,
};

function normalizeBillingCycle(value) {
    if (!value) return null;
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function getBillingCycleDays(value) {
    const normalized = normalizeBillingCycle(value);
    return normalized ? BILLING_CYCLE_DAYS[normalized] : null;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

module.exports = {
    addDays,
    getBillingCycleDays,
    normalizeBillingCycle,
};
