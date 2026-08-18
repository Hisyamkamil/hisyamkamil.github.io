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
          normalizeContractGetBySerial: api.normalizeContractGetBySerial
        }
      });
    }
    // Also expose on global for non-Ext contexts
    root.RDMApiResponse = api;
  }
})(typeof window !== 'undefined' ? window : global, function () {
  function isEnvelope(obj) {
    return obj && typeof obj === 'object' && 'status' in obj && 'body' in obj;
  }

  function unwrap(obj) {
    return isEnvelope(obj) ? (obj.body || {}) : obj || {};
  }

  function normalizeDashboardResponse(raw) {
    var body = unwrap(raw);
    var overview = body.overview || body.data?.overview || {};
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
    var body = unwrap(raw);
    var contracts = Array.isArray(body.contracts) ? body.contracts : [];
    var pagination = body.pagination || null;
    return { contracts: contracts, pagination: pagination };
  }

  function normalizeContractGetBySerial(raw) {
    var list = normalizeContractsListResponse(raw);
    return (list.contracts && list.contracts.length > 0) ? list.contracts[0] : null;
  }

  function toNumber(value, dflt) {
    var n = Number(value);
    return isNaN(n) ? dflt : n;
  }

  return {
    normalizeDashboardResponse: normalizeDashboardResponse,
    normalizeContractsListResponse: normalizeContractsListResponse,
    normalizeContractGetBySerial: normalizeContractGetBySerial
  };
});
