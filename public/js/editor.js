var API_BASE = 'http://localhost:3000/api';

function loadToken() { try { return localStorage.getItem('rpg_token'); } catch (e) { return null; } }

async function apiReq(path, opts) {
  var token = loadToken();
  headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  opts = opts || {};
  opts.headers = Object.assign(headers, opts.headers || {});
  if (opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
  var res = await fetch(API_BASE + path, opts);
  if (res.status === 401) { localStorage.removeItem('rpg_token'); window.location.reload(); return null; }
  return res.json();
}

async function editorGet(path) { return apiReq(path); }
async function editorPost(path, data) { return apiReq(path, { method: 'POST', body: data }); }
async function editorPut(path, data) { return apiReq(path, { method: 'PUT', body: data }); }

var editor = {
  worldId: 'a0000000-0000-0000-0000-000000000001',
  tool: 'select',
  regions: [],
  settlements: [],
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  selected: null,
  isDragging: false,
  dragStart: null,
  elementStart: null,
};

var WORLD_ID = editor.worldId;
var TOKEN = loadToken();

async function initEditor() {
  if (!TOKEN) { window.location.href = 'index.html'; return; }
  await loadData();
  renderCanvas();
  bindEvents();
}

async function loadData() {
  var res = await editorGet('/worlds/' + WORLD_ID);
  if (res && res.world) {
    var rRes = await editorGet('/worlds/' + WORLD_ID + '/regions');
    var sRes = await editorGet('/worlds/' + WORLD_ID + '/settlements');
    editor.regions = (rRes && rRes.regions) ? rRes.regions : [];
    editor.settlements = (sRes && sRes.settlements) ? sRes.settlements : [];
    editor.recalcPositions();
  }
}

function recalcPositions() {
  editor.regions.forEach(function (r) {
    if (!r.metadata || r.metadata.x === undefined) {
      if (!r.metadata) r.metadata = {};
      r.metadata.x = 50 + Math.random() * 400;
      r.metadata.y = 50 + Math.random() * 300;
      r.metadata.width = 120 + Math.random() * 200;
      r.metadata.height = 80 + Math.random() * 150;
    }
  });
  editor.settlements.forEach(function (s) {
    if (!s.metadata || s.metadata.x === undefined) {
      if (!s.metadata) s.metadata = {};
      s.metadata.x = 100 + Math.random() * 300;
      s.metadata.y = 100 + Math.random() * 250;
    }
  });
}

function renderCanvas() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  applyTransform(canvas);

  editor.regions.forEach(function (r) {
    var el = document.createElement('div');
    el.className = 'region';
    var typeClass = 'type-' + (r.type || 'valley');
    el.classList.add(typeClass);
    el.dataset.id = r.id;
    el.dataset.type = 'region';
    var meta = r.metadata || {};
    el.style.left = (meta.x || 100) + 'px';
    el.style.top = (meta.y || 100) + 'px';
    el.style.width = (meta.width || 140) + 'px';
    el.style.height = (meta.height || 90) + 'px';
    el.textContent = r.name;
    el.title = r.name + ' (' + r.type + ')';
    el.addEventListener('mousedown', onRegionMouseDown);
    el.addEventListener('click', onRegionClick);
    canvas.appendChild(el);
  });

  editor.settlements.forEach(function (s) {
    var el = document.createElement('div');
    el.className = 'settlement';
    var typeClass = 'type-' + (s.type || 'village');
    el.classList.add(typeClass);
    el.dataset.id = s.id;
    el.dataset.type = 'settlement';
    var meta = s.metadata || {};
    el.style.left = ((meta.x || 100) - 14) + 'px';
    el.style.top = ((meta.y || 100) - 14) + 'px';
    el.title = s.name + ' (' + s.type + ')';
    var icon = s.type === 'city' ? '\u{1F3D9}' : s.type === 'fortress' ? '\u{1F3F0}' : s.type === 'ruin' ? '\u{1F3DA}' : '\u{1F3E1}';
    el.textContent = icon;
    el.addEventListener('mousedown', onSettlementMouseDown);
    el.addEventListener('click', onSettlementClick);
    canvas.appendChild(el);
  });

  renderConnections();
}

function applyTransform(el) {
  el.style.transform = 'scale(' + editor.zoom + ') translate(' + editor.offsetX + 'px,' + editor.offsetY + 'px)';
}

function renderConnections() {
  var svg = document.getElementById('connections-svg');
  if (!svg) return;
  svg.innerHTML = '';
  var typeColors = { settlement: '#c8a44e', region: '#228B22' };
  editor.settlements.forEach(function (s) {
    var sMeta = s.metadata || {};
    var sx = (sMeta.x || 100) + 14;
    var sy = (sMeta.y || 100) + 14;
    editor.settlements.forEach(function (s2) {
      if (s.id === s2.id) return;
      var s2Meta = s2.metadata || {};
      var ex = (s2Meta.x || 100) + 14;
      var ey = (s2Meta.y || 100) + 14;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sx);
      line.setAttribute('y1', sy);
      line.setAttribute('x2', ex);
      line.setAttribute('y2', ey);
      line.setAttribute('stroke', 'rgba(200,164,78,0.15)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
  });
}

function onRegionMouseDown(e) {
  e.stopPropagation();
  if (editor.tool === 'move') {
    editor.isDragging = true;
    editor.dragStart = { x: e.clientX, y: e.clientY };
    editor.elementStart = { x: parseInt(e.target.style.left), y: parseInt(e.target.style.top) };
  } else if (editor.tool === 'select') {
    selectElement(e.target);
  }
}

function onSettlementMouseDown(e) {
  e.stopPropagation();
  if (editor.tool === 'move') {
    editor.isDragging = true;
    editor.dragStart = { x: e.clientX, y: e.clientY };
    editor.elementStart = { x: parseInt(e.target.style.left), y: parseInt(e.target.style.top) };
  } else if (editor.tool === 'select') {
    selectElement(e.target);
  }
}

function onRegionClick(e) {
  e.stopPropagation();
  if (editor.tool === 'select') selectElement(e.target);
}

function onSettlementClick(e) {
  e.stopPropagation();
  if (editor.tool === 'select') selectElement(e.target);
}

function selectElement(el) {
  document.querySelectorAll('.region.selected, .settlement.selected').forEach(function (e) { e.classList.remove('selected'); });
  editor.selected = el;
  el.classList.add('selected');
  showProps(el);
}

function showProps(el) {
  var panel = document.getElementById('props-panel');
  var content = document.getElementById('props-content');
  if (!panel || !content) return;
  panel.classList.remove('hidden');
  var id = el.dataset.id;
  var type = el.dataset.type;
  if (type === 'region') {
    var region = editor.regions.find(function (r) { return r.id === id; });
    if (!region) return;
    var meta = region.metadata || {};
    content.innerHTML = renderPropsForm([
      { label: 'Nombre', key: 'name', value: region.name, type: 'text' },
      { label: 'Tipo', key: 'type', value: region.type, type: 'select', options: 'forest,mountain,valley,water,desert' },
      { label: 'Clima', key: 'climate', value: meta.climate || '', type: 'text' },
      { label: 'Area (km²)', key: 'area', value: meta.area || '', type: 'number' },
      { label: 'X', key: 'x', value: meta.x || 0, type: 'number' },
      { label: 'Y', key: 'y', value: meta.y || 0, type: 'number' },
      { label: 'Ancho', key: 'width', value: meta.width || 140, type: 'number' },
      { label: 'Alto', key: 'height', value: meta.height || 90, type: 'number' },
    ], region.id, 'region');
  } else if (type === 'settlement') {
    var settle = editor.settlements.find(function (s) { return s.id === id; });
    if (!settle) return;
    var meta = settle.metadata || {};
    content.innerHTML = renderPropsForm([
      { label: 'Nombre', key: 'name', value: settle.name, type: 'text' },
      { label: 'Tipo', key: 'type', value: settle.type, type: 'select', options: 'village,hamlet,city,fortress,ruin' },
      { label: 'Población', key: 'population', value: settle.population || 0, type: 'number' },
      { label: 'Riqueza', key: 'wealth_level', value: settle.wealth_level || 'moderate', type: 'select', options: 'poor,moderate,wealthy,rich' },
      { label: 'X', key: 'x', value: meta.x || 0, type: 'number' },
      { label: 'Y', key: 'y', value: meta.y || 0, type: 'number' },
    ], settle.id, 'settlement');
  }
}

function renderPropsForm(fields, id, metaType) {
  var html = '<input type="hidden" data-id="' + id + '" data-meta="' + metaType + '">';
  fields.forEach(function (f) {
    html += '<div class="prop-row"><label>' + f.label + '</label>';
    if (f.type === 'select') {
      html += '<select data-key="' + f.key + '">';
      f.options.split(',').forEach(function (opt) {
        html += '<option value="' + opt + '"' + (opt === f.value ? ' selected' : '') + '>' + opt + '</option>';
      });
      html += '</select>';
    } else {
      html += '<input type="' + f.type + '" data-key="' + f.key + '" value="' + (f.value || '') + '">';
    }
    html += '</div>';
  });
  return html;
}

function bindEvents() {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tool-btn[data-tool]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      editor.tool = btn.dataset.tool;
      var canvas = document.getElementById('canvas');
      if (canvas) canvas.style.cursor = editor.tool === 'move' ? 'grab' : 'default';
    });
  });

  document.getElementById('btn-zoom-in').addEventListener('click', function () { editor.zoom = Math.min(editor.zoom + 0.2, 3); renderCanvas(); });
  document.getElementById('btn-zoom-out').addEventListener('click', function () { editor.zoom = Math.max(editor.zoom - 0.2, 0.3); renderCanvas(); });
  document.getElementById('btn-fit').addEventListener('click', function () { editor.zoom = 1; editor.offsetX = 0; editor.offsetY = 0; renderCanvas(); });

  document.getElementById('btn-save').addEventListener('click', saveChanges);
  document.getElementById('btn-export').addEventListener('click', exportMap);

  var canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    canvasContainer.addEventListener('mousemove', function (e) {
      if (!editor.isDragging || !editor.elementStart) return;
      var dx = (e.clientX - editor.dragStart.x) / editor.zoom;
      var dy = (e.clientY - editor.dragStart.y) / editor.zoom;
      if (editor.selected) {
        var meta = JSON.parse(JSON.stringify(editor.selected.dataset.type === 'region' ? (getRegionMeta(editor.selected) || {}) : (getSettlementMeta(editor.selected) || {})));
        meta.x = (editor.elementStart.x || 0) + dx;
        meta.y = (editor.elementStart.y || 0) + dy;
        editor.selected.style.left = meta.x + 'px';
        editor.selected.style.top = meta.y + 'px';
        saveMetaToElement(editor.selected, meta);
      }
    });
    canvasContainer.addEventListener('mouseup', function () {
      editor.isDragging = false;
      editor.elementStart = null;
    });
    canvasContainer.addEventListener('mouseleave', function () {
      editor.isDragging = false;
      editor.elementStart = null;
    });
  }

  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-ok').addEventListener('click', submitModal);
  document.getElementById('modal-overlay').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeModal(); });
}

function getRegionMeta(el) {
  var region = editor.regions.find(function (r) { return r.id === el.dataset.id; });
  return region ? region.metadata : {};
}

function getSettlementMeta(el) {
  var s = editor.settlements.find(function (s) { return s.id === el.dataset.id; });
  return s ? s.metadata : {};
}

function saveMetaToElement(el, meta) {
  if (el.dataset.type === 'region') {
    var r = editor.regions.find(function (r) { return r.id === el.dataset.id; });
    if (r) { if (!r.metadata) r.metadata = {}; r.metadata.x = meta.x; r.metadata.y = meta.y; r.metadata.width = meta.width || r.metadata.width; r.metadata.height = meta.height || r.metadata.height; }
  } else {
    var s = editor.settlements.find(function (s) { return s.id === el.dataset.id; });
    if (s) { if (!s.metadata) s.metadata = {}; s.metadata.x = meta.x; s.metadata.y = meta.y; }
  }
}

document.getElementById('props-content').addEventListener('change', function (e) {
  if (!e.target.dataset || !e.target.dataset.key) return;
  var key = e.target.dataset.key;
  var id = e.target.parentElement.querySelector('input[type=hidden]');
  if (!id) return;
  var elId = id.dataset.id;
  var metaType = id.dataset.meta;
  var value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
  if (metaType === 'region') {
    var r = editor.regions.find(function (r) { return r.id === elId; });
    if (!r) return;
    if (key === 'name') r.name = value;
    else if (key === 'type') r.type = value;
    else if (key === 'climate') { if (!r.metadata) r.metadata = {}; r.metadata.climate = value; }
    else if (key === 'area') { if (!r.metadata) r.metadata = {}; r.metadata.area = value; }
    else if (['x', 'y'].indexOf(key) >= 0) { if (!r.metadata) r.metadata = {}; r.metadata[key] = value; }
    else if (['width', 'height'].indexOf(key) >= 0) { if (!r.metadata) r.metadata = {}; r.metadata[key] = value; }
    renderCanvas();
  } else if (metaType === 'settlement') {
    var s = editor.settlements.find(function (s) { return s.id === elId; });
    if (!s) return;
    if (key === 'name') s.name = value;
    else if (key === 'type') s.type = value;
    else if (key === 'population') s.population = value;
    else if (key === 'wealth_level') s.wealth_level = value;
    else if (['x', 'y'].indexOf(key) >= 0) { if (!s.metadata) s.metadata = {}; s.metadata[key] = value; }
    renderCanvas();
  }
});

document.getElementById('props-content').addEventListener('click', async function (e) {
  if (e.target && e.target.id === 'modal-ok') submitModal();
  if (e.target && e.target.id === 'btn-add-region') {
    var regionData = {
      name: 'Nueva Region',
      type: 'valley',
      world_id: WORLD_ID,
      metadata: { x: 200, y: 150, width: 140, height: 90, climate: 'templado' },
    };
    var regionResult = await editorPost('/worlds/' + WORLD_ID + '/regions', regionData);
    if (regionResult && regionResult.region) {
      regionResult.region.metadata.x = 200; regionResult.region.metadata.y = 150;
      editor.regions.push(regionResult.region);
      renderCanvas();
      toast('Región creada');
    }
  }
  if (e.target && e.target.id === 'btn-add-settlement') {
    var settleData = {
      name: 'Nuevo Asentamiento',
      type: 'village',
      world_id: WORLD_ID,
      population: 0,
      wealth_level: 'moderate',
      metadata: { x: 150, y: 150 },
    };
    var settleResult = await editorPost('/worlds/' + WORLD_ID + '/settlements', settleData);
    if (settleResult && settleResult.settlement) {
      settleResult.settlement.metadata.x = 150; settleResult.settlement.metadata.y = 150;
      editor.settlements.push(settleResult.settlement);
      renderCanvas();
      toast('Asentamiento creado');
    }
  }
});

function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

async function submitModal() {
  closeModal();
  await loadData();
  renderCanvas();
  toast('Cambios guardados');
}

async function saveChanges() {
  var count = 0;
  for (var i = 0; i < editor.regions.length; i++) {
    var r = editor.regions[i];
    try {
      var res = await editorPut('/worlds/' + WORLD_ID + '/regions/' + r.id, { name: r.name, type: r.type, metadata: r.metadata });
      if (res && res.region) count++;
    } catch (e) { /* ignore */ }
  }
  for (var j = 0; j < editor.settlements.length; j++) {
    var s = editor.settlements[j];
    try {
      var res2 = await editorPut('/worlds/' + WORLD_ID + '/settlements/' + s.id, { name: s.name, type: s.type, population: s.population, wealth_level: s.wealth_level, metadata: s.metadata });
      if (res2 && res2.settlement) count++;
    } catch (e) { /* ignore */ }
  }
  toast('Guardados ' + count + ' elementos');
}

function exportMap() {
  var data = { regions: editor.regions, settlements: editor.settlements, zoom: editor.zoom };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'vallebruma-editor-export.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Mapa exportado');
}

function toast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(function () { t.classList.add('hidden'); }, 2000);
}

document.addEventListener('DOMContentLoaded', initEditor);
