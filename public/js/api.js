import { state, saveToken, clearToken } from './state.js';

const API_BASE = 'http://localhost:3000/api';

async function request(path, options) {
  options = options || {};
  var token = state.token || loadTokenFromStorage();
  var headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  var res = await fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body || null
  });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Sesión expirada');
  }
  if (!res.ok) {
    var body = await res.json().catch(function () { return {}; });
    var err = new Error(body.error || res.statusText);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function loadTokenFromStorage() {
  try { return localStorage.getItem('rpg_token'); } catch (e) { return null; }
}

export async function get(path) { return request(path); }

export async function post(path, data) { return request(path, { method: 'POST', body: JSON.stringify(data || {}) }); }

export async function put(path, data) { return request(path, { method: 'PUT', body: JSON.stringify(data || {}) }); }

export async function del(path) { return request(path, { method: 'DELETE' }); }

export async function login(email, password) {
  return post('/auth/login', { email: email, password: password });
}

export async function register(username, email, password) {
  return post('/auth/register', { username: username, email: email, password: password });
}

export async function getMe() {
  return get('/auth/me');
}

export async function listWorlds() {
  return get('/worlds');
}

export async function createWorld(name, slug) {
  return post('/worlds', { name: name, slug: slug });
}

export async function getWorld(id) {
  return get('/worlds/' + id);
}

export async function listNPCs(worldId, settlementId) {
  var path = '/worlds/' + worldId + '/npcs';
  if (settlementId) path += '?settlement_id=' + settlementId;
  return get(path);
}

export async function getNPC(id) {
  return get('/npcs/' + id);
}