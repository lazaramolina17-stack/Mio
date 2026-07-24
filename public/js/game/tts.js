import { $ } from '../dom.js';
import { game } from './state.js';
import { rand } from '../utils.js';

var _voiceReady = false;
var _ttsQueue = [];
var _ttsId = 0;
var _webTtsAudio = null;

export function isVoiceReady() { return _voiceReady; }

function logVoiceDebug(msg) {
  var available = window.speechSynthesis.getVoices().map(function(v) { return v.name + ' (' + v.lang + ')'; }).join(', ');
  console.log('[TTS] ' + msg + ' | Voces: ' + (available || '(ninguna)'));
}

export function findBestVoice() {
  var allVoices = window.speechSynthesis.getVoices();
  if (!allVoices.length) return null;
  if (game.selectedVoice) {
    var match = allVoices.find(function(v) { return v.name === game.selectedVoice; });
    if (match) return match;
    game.selectedVoice = '';
  }
  var es = allVoices.filter(function(v) { return v.lang && v.lang.indexOf('es') === 0; });
  var best = es.find(function(v) { return /google|microsoft/i.test(v.name); }) ||
    es.find(function(v) { return /neural|natural|premium|high.?quality/i.test(v.name); }) ||
    es.find(function(v) { return /español|spanish|mexico|latino|castellano/i.test(v.name); }) ||
    es[0];
  if (!best) best = allVoices.find(function(v) { return /google|microsoft|neural/i.test(v.name); });
  return best || allVoices[0] || null;
}

export function waitVoices(callback) {
  var voices = window.speechSynthesis.getVoices();
  if (voices.length) { _voiceReady = true; callback(); return; }
  var handler = function() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      _voiceReady = true;
      window.speechSynthesis.onvoiceschanged = null;
      callback();
      while (_ttsQueue.length) speakText(_ttsQueue.shift());
    }
  };
  window.speechSynthesis.onvoiceschanged = handler;
  setTimeout(handler, 2000);
}

function speakViaGoogle(text) {
  var chunks = text.match(/[^.!?]{1,180}[.!?]?/g) || [text];
  var idx = 0;
  function playNext() {
    if (idx >= chunks.length || _ttsId !== (_ttsId || 0)) return;
    var q = encodeURIComponent(chunks[idx].trim().substring(0, 200));
    _webTtsAudio = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&q=' + q + '&tl=es&client=tw-ob&ttsspeed=0.8');
    _webTtsAudio.onended = function() { idx++; setTimeout(playNext, 120); };
    _webTtsAudio.onerror = function() { idx++; setTimeout(playNext, 120); };
    _webTtsAudio.play().catch(function() {});
  }
  playNext();
}

export function speakText(text) {
  if (!game.ttsEnabled) return;
  _ttsId++;
  if (game.ttsMode === 'web') {
    if (!('Audio' in window)) return;
    speakViaGoogle(text);
    return;
  }
  if (!('speechSynthesis' in window)) return;
  if (!_voiceReady) {
    _ttsQueue.push(text);
    if (window.speechSynthesis.getVoices().length) { _voiceReady = true; }
    else { waitVoices(function() {}); return; }
  }
  window.speechSynthesis.cancel();
  var myId = _ttsId;
  var rate = parseFloat($('voice-rate').value) || 0.9;
  var pitch = parseFloat($('voice-pitch').value) || 1.0;
  var sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  rate = Math.max(0.5, Math.min(1.5, rate));
  pitch = Math.max(0.5, Math.min(1.5, pitch));
  var idx = 0;
  function speakNext() {
    if (idx >= sentences.length || myId !== _ttsId) return;
    var u = new SpeechSynthesisUtterance(sentences[idx].trim());
    var voice = findBestVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else { u.lang = 'es-MX'; }
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1.0;
    u.onend = function() { idx++; setTimeout(function() { speakNext(); }, 80); };
    window.speechSynthesis.speak(u);
  }
  speakNext();
}

export function buildVoicePanel() {
  var sel = $('voice-panel');
  if (!sel) return;
  if (!('speechSynthesis' in window)) return;
  var allVoices = window.speechSynthesis.getVoices();
  if (!allVoices.length) { sel.innerHTML = '<div class="vp-empty">Esperando voces...</div>'; waitVoices(function() { buildVoicePanel(); }); return; }
  _voiceReady = true;
  if (!game.selectedVoice) { var best = findBestVoice(); if (best) game.selectedVoice = best.name; }
  var cur = game.selectedVoice || '';
  function cleanName(name) { return name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function getQuality(name) { if (/google|microsoft/i.test(name)) return { icon: '⭐', label: 'Premium' }; if (/neural|natural|premium|high.?quality|enhanced|wavenet/i.test(name)) return { icon: '🔊', label: 'Neural' }; return { icon: '🎙️', label: 'Sistema' }; }
  function sortScore(v) { var s = 0; if (v.lang && v.lang.indexOf('es') === 0) s += 100; if (v.name === cur) s += 200; if (/google|microsoft/i.test(v.name)) s += 50; if (/neural|natural|premium|high.?quality/i.test(v.name)) s += 25; return -s; }
  var sorted = [].concat(allVoices).sort(function(a, b) { return sortScore(a) - sortScore(b); });
  var html = '<div class="vp-header"><span>🎙️ Voces disponibles</span><span class="vp-count">' + allVoices.length + '</span></div>';
  sorted.forEach(function(v) {
    var q = getQuality(v.name);
    var selected = (v.name === cur) ? ' selected' : '';
    var displayName = cleanName(v.name.replace(/\(.+?\)/g, '')).trim() || cleanName(v.name);
    html += '<div class="vp-item' + selected + '" data-voice="' + v.name.replace(/"/g, '&quot;') + '">';
    html += '<span class="vp-check">✓</span>';
    html += '<span class="vp-badge" title="' + q.label + '">' + q.icon + '</span>';
    html += '<div class="vp-info"><div class="vp-name">' + displayName + '</div><div class="vp-lang">' + (v.lang || '—') + '</div></div>';
    html += '<button class="vp-test-btn" data-voice="' + v.name.replace(/"/g, '&quot;') + '">▶</button>';
    html += '</div>';
  });
  sel.innerHTML = html;
  sel.querySelectorAll('.vp-item').forEach(function(el) {
    el.addEventListener('click', function(e) {
      if (e.target.classList.contains('vp-test-btn')) return;
      game.selectedVoice = this.dataset.voice;
      sel.querySelectorAll('.vp-item').forEach(function(i) { i.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });
  sel.querySelectorAll('.vp-test-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var voiceName = this.dataset.voice;
      var oldVoice = game.selectedVoice;
      game.selectedVoice = voiceName;
      speakText('Bienvenido, aventurero. Que los dioses te guíen en tu travesía.');
      game.selectedVoice = oldVoice;
    });
  });
}