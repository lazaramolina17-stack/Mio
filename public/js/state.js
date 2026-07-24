export const state = {
  rolledScores: [],
  assigned: {},
  selectedStat: null,
  character: null,
  history: [],
  equippedItems: {armor: null, weapon: null, shield: null},
  token: null,
  apiBase: 'http://localhost:3000/api'
};

export function saveToken(token) {
  state.token = token;
  try { localStorage.setItem('rpg_token', token); } catch (e) {}
}

export function loadToken() {
  try {
    var t = localStorage.getItem('rpg_token');
    if (t) { state.token = t; return t; }
  } catch (e) {}
  return null;
}

export function clearToken() {
  state.token = null;
  try { localStorage.removeItem('rpg_token'); } catch (e) {}
}