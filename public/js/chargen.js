import { D } from './data/index.js';
import { state } from './state.js';
import { $, DOM } from './dom.js';

export function initSelects() {
  var races = D.races || [];
  races.forEach(function(r) {
    var o = document.createElement('option');
    o.value = r.name;
    o.textContent = r.name;
    DOM.raceSel.appendChild(o);
  });
  var classes = D.classes || [];
  classes.forEach(function(c) {
    var o = document.createElement('option');
    o.value = c.name;
    o.textContent = c.name;
    DOM.classSel.appendChild(o);
  });
  var bgs = D.backgrounds || [];
  bgs.forEach(function(b) {
    var o = document.createElement('option');
    o.value = b.name;
    o.textContent = b.name;
    DOM.bgSel.appendChild(o);
  });
  var spells = D.spells || [];
  var classesSet = new Set();
  spells.forEach(function(s) { (s.classes || []).forEach(function(cl) { classesSet.add(cl); }); });
  var sortedClasses = [...classesSet].sort();
  var classFilter = $('spell-class-filter');
  sortedClasses.forEach(function(cl) {
    var o = document.createElement('option');
    o.value = cl; o.textContent = cl;
    classFilter.appendChild(o);
  });
  var levelFilter = $('spell-level-filter');
  for (var i = 1; i <= 9; i++) {
    var o = document.createElement('option');
    o.value = i; o.textContent = 'Nivel ' + i;
    levelFilter.appendChild(o);
  }
  var schoolsSet = new Set();
  spells.forEach(function(s) { if (s.school) schoolsSet.add(s.school); });
  var schoolFilter = $('spell-school-filter');
  [...schoolsSet].sort().forEach(function(sc) {
    var o = document.createElement('option');
    o.value = sc; o.textContent = sc;
    schoolFilter.appendChild(o);
  });
  var diceGrid = $('dice-grid');
  [4, 6, 8, 10, 12, 20, 100].forEach(function(d) {
    var btn = document.createElement('button');
    btn.className = 'dice-btn';
    btn.innerHTML = 'd' + d + '<span class="label">' + (d === 100 ? '&#37;' : '') + '</span>';
    btn.dataset.dice = d;
    btn.addEventListener('click', function() { rollDice(1, d); });
    diceGrid.appendChild(btn);
  });
  var crs = new Set();
  (D.bestiario || []).forEach(function(m) { crs.add(m.cr); });
  var crFilter = $('monster-cr-filter');
  [...crs].sort().forEach(function(cr) {
    var o = document.createElement('option');
    o.value = cr; o.textContent = 'CR ' + cr;
    crFilter.appendChild(o);
  });
}

export function initCharEvents() {
  DOM.raceSel.addEventListener('change', function() {
    var race = D.races ? D.races.find(function(r) { return r.name === this.value; }.bind(this)) : null;
    DOM.subraceGroup.style.display = 'none';
    DOM.subraceSel.innerHTML = '<option value="">—</option>';
    if (race && race.subraces && race.subraces.length) {
      race.subraces.forEach(function(sr) {
        var o = document.createElement('option');
        o.value = sr; o.textContent = sr;
        DOM.subraceSel.appendChild(o);
      });
      DOM.subraceGroup.style.display = 'block';
    }
  });

  var lastClassInfo = null;
  DOM.classSel.addEventListener('change', function() {
    var cls = D.classes ? D.classes.find(function(c) { return c.name === this.value; }.bind(this)) : null;
    if (lastClassInfo) { lastClassInfo.remove(); lastClassInfo = null; }
    if (!cls) return;
    var div = document.createElement('div');
    div.className = 'sheet';
    div.style.marginBottom = '8px';
    div.style.fontSize = '12px';
    var html = '<strong style="color:var(--accent)">' + cls.name + '</strong><br>';
    if (cls.hitDie) html += 'Dado de Golpe: <span class="badge">d' + cls.hitDie + '</span><br>';
    if (cls.armor) html += 'Armaduras: ' + cls.armor + '<br>';
    if (cls.weapons) html += 'Armas: ' + cls.weapons + '<br>';
    if (cls.savingThrows) html += 'Tiradas Salvación: ' + cls.savingThrows.join(', ') + '<br>';
    if (cls.skills) html += 'Habilidades: ' + cls.skills.join(', ') + '<br>';
    div.innerHTML = html;
    DOM.classSel.parentNode.parentNode.insertAdjacentElement('afterend', div);
    lastClassInfo = div;
  });

  $('roll-stats-btn').addEventListener('click', function() {
    var method = $('stat-method').value;
    var scores;
    if (method === 'standard') {
      scores = [15, 14, 13, 12, 10, 8];
    } else {
      scores = [];
      for (var i = 0; i < 6; i++) {
        var rolls = [];
        for (var j = 0; j < 4; j++) rolls.push(Math.floor(Math.random() * 6) + 1);
        rolls.sort(function(a, b) { return a - b; });
        rolls.shift();
        scores.push(rolls.reduce(function(s, v) { return s + v; }, 0));
      }
    }
    state.rolledScores = scores;
    state.selectedStat = null;
    state.assigned = {};
    renderStatGrid(scores);
    DOM.assignSection.style.display = 'block';
    renderAssignGrid();
    DOM.generateBtn.textContent = 'Generar Personaje';
  });

  DOM.generateBtn.addEventListener('click', generateCharacter);
}

export function renderStatGrid(scores) {
  var abils = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  DOM.statGrid.innerHTML = '';
  scores.forEach(function(sc, i) {
    var card = document.createElement('div');
    card.className = 'stat-card';
    var mod = Math.floor((sc - 10) / 2);
    var modStr = (mod >= 0 ? '+' : '') + mod;
    card.innerHTML = '<div class="stat-label">' + abils[i] + '</div><div class="stat-value">' + sc + '</div><div class="stat-mod">(' + modStr + ')</div>';
    card.dataset.idx = i;
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      state.selectedStat = i;
      document.querySelectorAll('.stat-card').forEach(function(c) { c.classList.remove('selected'); });
      this.classList.add('selected');
      renderAssignGrid();
    });
    DOM.statGrid.appendChild(card);
  });
}

export function renderAssignGrid() {
  var abils = ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'];
  var abilsShort = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  DOM.assignGrid.innerHTML = '';
  var assignedScores = Object.values(state.assigned);
  var usedIndices = {};
  state.rolledScores.forEach(function(sc, idx) {
    var pos = assignedScores.indexOf(sc);
    if (pos !== -1) {
      usedIndices[idx] = true;
      assignedScores[pos] = null;
    }
  });
  var html = '<table class="rules-table" style="margin-bottom:0"><thead><tr><th>Habilidad</th><th>Puntaje</th><th>Mod</th><th></th></tr></thead><tbody>';
  abils.forEach(function(a, i) {
    var assigned = state.assigned[abilsShort[i]];
    var mod = assigned !== undefined ? Math.floor((assigned - 10) / 2) : 0;
    var modStr = assigned !== undefined ? ((mod >= 0 ? '+' : '') + mod) : '—';
    var valStr = assigned !== undefined ? assigned : '—';
    var canAssign = assigned === undefined && state.selectedStat !== null && state.rolledScores[state.selectedStat] !== undefined && !usedIndices[state.selectedStat];
    html += '<tr><td>' + a + '</td><td>' + valStr + '</td><td>' + modStr + '</td><td>';
    if (canAssign) {
      html += '<button class="btn btn-sm" data-abil="' + abilsShort[i] + '" data-idx="' + state.selectedStat + '">Asignar</button>';
    } else if (assigned !== undefined) {
      html += '<button class="btn btn-sm btn-danger" data-clear="' + abilsShort[i] + '">X</button>';
    }
    html += '</td></tr>';
  });
  html += '</tbody></table>';
  DOM.assignGrid.innerHTML = html;
  DOM.assignGrid.querySelectorAll('[data-abil]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var abil = this.dataset.abil;
      var idx = parseInt(this.dataset.idx);
      var score = state.rolledScores[idx];
      if (state.assigned[abil] !== undefined) return;
      state.assigned[abil] = score;
      state.selectedStat = null;
      document.querySelectorAll('.stat-card').forEach(function(c) { c.classList.remove('selected'); });
      renderAssignGrid();
    });
  });
  DOM.assignGrid.querySelectorAll('[data-clear]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      delete state.assigned[this.dataset.clear];
      renderAssignGrid();
    });
  });
}

function generateCharacter() {
  var name = $('char-name').value.trim() || 'Sin nombre';
  var level = parseInt($('char-level').value) || 1;
  var raceName = DOM.raceSel.value;
  var subraceName = DOM.subraceSel.value;
  var className = DOM.classSel.value;
  var bgName = DOM.bgSel.value;
  if (!raceName || !className) { alert('Selecciona al menos raza y clase.'); return; }
  var assigned = state.assigned;
  var abilsShort = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  var missing = abilsShort.filter(function(a) { return assigned[a] === undefined; });
  if (missing.length) { alert('Asigna todos los puntajes de habilidad antes de generar.'); return; }
  var race = D.races ? D.races.find(function(r) { return r.name === raceName; }) : null;
  var cls = D.classes ? D.classes.find(function(c) { return c.name === className; }) : null;
  var bg = D.backgrounds ? D.backgrounds.find(function(b) { return b.name === bgName; }) : null;
  var scores = {};
  abilsShort.forEach(function(a) {
    var base = assigned[a];
    if (race) {
      if (race.bonuses && race.bonuses[a]) base += race.bonuses[a];
    }
    if (subraceName && D.subraces) {
      var sr = D.subraces.find(function(s) { return s.nombre === subraceName; });
      if (sr && sr.bonuses && sr.bonuses[a]) base += sr.bonuses[a];
    }
    scores[a] = base;
  });
  var mods = {};
  Object.keys(scores).forEach(function(k) { mods[k] = Math.floor((scores[k] - 10) / 2); });
  var hp = cls ? (cls.hitDie || 8) + mods['CON'] : 8 + mods['CON'];
  var ca = 10 + mods['DES'];
  var caDetail = '';
  var armorList = (D.equipo && D.equipo.armaduras) || [];
  if (state.equippedItems && state.equippedItems.armor) {
    var armor = armorList.find(function(a) { return a.nombre === state.equippedItems.armor; });
    if (armor) {
      if (armor.tipo === 'Ligera') { ca = armor.ca + mods['DES']; caDetail = armor.nombre + ' (CA base ' + armor.ca + ' + DES)'; }
      else if (armor.tipo === 'Media') { var desMax = Math.min(mods['DES'], 2); ca = armor.ca + desMax; caDetail = armor.nombre + ' (CA base ' + armor.ca + ' + DES máx 2)'; }
      else if (armor.tipo === 'Pesada') { ca = armor.ca; caDetail = armor.nombre + ' (CA fija ' + armor.ca + ')'; }
    }
  }
  if (state.equippedItems && state.equippedItems.shield) { ca += 2; if (!caDetail) caDetail = 'Escudo (+2)'; else caDetail += ' + Escudo (+2)'; }
  var speed = (race && race.velocidad) ? race.velocidad + (subraceName === 'Wood Elf' ? 5 : 0) : 30;
  var languages = (race && race.idiomas) ? race.idiomas.join(', ') : '—';
  var html = '<div class="sheet"><h2>' + name + ' <span style="font-size:11px;color:var(--text-dim)">Nv.' + level + '</span></h2>';
  html += '<div style="margin-bottom:8px;font-size:12px"><span class="badge">' + raceName + '</span>';
  if (subraceName) html += ' <span class="badge badge-danger">' + subraceName + '</span>';
  html += ' <span class="badge">' + className + '</span>';
  if (bg) html += ' <span class="badge">' + bgName + '</span></div>';
  html += '<div style="font-size:12px;display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px">';
  html += '<div><span style="color:var(--text-dim)">CA:</span> <span style="font-weight:bold;color:var(--accent)">' + ca + '</span>' + (caDetail ? ' <span style="font-size:10px;color:var(--text-dim)">(' + caDetail + ')</span>' : '') + '</div>';
  html += '<div><span style="color:var(--text-dim)">Velocidad:</span> <span style="font-weight:bold">' + speed + ' pies</span></div>';
  html += '<div><span style="color:var(--text-dim)">Idiomas:</span> <span style="font-weight:bold">' + languages + '</span></div></div>';
  html += '<table class="rules-table" style="margin-bottom:8px"><thead><tr>';
  abilsShort.forEach(function(a) { html += '<th>' + a + '</th>'; });
  html += '</tr></thead><tbody><tr>';
  abilsShort.forEach(function(a) { html += '<td style="text-align:center;font-weight:bold;font-size:15px;color:var(--accent)">' + scores[a] + '</td>'; });
  html += '</tr><tr>';
  abilsShort.forEach(function(a) { var m = mods[a]; var ms = (m >= 0 ? '+' : '') + m; html += '<td style="text-align:center;font-size:12px">(' + ms + ')</td>'; });
  html += '</tr></tbody></table>';
  html += '<div style="font-size:12px;display:flex;gap:16px;flex-wrap:wrap">';
  html += '<div><span style="color:var(--text-dim)">PG:</span> <span style="color:var(--hp-red);font-weight:bold">' + hp + '</span></div>';
  html += '<div><span style="color:var(--text-dim)">Iniciativa:</span> <span style="font-weight:bold">' + (mods['DES'] >= 0 ? '+' : '') + mods['DES'] + '</span></div>';
  html += '<div><span style="color:var(--text-dim)">Percepción pasiva:</span> <span style="font-weight:bold">' + (10 + mods['SAB']) + '</span></div>';
  if (cls && cls.savingThrows) {
    html += '<div><span style="color:var(--text-dim)">Salvación:</span> ';
    html += (cls.savingThrows || []).map(function(st) { return '<span class="badge">' + st + '</span>'; }).join(' ');
    html += '</div>';
  }
  html += '</div></div>';
  (function() {
    var abilityKeys = { 'Fuerza': 'FUE', 'Destreza': 'DES', 'Constitución': 'CON', 'Inteligencia': 'INT', 'Sabiduría': 'SAB', 'Carisma': 'CAR' };
    var skillData = D.skillsByAbility || {};
    var skillHtml = '<div class="sheet"><h2>Habilidades</h2>';
    Object.entries(skillData).forEach(function(_a) {
      var abil = _a[0], skills = _a[1];
      if (!skills || !skills.length) return;
      skills.forEach(function(skill) {
        var abilShort = abilityKeys[abil] || 'FUE';
        var m = typeof mods[abilShort] === 'number' ? mods[abilShort] : 0;
        var ms = (m >= 0 ? '+' : '') + m;
        var isProf = cls && cls.competencias && cls.competencias.habilidades && cls.competencias.habilidades.includes(skill);
        var profDot = isProf ? '●' : '○';
        skillHtml += '<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid var(--bg3)"><span>' + profDot + ' ' + skill + '</span><span style="color:var(--accent)">' + ms + '</span></div>';
      });
    });
    skillHtml += '</div>';
    html += skillHtml;
  })();
  if (cls && cls.spellSlots) {
    var slots = cls.spellSlots[level - 1] || [];
    if (slots.some(function(s) { return s > 0; })) {
      var slotHtml = '<div class="sheet"><h2>Espacios de Hechizo</h2><div style="display:flex;flex-wrap:wrap;gap:4px">';
      var levelNames = ['Nv.1', 'Nv.2', 'Nv.3', 'Nv.4', 'Nv.5', 'Nv.6', 'Nv.7', 'Nv.8', 'Nv.9'];
      slots.forEach(function(s, i) { if (s > 0) slotHtml += '<span class="badge" style="background:var(--accent);color:#fff">' + levelNames[i] + ': x' + s + '</span>'; });
      slotHtml += '</div></div>';
      html += slotHtml;
    }
  }
  if (state.equippedItems && (state.equippedItems.armor || state.equippedItems.weapon)) {
    var eqHtml = '<div class="sheet"><h2>Equipado</h2><div style="font-size:12px">';
    if (state.equippedItems.weapon) eqHtml += '<div>🔪 ' + state.equippedItems.weapon + '</div>';
    if (state.equippedItems.armor) eqHtml += '<div>🛡️ ' + state.equippedItems.armor + '</div>';
    eqHtml += '</div></div>';
    html += eqHtml;
  }
  if (race && race.rasgos && race.rasgos.length) {
    html += '<div class="sheet"><h2>Rasgos Raciales</h2>';
    race.rasgos.forEach(function(t) {
      html += '<div style="margin-bottom:6px"><strong style="color:var(--accent);font-size:12px">' + t.nombre + '</strong><p style="font-size:11px;color:var(--text-dim);margin-top:2px">' + (t.descripcion || '') + '</p></div>';
    });
    html += '</div>';
  }
  if (subraceName && D.subraces) {
    var srData = D.subraces.find(function(s) { return s.nombre === subraceName; });
    if (srData && srData.rasgos && srData.rasgos.length) {
      html += '<div class="sheet"><h2>Rasgos de ' + subraceName + '</h2>';
      srData.rasgos.forEach(function(t) {
        html += '<div style="margin-bottom:6px"><strong style="color:var(--accent);font-size:12px">' + t.nombre + '</strong><p style="font-size:11px;color:var(--text-dim);margin-top:2px">' + (t.descripcion || '') + '</p></div>';
      });
      html += '</div>';
    }
  }
  state.character = { name: name, level: level, race: raceName, subrace: subraceName, class: className, bg: bgName, scores: scores, mods: mods, hp: hp, equipment: state.equippedItems };
  try { localStorage.setItem('dnd_last_char', JSON.stringify(state.character)); } catch (e) {}
  DOM.charOutput.innerHTML = html;
  DOM.charOutput.classList.remove('hidden');
  DOM.charForm.querySelector('#generate-btn').textContent = 'Regenerar Personaje';
}

export function initSaveLoad() {
  function updateLoadList() {
    var sel = $('load-char-select');
    var current = sel.value;
    sel.innerHTML = '<option value="">— Cargar personaje —</option>';
    try {
      var keys = Object.keys(localStorage).filter(function(k) { return k.startsWith('dnd_char_'); });
      keys.sort().forEach(function(k) {
        var o = document.createElement('option');
        o.value = k;
        o.textContent = k.replace('dnd_char_', '');
        sel.appendChild(o);
      });
    } catch (e) {}
    if (current && [...sel.options].some(function(o) { return o.value === current; })) sel.value = current;
  }
  $('save-char-btn').addEventListener('click', function() {
    var name = $('char-name').value.trim() || 'Sin nombre';
    if (!state.character) { alert('Primero genera un personaje.'); return; }
    var key = 'dnd_char_' + name;
    try { localStorage.setItem(key, JSON.stringify(state.character)); updateLoadList(); alert('Personaje "' + name + '" guardado.'); } catch (e) { alert('Error al guardar.'); }
  });
  $('load-char-select').addEventListener('change', function() {
    if (!this.value) return;
    try {
      var data = JSON.parse(localStorage.getItem(this.value));
      if (!data) return;
      $('char-name').value = data.name || '';
      DOM.raceSel.value = data.race || '';
      DOM.raceSel.dispatchEvent(new Event('change'));
      if (data.subrace) { DOM.subraceSel.value = data.subrace; }
      DOM.classSel.value = data.class || '';
      DOM.classSel.dispatchEvent(new Event('change'));
      DOM.bgSel.value = data.bg || '';
      if (data.scores) {
        state.assigned = {};
        var abilsShort = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
        abilsShort.forEach(function(a) { if (data.scores[a] !== undefined) state.assigned[a] = data.scores[a]; });
        state.rolledScores = abilsShort.map(function(a) { return data.scores[a] || 10; });
        renderStatGrid(state.rolledScores);
        DOM.assignSection.style.display = 'block';
        renderAssignGrid();
      }
      DOM.generateBtn.click();
    } catch (e) { alert('Error al cargar personaje.'); }
  });
  $('delete-char-btn').addEventListener('click', function() {
    var name = $('load-char-select').value;
    if (!name) { alert('Selecciona un personaje para eliminar.'); return; }
    if (!confirm('Eliminar "' + name.replace('dnd_char_', '') + '"?')) return;
    try { localStorage.removeItem(name); updateLoadList(); alert('Eliminado.'); } catch (e) {}
  });
  updateLoadList();
}

export function rollDice(count, sides) {
  var rolls = [];
  for (var i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
  var total = rolls.reduce(function(s, v) { return s + v; }, 0);
  var numEl = $('dice-number');
  var detailEl = $('dice-detail');
  if (numEl.classList.contains('roll-anim')) { numEl.classList.remove('roll-anim'); void numEl.offsetWidth; }
  numEl.textContent = total;
  numEl.classList.add('roll-anim');
  if (count > 1) { detailEl.textContent = count + 'd' + sides + ' = [' + rolls.join(', ') + '] = ' + total; }
  else { detailEl.textContent = 'd' + sides + ' = ' + total; }
  var now = new Date();
  var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  state.history.unshift({ label: count + 'd' + sides, total: total, detail: '[' + rolls.join(', ') + ']', time: timeStr });
  if (state.history.length > 10) state.history.pop();
  renderHistory();
}

function renderHistory() {
  var el = $('roll-history');
  if (!state.history.length) { el.innerHTML = '<div class="empty-state">Sin tiradas aún</div>'; return; }
  el.innerHTML = state.history.map(function(h) {
    return '<div class="history-item"><span><span class="roll">' + h.label + '</span> <span class="total">' + h.total + '</span> <span style="color:var(--text-dim)">' + h.detail + '</span></span><span class="time">' + h.time + '</span></div>';
  }).join('');
}

export function initDiceEvents() {
  $('roll-custom-btn').addEventListener('click', function() {
    var input = $('custom-roll').value.trim().toLowerCase();
    if (!input) return;
    var m = input.match(/^(\d+)?d(\d+)([+-]\d+)?$/);
    if (!m) { alert('Formato: 2d20+4'); return; }
    var count = parseInt(m[1]) || 1;
    var sides = parseInt(m[2]);
    var mod = parseInt(m[3]) || 0;
    if (count < 1 || sides < 2 || isNaN(count) || isNaN(sides)) { alert('Tirada inválida.'); return; }
    var rolls = [];
    for (var i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
    var total = rolls.reduce(function(s, v) { return s + v; }, 0) + mod;
    var numEl = $('dice-number');
    if (numEl.classList.contains('roll-anim')) { numEl.classList.remove('roll-anim'); void numEl.offsetWidth; }
    numEl.textContent = total;
    numEl.classList.add('roll-anim');
    var detail = count + 'd' + sides;
    if (mod) detail += (mod > 0 ? '+' : '') + mod;
    detail += ' = [' + rolls.join(', ') + ']';
    if (mod) detail += ' + (' + (mod >= 0 ? '+' : '') + mod + ')';
    detail += ' = ' + total;
    $('dice-detail').textContent = detail;
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.history.unshift({ label: count + 'd' + sides + (mod ? (mod > 0 ? '+' : '') + mod : ''), total: total, detail: '[' + rolls.join(', ') + ']' + (mod ? ' ' + (mod >= 0 ? '+' : '') + mod : ''), time: timeStr });
    if (state.history.length > 10) state.history.pop();
    renderHistory();
  });
  $('roll-adv-btn').addEventListener('click', function() {
    var r1 = Math.floor(Math.random() * 20) + 1;
    var r2 = Math.floor(Math.random() * 20) + 1;
    var best = Math.max(r1, r2);
    var numEl = $('dice-number');
    if (numEl.classList.contains('roll-anim')) { numEl.classList.remove('roll-anim'); void numEl.offsetWidth; }
    numEl.textContent = best;
    numEl.classList.add('roll-anim');
    $('dice-detail').textContent = 'Ventaja: [' + r1 + ', ' + r2 + '] = ' + best;
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.history.unshift({ label: 'Ventaja', total: best, detail: '[' + r1 + ', ' + r2 + ']', time: timeStr });
    if (state.history.length > 10) state.history.pop();
    renderHistory();
  });
  $('roll-disadv-btn').addEventListener('click', function() {
    var r1 = Math.floor(Math.random() * 20) + 1;
    var r2 = Math.floor(Math.random() * 20) + 1;
    var worst = Math.min(r1, r2);
    var numEl = $('dice-number');
    if (numEl.classList.contains('roll-anim')) { numEl.classList.remove('roll-anim'); void numEl.offsetWidth; }
    numEl.textContent = worst;
    numEl.classList.add('roll-anim');
    $('dice-detail').textContent = 'Desventaja: [' + r1 + ', ' + r2 + '] = ' + worst;
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.history.unshift({ label: 'Desventaja', total: worst, detail: '[' + r1 + ', ' + r2 + ']', time: timeStr });
    if (state.history.length > 10) state.history.pop();
    renderHistory();
  });
  renderHistory();
}