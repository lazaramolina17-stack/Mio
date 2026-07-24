import { D } from './index.js';

export function applyCompatibility() {
  if (D.razas) {
    D.races = D.razas;
    D.races.forEach(r => {
      r.name = r.nombre; r.bonuses = r.bonos; r.bonusChoice = r.bonos_eleccion;
      var abilMap = {str:'FUE', dex:'DES', con:'CON', int:'INT', wis:'SAB', cha:'CAR'};
      if (r.bonuses) {
        var newBonuses = {};
        Object.keys(r.bonuses).forEach(function(k) {
          if (abilMap[k]) newBonuses[abilMap[k]] = r.bonuses[k];
        });
        r.bonuses = newBonuses;
      }
      if (r.rasgos_extra) r.rasgos = r.rasgos_extra;
    });
  }
  if (D.clases) {
    D.classes = D.clases;
    D.classes.forEach(c => {
      c.name = c.nombre;
      c.hitDie = parseInt((c.dado_golpe||'').replace('d','')) || 8;
      if (c.competencias) {
        c.armor = c.competencias.armaduras ? c.competencias.armaduras.join(', ') : '';
        c.weapons = c.competencias.armas ? c.competencias.armas.join(', ') : '';
        c.savingThrows = c.competencias.salvaciones || [];
        c.skills = c.competencias.habilidades || [];
      }
    });
  }
  if (D.trasfondos) {
    D.backgrounds = D.trasfondos;
    D.backgrounds.forEach(b => { b.name = b.nombre; });
  }
  if (D.hechizos) {
    D.spells = D.hechizos;
    D.spells.forEach(s => {
      s.name = s.nombre; s.school = s.escuela;
      s.castingTime = s.tiempo; s.range = s.alcance;
      s.duration = s.duracion; s.description = s.descripcion;
      s.level = s.nivel; s.classes = s.clases;
    });
  }
  if (D.subrazas) {
    D.subraces = D.subrazas;
    D.subraces.forEach(sr => { sr.bonuses = sr.bonos; });
  }
}