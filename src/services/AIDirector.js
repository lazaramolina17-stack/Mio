const db = require('../../db/connection');
const aiConfig = require('../config/ai');
const prompts = require('../utils/prompts');

class AIDirector {
  constructor(worldId) {
    this.worldId = worldId;
    this.apiKey = aiConfig.apiKey;
    this.endpoint = aiConfig.endpoint;
    this.model = aiConfig.model;
    this.maxTokens = aiConfig.maxTokens;
    this.temperature = aiConfig.temperature;
  }

  async callAPI(messages) {
    if (!this.apiKey || this.apiKey === 'sk-placeholder-replace-with-real-key') {
      return null;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        console.error('[AIDirector] API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
    } catch (err) {
      console.error('[AIDirector] API call failed:', err.message);
      return null;
    }
  }

  async getWorldContext() {
    const world = await db.query('SELECT name, slug, tick_count, metadata FROM worlds WHERE id = $1', [this.worldId]);
    const worldData = world.rows[0] || {};

    const regions = await db.query('SELECT name, type, climate FROM regions WHERE world_id = $1 LIMIT 5', [this.worldId]);
    const settlements = await db.query('SELECT name, type, population FROM settlements WHERE world_id = $1 LIMIT 5', [this.worldId]);
    const npcs = await db.query('SELECT name, profession, settlement_id FROM npcs WHERE world_id = $1 AND status = \'alive\' LIMIT 10', [this.worldId]);
    const events = await db.query('SELECT title, description, tick FROM history_events WHERE world_id = $1 ORDER BY tick DESC LIMIT 5', [this.worldId]);

    return {
      world: worldData,
      regions: regions.rows,
      settlements: settlements.rows,
      npcs: npcs.rows,
      recentEvents: events.rows,
    };
  }

  buildWorldStateText(ctx) {
    let text = 'Mundo: ' + (ctx.world.name || 'Desconocido');
    text += '\nTicks transcurridos: ' + (ctx.world.tick_count || 0);
    text += '\n\nRegiones: ' + ctx.regions.map(function (r) { return r.name + ' (' + r.type + ')'; }).join(', ');
    text += '\nAsentamientos: ' + ctx.settlements.map(function (s) { return s.name + ' (' + s.type + ', pop: ' + s.population + ')'; }).join(', ');
    text += '\nNPCs presentes: ' + ctx.npcs.map(function (n) { return n.name + ' (' + n.profession + ')'; }).join(', ');
    text += '\n\nEventos recientes:\n' + ctx.recentEvents.map(function (e) { return '- ' + e.title + ' (tick ' + e.tick + ')'; }).join('\n');
    return text;
  }

  async generateNarration(context) {
    const ctx = await this.getWorldContext();

    const systemPrompt = prompts.DIRECTOR_SYSTEM_PROMPT
      .replace('{world_state}', this.buildWorldStateText(ctx))
      .replace('{player_actions}', context.playerActions || 'Los jugadores están explorando.')
      .replace('{present_npcs}', context.presentNpcs || ctx.npcs.map(function (n) { return n.name; }).join(', '))
      .replace('{relevant_history}', context.relevantHistory || ctx.recentEvents.map(function (e) { return e.title; }).join(', '));

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Escena actual: ' + (context.scene || 'Los aventureros llegan a un nuevo lugar.') + '\n\nAcción: ' + (context.action || 'Observan el entorno.') + '\n\nDescribe la escena de forma inmersiva.' },
    ];

    const response = await this.callAPI(messages);
    if (response) {
      return response;
    }

    return this.fallbackNarration(context);
  }

  async generateDialogue(npcId, playerMessage) {
    const npcResult = await db.query(
      'SELECT name, profession, personality, emotional_state, memory FROM npcs WHERE id = $1 AND world_id = $2',
      [npcId, this.worldId]
    );

    if (npcResult.rows.length === 0) {
      return { error: 'NPC not found' };
    }

    const npc = npcResult.rows[0];
    const personality = typeof npc.personality === 'string' ? npc.personality : JSON.stringify(npc.personality || {});
    const emotions = typeof npc.emotional_state === 'string' ? npc.emotional_state : JSON.stringify(npc.emotional_state || {});
    const memories = Array.isArray(npc.memory) ? npc.memory.slice(-3).map(function (m) { return m.description || JSON.stringify(m); }).join('; ') : 'Ninguno relevante.';

    const systemPrompt = prompts.NPC_DIALOGUE_PROMPT
      .replace('{npc_name}', npc.name)
      .replace('{npc_profession}', npc.profession || 'aldeano')
      .replace('{npc_personality}', personality)
      .replace('{npc_emotional_state}', emotions)
      .replace('{npc_memories}', memories);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: playerMessage },
    ];

    const response = await this.callAPI(messages);
    if (response) {
      return { npc: { name: npc.name, profession: npc.profession }, response: response };
    }

    return this.fallbackDialogue(npc, playerMessage);
  }

  async generateQuest(context) {
    const ctx = await this.getWorldContext();
    const settlement = context.settlementId ? await db.query('SELECT name FROM settlements WHERE id = $1', [context.settlementId]) : null;
    const npc = context.npcId ? await db.query('SELECT name, profession FROM npcs WHERE id = $1', [context.npcId]) : null;

    const systemPrompt = prompts.QUEST_GENERATION_PROMPT
      .replace('{world_name}', ctx.world.name || 'Vallebruma')
      .replace('{settlement_name}', (settlement && settlement.rows[0]) ? settlement.rows[0].name : 'una aldea cercana')
      .replace('{npc_name}', (npc && npc.rows[0]) ? npc.rows[0].name : 'un misterioso desconocido')
      .replace('{npc_profession}', (npc && npc.rows[0]) ? npc.rows[0].profession : 'viajero')
      .replace('{difficulty}', context.difficulty || 'media')
      .replace('{recent_events}', ctx.recentEvents.map(function (e) { return e.title; }).join(', '));

    const messages = [
      { role: 'system', content: 'Genera solo JSON válido, sin explicaciones.' },
      { role: 'user', content: systemPrompt },
    ];

    const response = await this.callAPI(messages);
    if (response) {
      try {
        const cleaned = response.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('[AIDirector] Failed to parse quest JSON:', e.message);
      }
    }

    return this.fallbackQuest(context);
  }

  async interpretAction(playerAction) {
    const systemPrompt = prompts.ACTION_INTERPRETER_PROMPT
      .replace('{player_action}', playerAction);

    const messages = [
      { role: 'system', content: 'Genera solo JSON válido, sin explicaciones.' },
      { role: 'user', content: systemPrompt },
    ];

    const response = await this.callAPI(messages);
    if (response) {
      try {
        const cleaned = response.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('[AIDirector] Failed to parse action JSON:', e.message);
      }
    }

    return {
      type: 'custom',
      target: null,
      skill: null,
      description: playerAction,
    };
  }

  fallbackNarration(context) {
    const scenes = {
      forest: 'El viento susurra entre las ramas de los antiguos robles. Hojas secas crujen bajo tus pies mientras un sendero de piedra se pierde entre la espesura. En la distancia, el canto de un cuervo rompe el silencio del bosque.',
      village: 'El pueblo bulle con la actividad del atardecer. Humo de chimeneas se eleva hacia el cielo anaranjado. Los aldeanos se preparan para la noche, guardando sus herramientas y cerrando sus puestos en el mercado.',
      dungeon: 'La oscuridad te envuelve como un manto pesado. El aire huele a humedad y piedra antigua. Gotas de agua caen desde algún lugar, marcando el ritmo en un eco hipnótico. Tus pasos resuenan en el pasillo de piedra.',
      tavern: 'El calor de la chimenea te recibe al entrar. La taberna está animada, con grupos de aventureros y lugareños compartiendo historias y bebidas. Una melodía de laúd flota sobre el murmullo de las conversaciones.',
      default: 'Ante ti se extiende un paisaje que cuenta historias de tiempos pasados. El viento trae consigo el aroma de la aventura y lo desconocido. Cada paso que das podría cambiar el destino de este mundo.',
    };

    const scene = context.scene || '';
    if (scene.toLowerCase().includes('bosque') || scene.toLowerCase().includes('forest')) return scenes.forest;
    if (scene.toLowerCase().includes('pueblo') || scene.toLowerCase().includes('village') || scene.toLowerCase().includes('aldea')) return scenes.village;
    if (scene.toLowerCase().includes('mazmorra') || scene.toLowerCase().includes('dungeon') || scene.toLowerCase().includes('ruina')) return scenes.dungeon;
    if (scene.toLowerCase().includes('taberna') || scene.toLowerCase().includes('tavern')) return scenes.tavern;
    return scenes.default;
  }

  fallbackDialogue(npc, playerMessage) {
    const greetings = [
      '"Saludos, viajero. ¿En qué puedo ayudarte?"',
      '"Ah, un rostro nuevo. Bienvenido seas."',
      '"¿Necesitas algo? No tengo todo el día."',
    ];
    const responses = [
      '"Interesante lo que dices. Cuéntame más."',
      '"Hmm, no estoy seguro de entenderte bien."',
      '"Ciertamente, hay cosas más importantes de las que hablar."',
      '"Los tiempos son difíciles, pero siempre hay esperanza."',
    ];

    const response = playerMessage.length < 20 ? greetings[Math.floor(Math.random() * greetings.length)] : responses[Math.floor(Math.random() * responses.length)];
    return { npc: { name: npc.name, profession: npc.profession || 'aldeano' }, response: response };
  }

  fallbackQuest(context) {
    const quests = [
      { title: 'Recuperar el Talisman Perdido', description: 'Un objeto de gran poder ha sido robado del templo local. Debes encontrarlo antes de que caiga en las manos equivocadas.', objectives: [{ description: 'Investigar el templo', type: 'investigate' }, { description: 'Encontrar al ladrón', type: 'talk' }, { description: 'Recuperar el talismán', type: 'fetch' }], rewards: { gold: 200, xp: 500, items: ['Poción de Curación'] } },
      { title: 'Limpieza de la Cripta', description: 'Una cripta ancestral ha sido invadida por criaturas no muertas. Los aldeanos temen por su seguridad.', objectives: [{ description: 'Entrar a la cripta', type: 'explore' }, { description: 'Eliminar a los no muertos', type: 'kill' }, { description: 'Sellar la cripta', type: 'custom' }], rewards: { gold: 350, xp: 800, items: ['Espada Bendita'] } },
      { title: 'El Mensajero Perdido', description: 'Un mensajero real nunca llegó a su destino. Debes seguir su ruta y descubrir qué ocurrió.', objectives: [{ description: 'Seguir la ruta del mensajero', type: 'explore' }, { description: 'Encontrar al mensajero', type: 'investigate' }, { description: 'Entregar el mensaje', type: 'fetch' }], rewards: { gold: 150, xp: 300, items: ['Mapa Detallado'] } },
    ];
    return quests[Math.floor(Math.random() * quests.length)];
  }
}

module.exports = AIDirector;
