import { D } from './data/index.js';
import { $ } from './dom.js';

export function renderMonsters() {
  var monsters = D.bestiario || [];
  var crFilter = $('monster-cr-filter').value;
  var search = $('monster-search').value.trim().toLowerCase();
  var filtered = monsters.filter(function(m) {
    if (crFilter && m.cr !== crFilter) return false;
    if (search && !m.nombre.toLowerCase().includes(search)) return false;
    return true;
  });
  var el = $('monster-list');
  if (!filtered.length) { el.innerHTML = '<div class="empty-state">No se encontraron monstruos</div>'; return; }
  el.innerHTML = filtered.map(function(m) {
    var abils = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
    var statVals = [m.fuer || 10, m.des || 10, m.con || 10, m.int || 10, m.sab || 10, m.car || 10];
    var statRow = abils.map(function(a, i) {
      var mod = Math.floor((statVals[i] - 10) / 2);
      return a + ' ' + statVals[i] + ' (' + (mod >= 0 ? '+' : '') + mod + ')';
    }).join(' | ');
    var skillsHtml = m.habilidades && Object.keys(m.habilidades).length ? Object.entries(m.habilidades).map(function(_a) { return '<span class="spell-tag">' + _a[0] + ' ' + _a[1] + '</span>'; }).join('') : '';
    var actionsHtml = (m.acciones || []).map(function(a) { return '<div style="font-size:11px;margin:2px 0"><strong style="color:var(--accent)">' + a.nombre + '.</strong> ' + a.desc + '</div>'; }).join('');
    var traitsHtml = (m.rasgos || []).map(function(t) { return '<div style="font-size:11px;margin:2px 0"><strong>' + t.nombre + '.</strong> ' + t.desc + '</div>'; }).join('');
    return '<div class="spell-card"><div class="spell-name">' + m.nombre + ' <span style="font-size:11px;color:var(--text-dim);font-weight:normal">CR ' + m.cr + ' · ' + (m.tamaño || '') + ' ' + (m.tipo || '') + '</span></div>' +
      '<div class="spell-meta"><span>CA ' + m.ca + '</span><span>PG ' + m.pg + '</span><span>Vel ' + (m.velocidad || '—') + '</span></div>' +
      '<div style="font-size:10px;color:var(--text-dim);margin:4px 0">' + statRow + '</div>' +
      (skillsHtml ? '<div style="margin:2px 0">' + skillsHtml + '</div>' : '') +
      (traitsHtml ? '<div style="margin:4px 0;border-top:1px solid var(--bg3);padding-top:4px">' + traitsHtml + '</div>' : '') +
      (actionsHtml ? '<div style="margin:4px 0;border-top:1px solid var(--bg3);padding-top:4px"><strong style="font-size:11px;color:var(--accent)">Acciones</strong>' + actionsHtml + '</div>' : '') + '</div>';
  }).join('');
}

export function initMonsterEvents() {
  $('monster-cr-filter').addEventListener('change', renderMonsters);
  $('monster-search').addEventListener('input', renderMonsters);
}