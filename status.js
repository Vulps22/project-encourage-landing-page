(function () {
  var COMPONENTS_URL = 'https://vulps.instatus.com/v2/components.json';
  var SUMMARY_URL = 'https://vulps.instatus.com/summary.json';
  var GROUP_NAME = 'Truth Or Dare Online 18+';

  function worstColor(statuses) {
    if (statuses.indexOf('MAJOR_OUTAGE') !== -1) return 'red';
    for (var i = 0; i < statuses.length; i++) {
      var s = statuses[i];
      if (s === 'DEGRADED_PERFORMANCE' || s === 'PARTIAL_OUTAGE' || s === 'UNDER_MAINTENANCE') return 'amber';
    }
    return 'green';
  }

  function applyStatus(color, hasIncidents) {
    var dot = document.getElementById('status-dot');
    if (dot) {
      if (hasIncidents) {
        dot.className = 'status-incident';
        dot.textContent = '⚠️';
      } else {
        dot.className = 'status-dot status-' + color;
        dot.textContent = '';
      }
    }
  }

  function fetchStatus() {
    Promise.all([
      fetch(COMPONENTS_URL).then(function (r) { return r.json(); }),
      fetch(SUMMARY_URL).then(function (r) { return r.json(); })
    ]).then(function (results) {
      var compData = results[0];
      var summaryData = results[1];

      var components = compData.components || [];
      var relevant = components.filter(function (c) {
        return c.name === GROUP_NAME || (c.group && c.group.name === GROUP_NAME);
      });

      var statuses = relevant.map(function (c) { return c.status; });
      var color = statuses.length ? worstColor(statuses) : 'amber';
      var hasIncidents = Array.isArray(summaryData.activeIncidents) && summaryData.activeIncidents.length > 0;

      applyStatus(color, hasIncidents);
    }).catch(function () {
      // leave dot in loading state on error
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchStatus);
  } else {
    fetchStatus();
  }
})();
