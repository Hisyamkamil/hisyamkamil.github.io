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
