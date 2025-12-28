const { getReasonPhrase } = require('http-status-codes');

function createProblemDetails({ type = 'about:blank', title, status, detail, instance, extras }) {
    const pd = { type, status };
    pd.title = title || (status ? getReasonPhrase(status) : undefined);
    if (detail) pd.detail = detail;
    if (instance) pd.instance = instance;
    if (extras && typeof extras === 'object') Object.assign(pd, extras);
    return pd;
}

function sendProblemDetails(res, opts) {
    const pd = createProblemDetails(opts);
    if (!pd.status) pd.status = 500;
    res.set('Content-Type', 'application/problem+json');
    res.status(pd.status).json(pd);
}

module.exports = { createProblemDetails, sendProblemDetails };