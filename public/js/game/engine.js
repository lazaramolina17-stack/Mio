(function () {
  'use strict';

  var SCENE_VISUALS = {
    entrada_aldea: { art: '\u{1F3D8}\uFE0F  \u{1F33E}  \u{1F6E4}\uFE0F', theme: 'village', label: 'Entrada a la Aldea' },
    plaza_central: { art: '\u{1F3DB}\uFE0F  \u26F2  \u{1F3D8}\uFE0F', theme: 'village', label: 'Plaza de Vallebruma' },
    taberna: { art: '\u{1F37A}  \u{1F525}  \u{1FAB5}', theme: 'warm', label: 'El Drag\u00f3n Dormido' },
    mercado: { art: '\u2696\uFE0F  \u{1F4B0}  \u{1F9FA}', theme: 'market', label: 'Mercado de Vallebruma' },
    herrero: { art: '\u{1F528}  \u2694\uFE0F  \u{1F525}', theme: 'forge', label: 'Martillo y Yunque' },
    templo: { art: '\u26EA  \u2728  \u{1F56F}\uFE0F', theme: 'holy', label: 'Templo de la Luz Eterna' },
    camino_mazmorra: { art: '\u{1F332}  \u{1F32B}\uFE0F  \u{1FAA6}', theme: 'dark', label: 'Camino a la Cripta' },
    entrada_mazmorra: { art: '\u{1FAA6}  \u{1F311}  \u{1F578}\uFE0F', theme: 'dungeon', label: 'Entrada a la Cripta' },
    pasillo_principal: { art: '\u{1F5FF}  \u{1F3DB}\uFE0F  \u{1F56F}\uFE0F', theme: 'dungeon', label: 'El Pasillo de las Estatuas' },
    sala_guardia: { art: '\u{1F6E1}\uFE0F  \u2694\uFE0F  \u{1F480}', theme: 'danger', label: 'Sala de la Guardia Ca\u00edda' },
    cripta_arcana: { art: '\u{1F52E}  \u{1F4DC}  \u{1F48E}', theme: 'dark', label: 'La Cripta Arcana' },
    puente_colgante: { art: '\u{1F309}  \u{1F30A}  \u{1F4A8}', theme: 'dark', label: 'El Puente Colgante' },
    tesoro_reino: { art: '\u{1F451}  \u{1F4B0}  \u{1F3C6}', theme: 'forge', label: 'C\u00e1mara del Tesoro' },
    salida: { art: '\u{1F305}  \u{1F6AA}  \u{1F33F}', theme: 'forest', label: '\u00a1Libertad!' },
    atrio_olvidado: { art: '\u{1F33F}  \u{1F3DB}\uFE0F  \u{1F338}', theme: 'village', label: 'Atrio Olvidado' },
    cripta_secreta: { art: '\u{1F480}  \u{1F512}  \u{1F56F}\uFE0F', theme: 'dark', label: 'Cripta Oculta' },
    galeria_runica: { art: '\u{1F52E}  \u2728  \u{1F4FF}', theme: 'holy', label: 'Galer\u00eda de las Runas' },
    biblioteca_oscura: { art: '\u{1F4DA}  \u{1F56F}\uFE0F  \u{1F578}\uFE0F', theme: 'dark', label: 'Biblioteca Prohibida' },
    laboratorio_alquimico: { art: '\u2697\uFE0F  \u{1F525}  \u{1F9EA}', theme: 'forge', label: 'Laboratorio del Alquimista' },
    pozo_sagrado: { art: '\u26F2  \u{1F4A7}  \u2728', theme: 'holy', label: 'Pozo de la Sanaci\u00f3n' },
    catacumbas: { art: '\u{1FAA6}  \u{1F9B4}  \u{1F480}', theme: 'dungeon', label: 'Catacumbas Susurrantes' },
    sala_trono: { art: '\u{1F451}  \u2694\uFE0F  \u{1F3DB}\uFE0F', theme: 'danger', label: 'Sal\u00f3n del Trono Olvidado' },
    boveda_tesoro: { art: '\u{1F4B0}  \u{1F5E1}\uFE0F  \u{1F3C6}', theme: 'forge', label: 'B\u00f3veda del Rey' },
    catalizador: { art: '\u{1F52E}  \u{1F4E0}  \u26A1', theme: 'holy', label: 'C\u00e1mara del Catalizador' },
    paso_secreto: { art: '\u{1F6AA}  \u{1F526}  \u{1F578}\uFE0F', theme: 'dungeon', label: 'Paso Secreto' },
    santuario_estelar: { art: '\u{1F31F}  \u{1F30C}  \u2728', theme: 'holy', label: 'Santuario Estelar' }
  };
  var TYPE_VISUALS = {
    explore: { art: '\u{1F332}  \u{1F30D}  \u{1F5FA}\uFE0F', theme: 'forest', label: 'Exploraci\u00f3n' },
    rest: { art: '\u{1F6CF}\uFE0F  \u{1F525}  \u{1F37A}', theme: 'warm', label: 'Descanso' },
    loot: { art: '\u{1F4B0}  \u{1F48E}  \u2696\uFE0F', theme: 'market', label: 'Bot\u00edn' },
    combat: { art: '\u2694\uFE0F  \u{1F4A5}  \u{1F9A0}', theme: 'danger', label: 'Combate' },
    boss: { art: '\u{1F479}  \u2694\uFE0F  \u{1F525}', theme: 'danger', label: 'Jefe' }
  };

  var _particleInterval = null;
  var PARTICLE_THEMES = {
    village: { type: 'leaf', count: 3, speed: 8, opacity: 0.5 },
    warm: { type: 'ember', count: 4, speed: 5, opacity: 0.7 },
    market: { type: 'dust', count: 3, speed: 10, opacity: 0.3 },
    forge: { type: 'spark', count: 5, speed: 4, opacity: 0.8 },
    holy: { type: 'orb', count: 3, speed: 7, opacity: 0.4 },
    dark: { type: 'mist', count: 2, speed: 12, opacity: 0.15 },
    dungeon: { type: 'mist', count: 3, speed: 10, opacity: 0.2 },
    forest: { type: 'leaf', count: 2, speed: 9, opacity: 0.4 },
    danger: { type: 'ember', count: 3, speed: 6, opacity: 0.6 },
    default: { type: 'dust', count: 2, speed: 12, opacity: 0.2 }
  };

  function spawnParticles(themeId) {
    var container = document.getElementById('ambient-particles');
    if (!container) return;
    if (_particleInterval) clearInterval(_particleInterval);
    container.innerHTML = '';
    var cfg = PARTICLE_THEMES[themeId] || PARTICLE_THEMES.default;
    _particleInterval = setInterval(function () {
      if (!container || container.childNodes.length > 30) return;
      var p = document.createElement('div');
      p.className = 'particle ' + (cfg.type || 'dust');
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = '100%';
      p.style.setProperty('--p-fall', -(80 + Math.random() * 60) + 'px');
      p.style.setProperty('--p-drift', (Math.random() * 60 - 30) + 'px');
      p.style.setProperty('--p-opacity', cfg.opacity || 0.5);
      p.style.animationDuration = (cfg.speed || 8) + 's';
      p.style.animationDelay = '0s';
      container.appendChild(p);
      setTimeout(function () { if (p.parentNode) p.remove(); }, (cfg.speed || 8) * 1000 + 200);
    }, 300);
  }

  function renderVisual(scene, sceneId) {
    var el = document.getElementById('scene-visual');
    if (!el) return;
    var vis = SCENE_VISUALS[sceneId] || TYPE_VISUALS[scene.tipo] || TYPE_VISUALS.explore;
    el.className = 'scene-visual visual-' + (vis.theme || 'default');
    var artEl = el.querySelector('.visual-art');
    var labelEl = el.querySelector('.visual-label');
    if (artEl) artEl.textContent = vis.art || '\u2728';
    if (labelEl) labelEl.textContent = vis.label || scene.nombre;
    spawnParticles(vis.theme || 'default');
  }

  function setLocation(name) {
    var el = document.getElementById('game-location');
    if (el) el.textContent = name;
  }

  function screenShake(intensity) {
    var el = document.getElementById('game-view');
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  function hitFlash(type) {
    var div = document.createElement('div');
    div.className = 'hit-flash ' + (type || 'damage');
    document.body.appendChild(div);
    setTimeout(function () { div.remove(); }, 500);
  }

  function showDamageNumber(text, cls, x, y) {
    var div = document.createElement('div');
    div.className = 'dmg-popup ' + (cls || 'damage');
    div.textContent = text;
    div.style.left = (x || 50) + '%';
    div.style.top = (y || 35) + '%';
    div.style.transform = 'translate(-50%,-50%)';
    document.body.appendChild(div);
    setTimeout(function () { div.remove(); }, 1000);
  }

  function startGame() {
    var char = window.state.character;
    if (!char) {
      alert('Primero genera un personaje en la pesta\u00f1a Personaje.');
      return;
    }
    window.setupPlayer(char);
    window.game.state = 'explore';
    window.game.scene = 'entrada_mazmorra';
    window.game.narrator = [];
    window.game.gold = 0;
    window.game.inventory = [];
    window.game.xp = 0;
    window.game.combat = null;
    window.game.turnIndex = 0;
    window.game.visitedScenes = [];
    window.game.dungeonDepth = 0;
    window.game.scenePools = null;
    window.game.ttsEnabled = true;
    window.game.ttsMode = 'web';
    window.waitVoices(function () { window.buildVoicePanel(); });
    var ttsBtn = document.getElementById('btn-tts');
    if (ttsBtn) ttsBtn.textContent = '\u{1F50A} Voz';
    var modeBtn = document.getElementById('btn-tts-mode');
    if (modeBtn) modeBtn.textContent = '\u{1F310} Web';
    var menuEl = document.getElementById('game-menu');
    var viewEl = document.getElementById('game-view');
    if (menuEl) menuEl.classList.add('hidden');
    if (viewEl) viewEl.classList.remove('hidden');
    window.narrate('Te encuentras en las afueras de una aldea. El viento trae el olor a hierba y hogueras. Una antigua cripta se alza en la colina cercana.', 'explore');
    window.narrateRandom('ambiente_bosque', 'explore');
    enterScene('entrada_aldea');
  }

  function buildScenePools() {
    var pools = {};
    Object.keys(window.D.escenas).forEach(function (id) {
      var s = window.D.escenas[id];
      var type = s.tipo || 'explore';
      if (!pools[type]) pools[type] = [];
      pools[type].push({ id: id, scene: s });
    });
    pools['all'] = Object.keys(window.D.escenas).map(function (id) { return { id: id, scene: window.D.escenas[id] }; });
    return pools;
  }

  function getRandomSceneOfType(type, exclude, depth) {
    if (!window.game.scenePools) window.game.scenePools = buildScenePools();
    var candidates = (window.game.scenePools[type] || window.game.scenePools.all || []).filter(function (item) {
      return exclude.indexOf(item.id) === -1 && item.id !== 'salida';
    });
    if (candidates.length === 0) {
      candidates = (window.game.scenePools[type] || window.game.scenePools.all || []).filter(function (item) {
        return item.id !== 'salida';
      });
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)].id;
  }

  function randomizeSceneOptions(scene) {
    var types = ['explore', 'combat', 'loot', 'rest'];
    var result = { _randomized: true, nombre: scene.nombre, desc: scene.desc, tipo: scene.tipo, opciones: [] };
    scene.opciones.forEach(function (opt) {
      var r = Object.assign({}, opt);
      if (!/^random_/.test(r.resultado) && r.resultado !== 'salida') {
        var type = scene.tipo || 'explore';
        if (Math.random() < 0.7) {
          r.resultado = 'random_' + type;
        }
      }
      result.opciones.push(r);
    });
    return result;
  }

  function enterScene(sceneId, isRandom) {
    var scene = window.D.escenas[sceneId];
    if (!scene) { window.narrate('No hay nada m\u00e1s que explorar aqu\u00ed.', 'explore'); return; }
    window.game.scene = sceneId;
    if (window.game.visitedScenes.indexOf(sceneId) === -1) window.game.visitedScenes.push(sceneId);
    window.game.dungeonDepth = window.game.visitedScenes.length;
    if (isRandom || window.game.randomFlow) {
      window.game.randomFlow = true;
      scene = randomizeSceneOptions(scene);
    }
    setLocation(scene.nombre);
    renderVisual(scene, sceneId);
    window.narrate(scene.desc, 'explore');
    if (scene.encuentro && Math.random() < scene.encuentro.probabilidad) {
      startCombat(scene.encuentro.monstruos);
      return;
    }
    renderActions(scene);
  }

  function renderActions(scene) {
    var el = document.getElementById('action-buttons');
    if (!el) return;
    el.innerHTML = '';
    if (window.game.state === 'combat' && window.game.combat) {
      renderCombatActions();
      return;
    }
    var container = document.createElement('div');
    container.className = 'action-grid';
    scene.opciones.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.innerHTML = '<span class="action-icon">\u25B6</span><span class="action-label">' + opt.texto + '</span>';
      btn.onclick = function () { handleChoice(opt, scene); };
      container.appendChild(btn);
    });
    el.appendChild(container);
  }

  function handleChoice(opt, scene) {
    if (opt.checks && opt.checks.habilidad && opt.checks.cd) {
      var skillMap = { 'Fuerza': 'FUE', 'Destreza': 'DES', 'Constituci\u00f3n': 'CON', 'Inteligencia': 'INT', 'Sabidur\u00eda': 'SAB', 'Carisma': 'CAR' };
      var abilKey = skillMap[opt.checks.habilidad] || 'DES';
      var roll = window.d20();
      var mod = window.game.player.mods[abilKey] || 0;
      var total = roll + mod;
      var success = total >= opt.checks.cd;
      if (success) {
        window.narrate('(' + opt.checks.habilidad + ' ' + total + ' vs CD ' + opt.checks.cd + ') ' + opt.desc, 'explore');
        window.narrateRandom('exploracion_exito', 'explore');
      } else {
        window.narrate('(' + opt.checks.habilidad + ' ' + total + ' vs CD ' + opt.checks.cd + ') Fallaste. ' + (opt.checks.fallo || 'No logras nada.'), 'explore');
        window.narrateRandom('exploracion_fracaso', 'explore');
      }
    } else {
      window.narrate(opt.desc, 'explore');
    }
    var targetId = opt.resultado;
    var wasRandom = false;
    if (typeof targetId === 'string' && targetId.indexOf('random_') === 0) {
      var type = targetId.replace('random_', '');
      var randomId = getRandomSceneOfType(type, window.game.visitedScenes, window.game.dungeonDepth);
      if (randomId) {
        targetId = randomId;
        wasRandom = true;
        window.narrate('Te adentras en lo desconocido...', 'explore');
        window.narrateRandom('exploracion_exito', 'explore');
      } else {
        window.narrate('No encuentras nada nuevo por aqu\u00ed.', 'explore');
        renderActions(scene);
        return;
      }
    }
    if (window.D.escenas[targetId]) {
      if (Math.random() < 0.15) {
        window.narrateRandom('evento_aleatorio', 'explore');
      }
      if (window.game.dungeonDepth >= 5 && Math.random() < 0.25) {
        window.narrate('Sientes que te acercas al final de este lugar...', 'explore');
        if (window.D.escenas['sala_trono']) targetId = 'sala_trono';
        else if (window.D.escenas['boveda_tesoro']) targetId = 'boveda_tesoro';
        else if (window.D.escenas['salida']) targetId = 'salida';
      }
      enterScene(targetId, wasRandom);
    } else {
      renderActions(scene);
    }
  }

  function startCombat(monsterDefs) {
    window.game.state = 'combat';
    window.game.combat = {
      enemies: [],
      initiative: [],
      round: 1
    };
    monsterDefs.forEach(function (def) {
      for (var i = 0; i < def.cantidad; i++) {
        var mData = window.getMonsterData(def.nombre);
        if (mData) {
          window.game.combat.enemies.push({
            name: def.nombre,
            data: mData,
            hp: window.parseMonsterHP(mData.pg),
            maxHp: window.parseMonsterHP(mData.pg),
            ac: mData.ca,
            attackBonus: window.getMonsterAttackBonus(mData),
            damage: window.getMonsterDamage(mData),
            isDead: false
          });
        }
      }
    });
    var initOrder = [];
    initOrder.push({ name: window.game.player.name, type: 'player', init: window.d20() + window.game.player.initiative, isDead: false });
    window.game.combat.enemies.forEach(function (e, i) {
      initOrder.push({ name: e.name, type: 'enemy', index: i, init: window.d20() + window.getMod(e.data.des || 10), isDead: false });
    });
    initOrder.sort(function (a, b) { return b.init - a.init; });
    window.game.combat.initiative = initOrder;
    window.game.turnIndex = 0;
    var ct = document.getElementById('combat-tracker');
    var ep = document.getElementById('enemies-panel');
    if (ct) ct.classList.remove('hidden');
    if (ep) ep.classList.remove('hidden');
    window.narrateRandom('combate_inicio', 'combat');
    renderCombatTracker();
    renderEnemies();
    renderActions(null);
    window.updateStatusBar();
  }

  function renderCombatTracker() {
    var el = document.getElementById('initiative-list');
    if (!el) return;
    el.innerHTML = window.game.combat.initiative.map(function (entry, i) {
      var isCurrent = i === window.game.turnIndex;
      var cls = entry.type === 'player' ? 'player' : '';
      var currentCls = isCurrent ? ' current' : '';
      var hpHtml = '';
      if (entry.type === 'enemy' && !entry.isDead) {
        var enemy = window.game.combat.enemies[entry.index];
        hpHtml = '<span class="initiative-hp">[' + enemy.hp + '/' + enemy.maxHp + ']</span>';
      }
      return '<div class="initiative-entry' + cls + currentCls + '">' +
        '<span class="initiative-name">' + entry.name + '</span>' +
        hpHtml +
        '<span class="initiative-badge">' + entry.init + '</span>' +
        '</div>';
    }).join('');
  }

  function renderEnemies() {
    var el = document.getElementById('enemies-list');
    if (!el) return;
    el.innerHTML = window.game.combat.enemies.map(function (e) {
      var pct = (e.hp / e.maxHp) * 100;
      var deadCls = e.isDead ? ' dead' : '';
      return '<div class="enemy-card' + deadCls + '">' +
        '<div class="enemy-name">' + e.name + '</div>' +
        '<div class="enemy-stats">CA ' + e.ac + ' \u00b7 PG ' + e.maxHp + '</div>' +
        '<div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="enemy-hp-text">' + e.hp + '/' + e.maxHp + '</div>' +
        '</div>';
    }).join('');
  }

  function renderCombatActions() {
    var el = document.getElementById('action-buttons');
    if (!el) return;
    var container = document.createElement('div');
    container.className = 'action-grid';

    var attackBtn = document.createElement('button');
    attackBtn.className = 'action-btn primary';
    attackBtn.innerHTML = '<span class="action-icon">\u2694\uFE0F</span><span class="action-label">Atacar</span>';
    attackBtn.onclick = playerAttack;
    container.appendChild(attackBtn);

    var defendBtn = document.createElement('button');
    defendBtn.className = 'action-btn';
    defendBtn.innerHTML = '<span class="action-icon">\u{1F6E1}\uFE0F</span><span class="action-label">Defender</span>';
    defendBtn.onclick = playerDefend;
    container.appendChild(defendBtn);

    var itemBtn = document.createElement('button');
    itemBtn.className = 'action-btn';
    itemBtn.innerHTML = '<span class="action-icon">\u{1F9EA}</span><span class="action-label">Objeto</span>';
    itemBtn.onclick = playerUseItem;
    itemBtn.disabled = window.game.inventory.filter(function (i) { return i.type === 'potion'; }).length === 0;
    container.appendChild(itemBtn);

    var fleeBtn = document.createElement('button');
    fleeBtn.className = 'action-btn danger';
    fleeBtn.innerHTML = '<span class="action-icon">\u{1F3C3}</span><span class="action-label">Huir</span>';
    fleeBtn.onclick = playerFlee;
    container.appendChild(fleeBtn);

    el.innerHTML = '';
    el.appendChild(container);
  }

  function playerAttack() {
    if (!window.game.combat) return;
    var roll = window.d20();
    var bonus = window.getAttackBonus();
    var total = roll + bonus;
    var isCrit = roll === 20;
    var target = window.game.combat.enemies.find(function (e) { return !e.isDead; });
    if (!target) { window.narrate('No hay enemigos para atacar.', 'combat'); return; }
    if (isCrit) {
      screenShake(3);
      hitFlash('crit');
      showDamageNumber('\u00a1CR\u00cdTICO!', 'crit', 50, 30);
      window.narrateRandom('combate_golpe_critico', 'combat');
    } else if (total >= target.ac) {
      screenShake(2);
      hitFlash('damage');
      showDamageNumber('\u00a1Golpe!', 'damage', 50, 35);
      window.narrateRandom('combate_golpe_acertado', 'combat');
    } else {
      window.narrateRandom('combate_golpe_fallido', 'combat');
      endPlayerTurn();
      return;
    }
    var damage = window.parseDice(window.getWeaponDamage(window.game.player.weapon));
    if (isCrit) damage *= 2;
    target.hp -= damage;
    window.narrate(' (' + total + ' vs CA ' + target.ac + ') Causaste ' + damage + ' puntos de da\u00f1o.', 'combat');
    showDamageNumber('-' + damage, 'damage', 45 + Math.random() * 10, 32);
    if (target.hp <= 0) {
      target.isDead = true;
      window.narrateRandom('combate_muerte', 'combat');
      window.game.xp += parseInt(target.data.cr.replace('/', '')) * 10 || 10;
      checkCombatEnd();
      return;
    }
    renderEnemies();
    renderCombatTracker();
    endPlayerTurn();
  }

  function playerDefend() {
    window.narrate('Te pones en posici\u00f3n defensiva. Tu armadura reluce bajo la luz tenue.', 'combat');
    window.game.player.actions.push({ type: 'defend', duration: 1 });
    endPlayerTurn();
  }

  function playerUseItem() {
    var potions = window.game.inventory.filter(function (i) { return i.type === 'potion'; });
    if (potions.length === 0) { window.narrate('No tienes pociones.', 'combat'); return; }
    var potion = potions[0];
    window.game.inventory = window.game.inventory.filter(function (i) { return i !== potion; });
    var heal = window.parseDice('2d4+2');
    window.game.player.hp = Math.min(window.game.player.maxHp, window.game.player.hp + heal);
    hitFlash('heal');
    showDamageNumber('+' + heal, 'heal', 50, 35);
    window.narrate('Bebes la ' + potion.name + '. Recuperas ' + heal + ' puntos de golpe.', 'rest');
    window.updateStatusBar();
    endPlayerTurn();
  }

  function playerFlee() {
    var roll = window.d20();
    if (roll >= 10) {
      window.narrate('Logras huir del combate. La criatura no te detiene.', 'explore');
      endCombat(false);
    } else {
      window.narrate('Intentas huir pero la criatura te alcanza. El combate contin\u00faa.', 'combat');
      endPlayerTurn();
    }
  }

  function endPlayerTurn() {
    enemyTurn();
  }

  function enemyTurn() {
    var aliveEnemies = window.game.combat.enemies.filter(function (e) { return !e.isDead; });
    if (aliveEnemies.length === 0) { checkCombatEnd(); return; }
    aliveEnemies.forEach(function (enemy) {
      if (window.game.player.hp <= 0) { checkCombatEnd(); return; }
      var roll = window.d20();
      var total = roll + enemy.attackBonus;
      if (total >= window.game.player.ac) {
        var damage = window.parseDice(enemy.damage);
        window.game.player.hp -= damage;
        screenShake(2);
        hitFlash('damage');
        showDamageNumber('-' + damage, 'damage', 45 + Math.random() * 10, 30);
        window.narrate('El ' + enemy.name + ' te ataca. (' + total + ' vs CA ' + window.game.player.ac + ') Recibes ' + damage + ' puntos de da\u00f1o.', 'combat');
      } else {
        window.narrate('El ' + enemy.name + ' falla su ataque.', 'combat');
      }
    });
    renderCombatTracker();
    window.updateStatusBar();
    if (window.game.player.hp <= 0) {
      window.narrate('Has ca\u00eddo en combate. Tus ojos se cierran sobre el mundo...', 'combat');
      gameOver();
      return;
    }
    window.game.turnIndex = (window.game.turnIndex + 1) % window.game.combat.initiative.length;
    while (window.game.combat.initiative[window.game.turnIndex] && window.game.combat.initiative[window.game.turnIndex].type === 'enemy' && window.game.combat.enemies[window.game.combat.initiative[window.game.turnIndex].index].isDead) {
      window.game.turnIndex = (window.game.turnIndex + 1) % window.game.combat.initiative.length;
    }
    renderCombatTracker();
  }

  function checkCombatEnd() {
    var alive = window.game.combat.enemies.filter(function (e) { return !e.isDead; });
    if (alive.length === 0) {
      window.narrateRandom('combate_victoria', 'combat');
      var xpGain = 20;
      window.game.xp += xpGain;
      window.narrate('Ganas ' + xpGain + ' puntos de experiencia.', 'explore');
      var scene = window.D.escenas[window.game.scene];
      if (scene && scene.tesoro) {
        var gold = parseInt(scene.tesoro.oro) || 0;
        window.game.gold += gold;
        window.narrate('Encuentras ' + scene.tesoro.oro + ' en el suelo.', 'loot');
        window.narrateRandom('tesoro_encontrado', 'loot');
        if (scene.tesoro.objetos) {
          scene.tesoro.objetos.forEach(function (obj) {
            window.game.inventory.push({ name: obj, type: 'treasure' });
            window.narrate('A\u00f1ades "' + obj + '" a tu inventario.', 'loot');
          });
        }
      }
      endCombat(true);
    }
  }

  function endCombat(victory) {
    window.game.state = 'explore';
    window.game.combat = null;
    var ct = document.getElementById('combat-tracker');
    var ep = document.getElementById('enemies-panel');
    if (ct) ct.classList.add('hidden');
    if (ep) ep.classList.add('hidden');
    if (victory) {
      var goldReward = Math.floor(Math.random() * 20) + 5;
      window.game.gold += goldReward;
      var xpReward = Math.floor(Math.random() * 30) + 10;
      window.game.xp += xpReward;
      window.narrate('Obtienes ' + goldReward + ' mo y ' + xpReward + ' XP del bot\u00edn.', 'loot');
      if (Math.random() < 0.3) {
        var tables = ['menor', 'pociones', 'menor', 'armas_magicas'];
        var pick = window.D.tesoro[tables[Math.floor(Math.random() * tables.length)]];
        if (pick && pick.length > 0) {
          var item = pick[Math.floor(Math.random() * pick.length)];
          window.game.inventory.push(item.nombre);
          window.narrate('\u00a1Encuentras un objeto: ' + item.nombre + '! (' + (item.desc || '') + ')', 'loot');
        }
      }
      checkLevelUp();
    }
    window.updateStatusBar();
    var scene = window.D.escenas[window.game.scene];
    if (scene) { renderActions(scene); }
  }

  function checkLevelUp() {
    var xpNeeded = window.game.player.level * 100;
    while (window.game.xp >= xpNeeded) {
      window.game.xp -= xpNeeded;
      window.game.player.level++;
      window.game.player.maxHp += Math.floor(Math.random() * 6) + 2;
      window.game.player.hp = window.game.player.maxHp;
      window.narrate('\u00a1Has subido al nivel ' + window.game.player.level + '! Tus heridas se cierran.', 'loot');
      window.narrateRandom('combate_victoria', 'combat');
      xpNeeded = window.game.player.level * 100;
    }
  }

  function gameOver() {
    window.game.state = 'game_over';
    window.game.combat = null;
    var ct = document.getElementById('combat-tracker');
    var ep = document.getElementById('enemies-panel');
    if (ct) ct.classList.add('hidden');
    if (ep) ep.classList.add('hidden');
    window.narrate('La aventura ha terminado. Tu leyenda quedar\u00e1 en el olvido.', 'rest');
    var el = document.getElementById('action-buttons');
    if (el) {
      el.innerHTML = '<div class="action-grid"><button class="action-btn danger" id="btn-restart" style="grid-column:1/-1"><span class="action-icon">\u{1F504}</span><span class="action-label">Reintentar</span></button></div>';
      var restartBtn = document.getElementById('btn-restart');
      if (restartBtn) restartBtn.onclick = function () { goMenu(); };
    }
  }

  function goMenu() {
    window.game.state = 'menu';
    window.game.scene = null;
    window.game.combat = null;
    window.game.narrator = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    var menuEl = document.getElementById('game-menu');
    var viewEl = document.getElementById('game-view');
    var ct = document.getElementById('combat-tracker');
    var ep = document.getElementById('enemies-panel');
    if (menuEl) menuEl.classList.remove('hidden');
    if (viewEl) viewEl.classList.add('hidden');
    if (ct) ct.classList.add('hidden');
    if (ep) ep.classList.add('hidden');
    window.renderNarrator();
  }

  function initGameEvents() {
    var btnNew = document.getElementById('btn-new-game');
    var btnBack = document.getElementById('btn-back-to-toolkit');
    var btnLoad = document.getElementById('btn-load-game');
    var btnTts = document.getElementById('btn-tts');
    var btnTtsMode = document.getElementById('btn-tts-mode');
    var btnTestVoice = document.getElementById('btn-test-voice');
    var btnDebugVoices = document.getElementById('btn-debug-voices');
    var btnVoicePanel = document.getElementById('btn-voice-panel');

    if (btnNew) btnNew.addEventListener('click', startGame);
    if (btnBack) btnBack.addEventListener('click', goMenu);
    if (btnLoad) {
      btnLoad.addEventListener('click', function () {
        try {
          var data = localStorage.getItem('dnd_last_char');
          if (data) {
            window.state.character = JSON.parse(data);
            startGame();
          } else { alert('No hay personaje guardado.'); }
        } catch (e) { alert('Error al cargar.'); }
      });
    }
    if (btnTts) {
      btnTts.addEventListener('click', function () {
        window.game.ttsEnabled = !window.game.ttsEnabled;
        this.textContent = window.game.ttsEnabled ? '\u{1F50A} Voz' : '\u{1F507} Voz';
        if (!window.game.ttsEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      });
    }
    if (btnTtsMode) {
      btnTtsMode.addEventListener('click', function () {
        window.game.ttsMode = (window.game.ttsMode === 'web') ? 'local' : 'web';
        this.textContent = window.game.ttsMode === 'web' ? '\u{1F310} Web' : '\u{1F4F1} Local';
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      });
    }
    if (btnTestVoice) {
      btnTestVoice.addEventListener('click', function () {
        window.speakText('Bienvenido, aventurero. Que los dioses te gu\u00eden en tu traves\u00eda.');
      });
    }
    if (btnDebugVoices) {
      btnDebugVoices.addEventListener('click', function () {
        var voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
          alert('No hay voces disponibles todav\u00eda. Aseg\u00farate de tener Google TTS instalado.');
          return;
        }
        var msg = 'Voces disponibles (' + voices.length + '):\n\n';
        voices.forEach(function (v) {
          msg += '\u2022 ' + v.name + '\n  lang=' + v.lang + ' local=' + v.localService + '\n';
        });
        console.log('[TTS] Voces:', voices);
        alert(msg);
      });
    }
    if (btnVoicePanel) {
      btnVoicePanel.addEventListener('click', function () {
        var panel = document.getElementById('voice-panel');
        if (!panel) return;
        var isHidden = panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        this.classList.toggle('active');
        if (isHidden) window.buildVoicePanel();
      });
    }
    document.addEventListener('click', function (e) {
      var panel = document.getElementById('voice-panel');
      var btn = document.getElementById('btn-voice-panel');
      if (!panel || !btn) return;
      if (!panel.classList.contains('hidden') && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        panel.classList.add('hidden');
        btn.classList.remove('active');
      }
    });

    window.waitVoices(function () { window.buildVoicePanel(); });

    var tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (this.dataset.tab === 'jugar') {
          var menuEl = document.getElementById('game-menu');
          var viewEl = document.getElementById('game-view');
          if (menuEl) menuEl.classList.remove('hidden');
          if (viewEl) viewEl.classList.add('hidden');
          var ct = document.getElementById('combat-tracker');
          var ep = document.getElementById('enemies-panel');
          if (ct) ct.classList.add('hidden');
          if (ep) ep.classList.add('hidden');
          window.game.state = 'menu';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGameEvents);
  } else {
    initGameEvents();
  }
})();