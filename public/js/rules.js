import { D } from './data/index.js';
import { $ } from './dom.js';

export function renderRules() {
  var skillData = D.skillsByAbility || {
    'Fuerza': ['Atletismo'],
    'Destreza': ['Acrobacias', 'Juego de Manos', 'Sigilo'],
    'Constitución': [],
    'Inteligencia': ['Arcano', 'Historia', 'Investigación', 'Naturaleza', 'Religión'],
    'Sabiduría': ['Trato con Animales', 'Perspicacia', 'Medicina', 'Percepción', 'Supervivencia'],
    'Carisma': ['Engaño', 'Intimidación', 'Interpretación', 'Persuasión']
  };
  var skillTable = $('skill-table').querySelector('tbody');
  skillTable.innerHTML = Object.entries(skillData).map(function(_a) {
    return '<tr><td style="font-weight:bold;color:var(--accent)">' + _a[0] + '</td><td>' + (_a[1].length ? _a[1].join(', ') : '—') + '</td></tr>';
  }).join('');
  var modTable = $('mod-table').querySelector('tbody');
  var modRows = '';
  for (var i = 1; i <= 30; i++) { var mod = Math.floor((i - 10) / 2); modRows += '<tr><td>' + i + '</td><td>' + (mod >= 0 ? '+' : '') + mod + '</td></tr>'; }
  modTable.innerHTML = modRows;
  var acItems = (D.equipo && D.equipo.armaduras) || [];
  var acTable = $('ac-table').querySelector('tbody');
  acTable.innerHTML = acItems.map(function(a) {
    var acStr = a.tipo === 'Escudo' ? '+' + a.ca : a.ca + ' ' + (a.tipo === 'Ligera' ? '+DES' : a.tipo === 'Media' ? '+DES (máx 2)' : '');
    return '<tr><td>' + a.nombre + '</td><td>' + acStr + '</td></tr>';
  }).join('');
  var conditions = D.conditions || [
    { name: 'Cegado', desc: 'No puede ver. Las tiradas de ataque contra la criatura tienen ventaja, y la criatura tiene desventaja en sus tiradas de ataque.' },
    { name: 'Encantado', desc: 'No puede atacar al encantador ni atacarlo con sus características o efectos. El encantador tiene ventaja en habilidades sociales.' },
    { name: 'Ensordecido', desc: 'No puede oír. Falla automáticamente cualquier prueba de habilidad que requiera oír.' },
    { name: 'Asustado', desc: 'Tiene desventaja en pruebas de habilidad y tiradas de ataque mientras la fuente del miedo esté en línea de visión.' },
    { name: 'Agarrado', desc: 'Su velocidad es 0. No puede beneficiarse de bonos de velocidad.' },
    { name: 'Incapacitado', desc: 'No puede realizar acciones ni reacciones.' },
    { name: 'Invisible', desc: 'No puede ser visto sin ayuda mágica. Tiene ventaja en ataques. Los ataques contra él tienen desventaja.' },
    { name: 'Paralizado', desc: 'No puede moverse ni actuar. Los ataques cuerpo a cuerpo son críticos automáticos si están a 5 pies.' },
    { name: 'Petrificado', desc: 'Transformado en piedra. No puede moverse ni actuar. Resistencia al daño. Inmune al veneno y enfermedad.' },
    { name: 'Envenenado', desc: 'Tiene desventaja en todas las tiradas de ataque y pruebas de habilidad.' },
    { name: 'Derribado', desc: 'Los ataques cuerpo a cuerpo tienen ventaja. Los ataques a distancia tienen desventaja. Debe gastar movimiento para levantarse.' },
    { name: 'Apresado', desc: 'Su velocidad es 0. No puede teletransportarse ni viajar a otros planos.' },
    { name: 'Aturdido', desc: 'No puede moverse ni actuar. Falla automáticamente las TS de FUE y DES. Ventaja en ataques contra él.' },
    { name: 'Inconsciente', desc: 'No puede moverse ni actuar. Deja caer lo que sostiene. Falla automáticamente TS de FUE y DES. Ventaja en ataques contra él. Acierto automático si está a 5 pies.' },
    { name: 'Agotamiento', desc: 'Nivel 1: desventaja en pruebas de habilidad. Nivel 2: velocidad reducida a la mitad. Nivel 3: desventaja en TS y ataques. Nivel 4: PG máximos reducidos a la mitad. Nivel 5: velocidad 0. Nivel 6: muerte.' }
  ];
  var condEl = $('condition-list');
  condEl.innerHTML = conditions.map(function(c) { return '<div class="condition-item"><strong>' + c.name + '</strong><p>' + c.desc + '</p></div>'; }).join('');
}