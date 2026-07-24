export function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randArr(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function d20() { return rand(1, 20); }
export function parseDice(str) {
  if (!str) return 0;
  var m = str.match(/(\d+)d(\d+)/);
  if (!m) return 0;
  var total = 0;
  for (var i = 0; i < parseInt(m[1]); i++) total += rand(1, parseInt(m[2]));
  return total;
}
export function getMod(score) { return Math.floor((score - 10) / 2); }
export function modStr(mod) { return (mod >= 0 ? '+' : '') + mod; }
export function rollDiceBase(count, sides) {
  var rolls = [];
  for (var i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
  var total = rolls.reduce(function(s, v) { return s + v; }, 0);
  return { rolls: rolls, total: total };
}