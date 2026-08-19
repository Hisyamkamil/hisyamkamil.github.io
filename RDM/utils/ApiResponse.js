// Universal normalizer utility for API responses
// Works both in ExtJS runtime (via Ext.define) and Node tests (via module.exports)

 (function (root, factory) {
   if (typeof module === 'object' && module.exports) {
     module.exports = factory();
   } else if (typeof root !== 'undefined') {
     var api = factory();
     if (root.Ext && root.Ext.define) {
       root.Ext.define('Store.rdmtoken.utils.ApiResponse', {
         statics: {
           normalizeDashboardResponse: api.normalizeDashboardResponse,
           normalizeContractsListResponse: api.normalizeContractsListResponse,
           normalizeContractGetBySerial: api.normalizeContractGetBySerial,
           // New generic helpers for FE success handling
           unwrap2xx: api.unwrap2xx,
           extractErrorMessage: api.extractErrorMessage
         }
       });
     }
     root.RDMApiResponse = api;
   }
 })(typeof window !== 'undefined' ? window : global, function () {
  function normalizeDashboardResponse(raw) {
    var overview = (raw && raw.overview) ? raw.overview : {};
    return {
      overview: {
        totalRequestedTokens: toNumber(overview.totalRequestedTokens, 0),
        totalActiveTokens: toNumber(overview.totalActiveTokens, 0),
        totalExpiredTokens: toNumber(overview.totalExpiredTokens, 0),
        pendingApprovals: toNumber(overview.pendingApprovals, 0)
      }
    };
  }

  function normalizeContractsListResponse(raw) {
    var contracts = Array.isArray(raw && raw.contracts) ? raw.contracts : [];
    var pagination = raw ? raw.pagination || null : null;
    return { contracts: contracts, pagination: pagination };
  }

  function normalizeContractGetBySerial(raw) {
    var list = normalizeContractsListResponse(raw);
    return (list.contracts && list.contracts.length > 0) ? list.contracts[0] : null;
  }

  // -------- Generic API success handling (wrapped-or-raw 2xx) --------
  // Accepts either:
  //  - Ext.Ajax response object: { status: <number>, responseText: <json-string> }
  //  - Already-parsed object: { status, body } or plain raw payload
  // Returns { ok: boolean, data?: any, status?: number, error?: string }
  function unwrap2xx(input) {
    var httpStatus = 200; // optimistic default for already-parsed payloads
    var parsed = null;

    try {
      if (input && typeof input === 'object' && typeof input.responseText === 'string') {
        httpStatus = Number(input.status) || 0;
        parsed = safeJsonParse(input.responseText);
      } else if (typeof input === 'string') {
        parsed = safeJsonParse(input);
      } else {
        parsed = input; // assume already-parsed object
      }

      // Classic wrapped format: { status: 200, body: {...} }
      if (parsed && typeof parsed === 'object' && Number(parsed.status) === 200 && parsed.body) {
        return { ok: true, data: parsed.body, status: 200 };
      }

      // Raw payload on HTTP 2xx
      if (httpStatus >= 200 && httpStatus < 300) {
        return { ok: true, data: parsed, status: httpStatus };
      }

      return { ok: false, error: extractErrorMessage(parsed), status: httpStatus };
    } catch (e) {
      return { ok: false, error: 'Failed to parse server response' };
    }
  }

  function extractErrorMessage(obj) {
    if (!obj) return 'Unknown error';
    if (obj.body && (obj.body.message || obj.body.error)) return obj.body.message || obj.body.error;
    if (obj.message) return obj.message;
    if (obj.error) return obj.error;
    if (Array.isArray(obj.errors) && obj.errors.length) return obj.errors[0];
    return 'Request failed';
  }

  function safeJsonParse(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function toNumber(value, dflt) {
    var n = Number(value);
    return isNaN(n) ? dflt : n;
  }

  return {
    normalizeDashboardResponse: normalizeDashboardResponse,
    normalizeContractsListResponse: normalizeContractsListResponse,
    normalizeContractGetBySerial: normalizeContractGetBySerial,
    unwrap2xx: unwrap2xx,
    extractErrorMessage: extractErrorMessage
  };
});
