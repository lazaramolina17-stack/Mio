import { D } from './data/index.js';
import { $ } from './dom.js';

export function renderSpells() {
  var spells = D.spells || [];
  var classFilter = $('spell-class-filter').value;
  var levelFilter = $('spell-level-filter').value;
  var schoolFilter = $('spell-school-filter').value;
  var search = $('spell-search').value.trim().toLowerCase();
  var filtered = spells.filter(function(s) {
    if (classFilter && (!s.classes || !s.classes.includes(classFilter))) return false;
    if (levelFilter && s.level !== parseInt(levelFilter)) return false;
    if (schoolFilter && s.school !== schoolFilter) return false;
    if (search && !s.name.toLowerCase().includes(search)) return false;
    return true;
  });
  var el = $('spell-list');
  if (!filtered.length) { el.innerHTML = '<div class="empty-state">No se encontraron hechizos</div>'; return; }
  el.innerHTML = filtered.map(function(s) {
    var levelWord = s.level === 0 ? 'Truco' : (s.level === 1 ? 'Nivel 1' : 'Nivel ' + s.level);
    var schoolColor = s.school === 'Ilusión' ? '#b07cc9' : s.school === 'Nigromancia' ? '#6b8e6b' : s.school === 'Evocación' ? '#c97a3a' : s.school === 'Encantamiento' ? '#c97a9a' : s.school === 'Adivinación' ? '#7a9ac9' : s.school === 'Ablación' ? '#7ac9b0' : s.school === 'Transmutación' ? '#c9b07a' : s.school === 'Conjuración' ? '#7ac97a' : 'var(--text-dim)';
    return '<div class="spell-card"><div class="spell-name">' + s.name + '</div><div class="spell-meta"><span>🔮 ' + levelWord + ' ' + s.school + '</span><span>⏱ ' + (s.castingTime || '—') + '</span><span>📏 ' + (s.range || '—') + '</span><span>⏳ ' + (s.duration || '—') + '</span></div><div class="spell-desc">' + (s.description || '') + '</div></div>';
  }).join('');
}

export function initSpellEvents() {
  $('spell-class-filter').addEventListener('change', renderSpells);
  $('spell-level-filter').addEventListener('change', renderSpells);
  $('spell-school-filter').addEventListener('change', renderSpells);
  $('spell-search').addEventListener('input', renderSpells);
}