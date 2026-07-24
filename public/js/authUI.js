import { state, saveToken, clearToken } from './state.js';
import { login, register, getMe } from './api.js';

export function renderLoginForm() {
  var el = document.getElementById('auth-screen');
  if (!el) return;
  el.style.display = 'flex';
  el.innerHTML =
    '<div class="auth-card">' +
      '<h2>Iniciar Sesi\u00f3n</h2>' +
      '<form id="login-form">' +
        '<div class="form-group"><label>Email</label><input type="email" id="login-email" placeholder="tucorreo@ejemplo.com" required></div>' +
        '<div class="form-group"><label>Contrase\u00f1a</label><input type="password" id="login-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" required minlength="6"></div>' +
        '<button type="submit" class="btn btn-primary" style="width:100%">Iniciar Sesi\u00f3n</button>' +
      '</form>' +
      '<p style="text-align:center;margin-top:12px;font-size:12px;color:var(--text-dim)">' +
        '\u00bfNo tienes cuenta? <a href="#" id="show-register" style="color:var(--accent)">Registrarse</a>' +
      '</p>' +
      '<div id="auth-error"></div>' +
    '</div>';
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('show-register').addEventListener('click', function (e) {
    e.preventDefault();
    renderRegisterForm();
  });
}

export function renderRegisterForm() {
  var el = document.getElementById('auth-screen');
  if (!el) return;
  el.style.display = 'flex';
  el.innerHTML =
    '<div class="auth-card">' +
      '<h2>Registrarse</h2>' +
      '<form id="register-form">' +
        '<div class="form-group"><label>Nombre de Usuario</label><input type="text" id="reg-username" placeholder="Thorgrim" required minlength="3"></div>' +
        '<div class="form-group"><label>Email</label><input type="email" id="reg-email" placeholder="tucorreo@ejemplo.com" required></div>' +
        '<div class="form-group"><label>Contrase\u00f1a</label><input type="password" id="reg-password" placeholder="M\u00edn. 6 caracteres" required minlength="6"></div>' +
        '<div class="form-group"><label>Confirmar Contrase\u00f1a</label><input type="password" id="reg-confirm" placeholder="Repite la contrase\u00f1a" required></div>' +
        '<button type="submit" class="btn btn-primary" style="width:100%">Crear Cuenta</button>' +
      '</form>' +
      '<p style="text-align:center;margin-top:12px;font-size:12px;color:var(--text-dim)">' +
        '\u00bfYa tienes cuenta? <a href="#" id="show-login" style="color:var(--accent)">Iniciar Sesi\u00f3n</a>' +
      '</p>' +
      '<div id="auth-error"></div>' +
    '</div>';
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('show-login').addEventListener('click', function (e) {
    e.preventDefault();
    renderLoginForm();
  });
}

export async function handleLogin(e) {
  e.preventDefault();
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errEl = document.getElementById('auth-error');
  if (!email || !password) { errEl.textContent = 'Completa todos los campos.'; return; }
  if (password.length < 6) { errEl.textContent = 'La contrase\u00f1a debe tener al menos 6 caracteres.'; return; }
  try {
    var data = await login(email, password);
    saveToken(data.token);
    showGame();
  } catch (err) {
    errEl.textContent = err.message || 'Error al iniciar sesi\u00f3n.';
  }
}

export async function handleRegister(e) {
  e.preventDefault();
  var username = document.getElementById('reg-username').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var confirm = document.getElementById('reg-confirm').value;
  var errEl = document.getElementById('auth-error');
  if (!username || !email || !password || !confirm) { errEl.textContent = 'Completa todos los campos.'; return; }
  if (username.length < 3) { errEl.textContent = 'El usuario debe tener al menos 3 caracteres.'; return; }
  if (password.length < 6) { errEl.textContent = 'La contrase\u00f1a debe tener al menos 6 caracteres.'; return; }
  if (password !== confirm) { errEl.textContent = 'Las contrase\u00f1as no coinciden.'; return; }
  try {
    var data = await register(username, email, password);
    saveToken(data.token);
    showGame();
  } catch (err) {
    errEl.textContent = err.message || 'Error al registrarse.';
  }
}

export function handleLogout() {
  clearToken();
  showAuth();
}

export function isAuthenticated() {
  return !!(state.token || (typeof localStorage !== 'undefined' && localStorage.getItem('rpg_token')));
}

function showAuth() {
  var authEl = document.getElementById('auth-screen');
  var appEl = document.getElementById('app');
  if (authEl) authEl.style.display = 'flex';
  if (appEl) appEl.style.display = 'none';
  renderLoginForm();
}

function showGame() {
  var authEl = document.getElementById('auth-screen');
  var appEl = document.getElementById('app');
  if (authEl) authEl.style.display = 'none';
  if (appEl) appEl.style.display = 'flex';
}

export async function initAuth() {
  var token = state.token || (typeof localStorage !== 'undefined' && localStorage.getItem('rpg_token'));
  if (token) {
    state.token = token;
    try {
      await getMe();
      showGame();
      return;
    } catch (e) {
      clearToken();
    }
  }
  showAuth();
}