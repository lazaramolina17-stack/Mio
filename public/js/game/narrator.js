import { $ } from '../dom.js';
import { game } from './state.js';
import { speakText } from './tts.js';
import { randArr } from '../utils.js';
import { D } from '../data/index.js';

export function narrate(text, type) {
  game.narrator.push({ text: text, type: type || 'explore' });
  renderNarrator();
  speakText(text);
}

export function narrateRandom(pool, type) {
  narrate(randArr(D.narrador[pool] || ['El destino te guía...']), type);
}

export function renderNarrator() {
  var el = $('narrator-text');
  if (!el) return;
  var html = '';
  for (var i = 0; i < game.narrator.length - 1; i++) {
    var n = game.narrator[i];
    html += '<div class="narrator-entry ' + (n.type || 'explore') + '">' +
      '<span class="type-tag">' + (n.type || 'info') + '</span>' +
      n.text + '</div>';
  }
  el.innerHTML = html;
  if (game.narrator.length) {
    var last = game.narrator[game.narrator.length - 1];
    var entryDiv = document.createElement('div');
    entryDiv.className = 'narrator-entry ' + (last.type || 'explore');
    entryDiv.innerHTML = '<span class="type-tag">' + (last.type || 'info') + '</span><span class="typing-text"></span><span class="typing-cursor"></span>';
    el.appendChild(entryDiv);
    el.scrollTop = el.scrollHeight;
    var span = entryDiv.querySelector('.typing-text');
    var t = last.text;
    var ci = 0;
    var speed = last.type === 'combat' ? 15 : 25;
    if (game._typeTimer) clearInterval(game._typeTimer);
    game._typeTimer = setInterval(function() {
      if (ci < t.length) { span.textContent += t[ci]; ci++; el.scrollTop = el.scrollHeight; }
      else { clearInterval(game._typeTimer); game._typeTimer = null; var cursor = entryDiv.querySelector('.typing-cursor'); if (cursor) cursor.style.display = 'none'; }
    }, speed);
  }
}