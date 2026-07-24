import { $ } from '../dom.js';
import { game } from './state.js';
import { D } from '../data/index.js';

export function setupPlayer(char) {
  game.player = {
    name: char.name,
    level: char.level,
    race: char.race,
    subrace: char.subrace,
    class: char.class,
    scores: char.scores,
    mods: char.mods,
    maxHp: char.hp,
    hp: char.hp,
    ac: 10 + (char.mods['DES'] || 0),
    proficiency: Math.ceil(char.level / 4) + 1,
    initiative: char.mods['DES'] || 0,
    weapon: null,
    armor: null,
    shield: null,
    actions: [],
    reactions: []
  };
  if (char.equipment) {
    game.player.weapon = char.equipment.weapon || null;
    game.player.armor = char.equipment.armor || null;
    game.player.shield = char.equipment.shield || null;
  }
  var armorList = (D.equipo && D.equipo.armaduras) || [];
  if (game.player.armor) {
    var armor = armorList.find(function(a) { return a.nombre === game.player.armor; });
    if (armor) {
      if (armor.tipo === 'Ligera') { game.player.ac = armor.ca + (game.player.mods['DES'] || 0); }
      else if (armor.tipo === 'Media') { game.player.ac = armor.ca + Math.min(game.player.mods['DES'] || 0, 2); }
      else if (armor.tipo === 'Pesada') { game.player.ac = armor.ca; }
    }
  }
  if (game.player.shield) game.player.ac += 2;
  game.gold = 0;
  game.inventory = [];
  game.xp = 0;
}

export function updateStatusBar() {
  $('status-hp').textContent = game.player.hp + '/' + game.player.maxHp;
  $('status-level').textContent = game.player.level;
  $('status-xp').textContent = game.xp;
  $('status-gold').textContent = game.gold;
}

export function getWeaponData(name) {
  if (!name) return null;
  var allWeapons = [].concat((D.equipo && D.equipo.armas_simples) || [], (D.equipo && D.equipo.armas_marciales) || []);
  return allWeapons.find(function(w) { return w.nombre === name; }) || null;
}

export function getWeaponDamage(weapon) {
  if (!weapon) return '1d4';
  var wpn = getWeaponData(weapon);
  if (!wpn || !wpn.daño) return '1d4';
  return wpn.daño;
}

export function getAttackBonus() {
  var wpn = getWeaponData(game.player.weapon);
  if (!wpn) return game.player.mods['DES'] || 0;
  var isFinesse = wpn.propiedades && wpn.propiedades.indexOf('Finesse') !== -1;
  if (isFinesse) return Math.max(game.player.mods['FUE'] || 0, game.player.mods['DES'] || 0) + game.player.proficiency;
  return (game.player.mods['FUE'] || 0) + game.player.proficiency;
}

export function getMonsterData(name) {
  return (D.bestiario || []).find(function(m) { return m.nombre === name; }) || null;
}

export function parseMonsterHP(pgStr) {
  if (!pgStr) return 10;
  var m = pgStr.match(/(\d+)/);
  return m ? parseInt(m[1]) : 10;
}

export function getMonsterAttackBonus(monster) {
  var acciones = monster.acciones || [];
  for (var i = 0; i < acciones.length; i++) {
    var m = acciones[i].desc.match(/\+(\d+)\s*a\s*golpear/);
    if (m) return parseInt(m[1]);
  }
  return 0;
}

export function getMonsterDamage(monster) {
  var acciones = monster.acciones || [];
  for (var i = 0; i < acciones.length; i++) {
    var m = acciones[i].desc.match(/(\d+d\d+)/);
    if (m) return m[1];
  }
  return '1d6';
}