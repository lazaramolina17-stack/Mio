import { D, getD } from './data/index.js';
import { applyCompatibility } from './data/compatibility.js';
import { state, loadToken } from './state.js';
import { initAuth, handleLogout } from './authUI.js';
import { $ } from './dom.js';
import { initSelects, initCharEvents, initSaveLoad, initDiceEvents, renderStatGrid, renderAssignGrid, rollDice } from './chargen.js';
import { renderSpells, initSpellEvents } from './spellbook.js';
import { renderEquipment, initEquipEvents } from './equipment.js';
import { renderMonsters, initMonsterEvents } from './bestiary.js';
import { renderRules } from './rules.js';

import { game } from './game/state.js';
import { setupPlayer, updateStatusBar, getWeaponData, getWeaponDamage, getAttackBonus, getMonsterData, parseMonsterHP, getMonsterAttackBonus, getMonsterDamage } from './game/player.js';
import { narrate, narrateRandom, renderNarrator } from './game/narrator.js';
import { speakText, waitVoices, buildVoicePanel, findBestVoice } from './game/tts.js';
import { rand, randArr, d20, parseDice, getMod, modStr } from './utils.js';

window.D = D;
window.$ = $;
window.state = state;
window.game = game;
window.narrate = narrate;
window.narrateRandom = narrateRandom;
window.renderNarrator = renderNarrator;
window.speakText = speakText;
window.waitVoices = waitVoices;
window.buildVoicePanel = buildVoicePanel;
window.findBestVoice = findBestVoice;
window.setupPlayer = setupPlayer;
window.updateStatusBar = updateStatusBar;
window.getWeaponData = getWeaponData;
window.getWeaponDamage = getWeaponDamage;
window.getAttackBonus = getAttackBonus;
window.getMonsterData = getMonsterData;
window.parseMonsterHP = parseMonsterHP;
window.getMonsterAttackBonus = getMonsterAttackBonus;
window.getMonsterDamage = getMonsterDamage;
window.rand = rand;
window.randArr = randArr;
window.d20 = d20;
window.parseDice = parseDice;
window.getMod = getMod;
window.modStr = modStr;
window.rollDice = rollDice;
window.renderStatGrid = renderStatGrid;
window.renderAssignGrid = renderAssignGrid;
window.renderSpells = renderSpells;
window.renderEquipment = renderEquipment;
window.renderMonsters = renderMonsters;
window.renderRules = renderRules;
window.handleLogout = handleLogout;

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      var tab = document.getElementById('tab-' + this.dataset.tab);
      if (tab) tab.classList.add('active');
      if (this.dataset.tab === 'hechizos') renderSpells();
      if (this.dataset.tab === 'equipo') renderEquipment();
      if (this.dataset.tab === 'bestiario') renderMonsters();
    });
  });
}

function init() {
  loadToken();
  applyCompatibility();
  initSelects();
  initCharEvents();
  initSaveLoad();
  initDiceEvents();
  initSpellEvents();
  initEquipEvents();
  initMonsterEvents();
  renderRules();
  initTabs();
  renderHistory();
  var logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (!state.rolledScores.length) {
    var rollBtn = document.getElementById('roll-stats-btn');
    if (rollBtn) rollBtn.click();
  }
  state.equippedItems = { armor: null, weapon: null, shield: null };
  initAuth();
}

function renderHistory() {
  var el = document.getElementById('roll-history');
  if (!el) return;
  if (!state.history.length) { el.innerHTML = '<div class="empty-state">Sin tiradas a\u00fan</div>'; return; }
  el.innerHTML = state.history.map(function (h) {
    return '<div class="history-item"><span><span class="roll">' + h.label + '</span> <span class="total">' + h.total + '</span> <span style="color:var(--text-dim)">' + h.detail + '</span></span><span class="time">' + h.time + '</span></div>';
  }).join('');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}