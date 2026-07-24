import { D } from './data/index.js';
import { state } from './state.js';
import { $ } from './dom.js';

export function renderEquipment() {
  var equip = D.equipo || {};
  var cat = $('equip-category').value;
  var search = $('equip-search').value.trim().toLowerCase();
  var items = [];
  if (!cat || cat === 'armas_simples') (equip.armas_simples || []).forEach(function(i) { items.push(Object.assign({}, i, { _cat: 'Arma Simple' })); });
  if (!cat || cat === 'armas_marciales') (equip.armas_marciales || []).forEach(function(i) { items.push(Object.assign({}, i, { _cat: 'Arma Marcial' })); });
  if (!cat || cat === 'armaduras') (equip.armaduras || []).forEach(function(i) { items.push(Object.assign({}, i, { _cat: 'Armadura' })); });
  if (!cat || cat === 'equipo_aventurero') (equip.equipo_aventurero || []).forEach(function(i) { items.push(Object.assign({}, i, { _cat: 'Equipo' })); });
  if (search) items = items.filter(function(i) { return (i.nombre || '').toLowerCase().includes(search); });
  var el = $('equip-list');
  if (!items.length) { el.innerHTML = '<div class="empty-state">Sin equipo</div>'; return; }
  el.innerHTML = items.map(function(i) {
    var detail = '';
    if (i.daño) detail += '<span class="spell-tag">' + i.daño + ' ' + (i.tipo || '') + '</span>';
    if (i.ca) detail += '<span class="spell-tag">CA ' + i.ca + '</span>';
    if (i.propiedades) detail += '<span class="spell-tag">' + i.propiedades + '</span>';
    if (i.precio) detail += '<span class="spell-tag" style="color:var(--accent)">' + i.precio + '</span>';
    var canEquip = (i._cat === 'Arma Simple' || i._cat === 'Arma Marcial' || i._cat === 'Armadura');
    var isEquipped = state.equippedItems && (state.equippedItems.weapon === i.nombre || state.equippedItems.armor === i.nombre || state.equippedItems.shield === i.nombre);
    var equipBtn = canEquip ? '<button class="btn btn-sm equip-btn" style="margin-left:8px" data-name="' + i.nombre + '" data-cat="' + i._cat + '">' + (isEquipped ? '✓' : 'Equipar') + '</button>' : '';
    return '<div class="spell-card"><div class="spell-name">' + (i.nombre || '') + equipBtn + '</div><div class="spell-meta"><span>' + i._cat + '</span>' + detail + '</div></div>';
  }).join('');
  el.querySelectorAll('.equip-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var name = this.dataset.name;
      var cat = this.dataset.cat;
      if (!state.character) { alert('Primero genera un personaje.'); return; }
      if (!state.equippedItems) state.equippedItems = { armor: null, weapon: null, shield: null };
      if (cat === 'Armadura') {
        if (name.indexOf('Escudo') !== -1) { state.equippedItems.shield = (state.equippedItems.shield === name) ? null : name; }
        else { if (state.equippedItems.armor) alert('Armadura cambiada: ' + state.equippedItems.armor + ' → ' + name); state.equippedItems.armor = (state.equippedItems.armor === name) ? null : name; }
      } else { state.equippedItems.weapon = (state.equippedItems.weapon === name) ? null : name; }
      renderEquipment();
      if (state.character) {
        var generateBtn = $('generate-btn');
        if (generateBtn) generateBtn.click();
      }
    });
  });
}

export function initEquipEvents() {
  $('equip-category').addEventListener('change', renderEquipment);
  $('equip-search').addEventListener('input', renderEquipment);
}