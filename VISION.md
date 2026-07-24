# RPG Platform Vision — Prompt para OpenCode

## Alcance y estrategia

Este documento describe la transformación del proyecto actual (D&D 5e Toolkit, single-page HTML/JS) en una plataforma de rol de nueva generación. Dada la magnitud (20+ sistemas interdependientes), **NO se implementa todo de golpe**. La estrategia es por fases, cada una desplegable y funcional.

**Orden de implementación:**

```
Fase 0 — Fundación (servidor, API, base de datos, auth)
Fase 1 — Mundo Persistente + Cronología
Fase 2 — NPC + Memoria + Rutinas
Fase 3 — Economía Viva
Fase 4 — Multijugador + Tiempo Real
Fase 5 — IA del Director de Juego
Fase 6 — Editor Visual
Fase 7 — Ecosistema + Clima
Fase 8 — Política + Religiones + Sistema Legal
Fase 9 — Física de Magia + Constructor de Sistemas
Fase 10 — Ciudades Inteligentes + Construcción
Fase 11 — Historia Automática + Simulación Permanente
Fase 12 — IA Generativa + Rendimiento + Escalabilidad
```

Cada fase debe:
- Ser funcional por sí sola
- No romper fases anteriores
- Ser desplegable en producción
- Tener tests

---

## Fase 0 — Fundación

### Backend (Node.js + Express)

```
proyecto/
├── server.js              # Entry point
├── config/
│   ├── default.js         # Config base
│   ├── production.js      # Config producción
│   └── development.js     # Config desarrollo
├── src/
│   ├── app.js             # Express app setup
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── world.js
│   │   ├── npc.js
│   │   ├── economy.js
│   │   ├── combat.js
│   │   └── admin.js
│   ├── models/
│   │   ├── World.js
│   │   ├── Region.js
│   │   ├── Settlement.js
│   │   ├── NPC.js
│   │   ├── Player.js
│   │   ├── Item.js
│   │   ├── Quest.js
│   │   └── Faction.js
│   ├── services/
│   │   ├── WorldSimulation.js
│   │   ├── NPCMemory.js
│   │   ├── EconomyEngine.js
│   │   ├── CombatEngine.js
│   │   ├── QuestGenerator.js
│   │   └── WeatherSystem.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── cache.js
│   │   └── errorHandler.js
│   ├── jobs/
│   │   ├── worldTick.js       # Simulación periódica
│   │   ├── economyTick.js
│   │   ├── npcRoutines.js
│   │   └── cleanup.js
│   └── utils/
│       ├── logger.js
│       ├── dice.js
│       ├── nameGenerator.js
│       └── validator.js
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── connection.js
├── public/               # Frontend compilado
├── tests/
├── docs/
└── package.json
```

### Base de datos

**Requerimientos:**
- PostgreSQL (relacional, JSONB para datos flexibles)
- Redis (caché, colas, sesiones, pub/sub en tiempo real)
- Scheduler (node-cron o Bull para ticks de simulación)

**Esquema inicial (mínimo viable):**

```sql
-- ============================================
-- Fase 0: Core schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'player', -- admin, dm, player, spectator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);

-- Sesiones
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mundos (cada mundo = una campaña/partida)
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, frozen, archived
  tick_count BIGINT DEFAULT 0,
  last_tick_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',  -- configuración global del mundo
  metadata JSONB DEFAULT '{}',  -- historia, descripción, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Miembros del mundo (DM + jugadores)
CREATE TABLE world_members (
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'player', -- dm, player, spectator
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (world_id, user_id)
);

-- Regiones geográficas (contenedores de alto nivel)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL, -- continent, sea, desert, forest, mountain, etc.
  climate VARCHAR(30),
  area FLOAT, -- km²
  center_lat FLOAT,
  center_lng FLOAT,
  borders POLYGON,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asentamientos (ciudades, pueblos, aldeas, fortalezas)
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL, -- city, town, village, Hamlet, fortress, ruin
  population INT DEFAULT 0,
  wealth_level VARCHAR(20) DEFAULT 'moderate', -- poor, moderate, wealthy, rich
  security_level VARCHAR(20) DEFAULT 'moderate',
  location_lat FLOAT,
  location_lng FLOAT,
  status VARCHAR(20) DEFAULT 'active', -- active, ruined, abandoned, destroyed
  metadata JSONB DEFAULT '{}',  -- buildings, economy, politics, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edificios individuales
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- shop, temple, tavern, house, blacksmith, farm, etc.
  owner_id UUID, -- NPC id
  inventory JSONB DEFAULT '[]',
  employees UUID[] DEFAULT '{}',
  hours JSONB DEFAULT '{}', -- horarios de apertura
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPCs
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  settlement_id UUID REFERENCES settlements(id),
  name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(20),
  race VARCHAR(50),
  profession VARCHAR(100),
  personality JSONB DEFAULT '{}',      -- rasgos de personalidad
  emotional_state JSONB DEFAULT '{}',   -- estado emocional actual
  goals JSONB DEFAULT '[]',             -- objetivos actuales
  fears JSONB DEFAULT '[]',             -- miedos
  inventory JSONB DEFAULT '[]',
  gold DECIMAL(12,2) DEFAULT 0,
  reputation INT DEFAULT 0,             -- reputación general
  daily_routine JSONB DEFAULT '[]',     -- rutina diaria (horarios)
  memory JSONB DEFAULT '[]',            -- recuerdos permanentes
  relationships JSONB DEFAULT '{}',     -- relaciones con otros NPCs y players
  status VARCHAR(20) DEFAULT 'alive',   -- alive, dead, missing, imprisoned
  cause_of_death TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- weapon, armor, potion, scroll, tool, loot, quest
  subtype VARCHAR(50),
  description TEXT,
  weight DECIMAL(8,2) DEFAULT 0,
  value DECIMAL(12,2) DEFAULT 0,       -- valor base
  rarity VARCHAR(20) DEFAULT 'common', -- common, uncommon, rare, very_rare, legendary, artifact
  properties JSONB DEFAULT '{}',        -- stats, efectos, requirements
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventarios (relación items ↔ contenedores)
CREATE TABLE inventories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  owner_type VARCHAR(20) NOT NULL, -- npc, settlement, building, player, shop
  owner_id UUID NOT NULL,
  quantity INT DEFAULT 1,
  condition DECIMAL(5,2) DEFAULT 100.00, -- estado del item (%)
  equipped BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',       -- personalización, encantamientos, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facciones
CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- guild, kingdom, religion, cult, political_party
  leader_id UUID REFERENCES npcs(id),
  headquarters_id UUID REFERENCES settlements(id),
  wealth DECIMAL(14,2) DEFAULT 0,
  influence INT DEFAULT 50,        -- 0-100
  reputation INT DEFAULT 0,        -- reputación global
  relations JSONB DEFAULT '{}',     -- relaciones con otras facciones
  laws JSONB DEFAULT '[]',          -- leyes internas
  doctrines JSONB DEFAULT '{}',     -- doctrinas/creencias
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos históricos
CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  tick BIGINT NOT NULL,             -- en qué tick ocurrió
  event_type VARCHAR(50) NOT NULL,  -- battle, discovery, death, founding, war, etc.
  title VARCHAR(200) NOT NULL,
  description TEXT,
  entities JSONB DEFAULT '{}',      -- { npcs: [...], settlements: [...], factions: [...] }
  importance INT DEFAULT 5,         -- 1-10
  location JSONB,                   -- { region_id, settlement_id, lat, lng }
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quests/Misiones
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL,         -- main, side, faction, personal, generated
  status VARCHAR(20) DEFAULT 'available', -- available, active, completed, failed
  giver_id UUID REFERENCES npcs(id),
  objectives JSONB DEFAULT '[]',     -- objetivos estructurados
  rewards JSONB DEFAULT '{}',        -- { gold, items, xp, reputation }
  prerequisites JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_world_members_user ON world_members(user_id);
CREATE INDEX idx_npcs_world ON npcs(world_id);
CREATE INDEX idx_npcs_settlement ON npcs(settlement_id);
CREATE INDEX idx_settlements_world ON settlements(world_id);
CREATE INDEX idx_items_world ON items(world_id);
CREATE INDEX idx_history_world ON history_events(world_id);
CREATE INDEX idx_quests_world ON quests(world_id);
CREATE INDEX idx_inventories_owner ON inventories(owner_type, owner_id);
CREATE INDEX idx_factions_world ON factions(world_id);
```

### API endpoints (Fase 0)

```
POST   /api/auth/register        — Registrar usuario
POST   /api/auth/login           — Iniciar sesión
POST   /api/auth/logout          — Cerrar sesión
GET    /api/auth/me              — Perfil actual

POST   /api/worlds               — Crear mundo
GET    /api/worlds               — Listar mundos del usuario
GET    /api/worlds/:id           — Detalle del mundo
PUT    /api/worlds/:id           — Actualizar mundo
DELETE /api/worlds/:id           — Archivar mundo
POST   /api/worlds/:id/join     — Unirse a un mundo
POST   /api/worlds/:id/tick     — Forzar tick manual

GET    /api/worlds/:id/regions   — Regiones del mundo
POST   /api/worlds/:id/regions   — Crear región

GET    /api/worlds/:id/settlements — Asentamientos
POST   /api/worlds/:id/settlements — Crear asentamiento

GET    /api/worlds/:id/npcs      — NPCs del mundo
POST   /api/worlds/:id/npcs      — Crear NPC
GET    /api/worlds/:id/npcs/:nid — Detalle NPC

GET    /api/worlds/:id/history   — Historia del mundo
GET    /api/worlds/:id/factions  — Facciones

GET    /api/worlds/:id/quests    — Misiones disponibles
POST   /api/worlds/:id/quests    — Generar misión (IA)
```

### Frontend (migración progresiva)

El HTML/JS actual se migrará a módulos manteniendo compatibilidad:

1. Extraer JS a módulos ES6 individuales
2. Migrar CSS a módulos con naming de componentes
3. Agregar sistema de plugins
4. Mantener dnd.html como entry point durante migración
5. Agregar sistema de notificaciones en tiempo real (WebSocket)

---

## Fase 1 — Mundo Persistente

### World Simulation Engine

```javascript
// src/services/WorldSimulation.js

class WorldSimulation {
  constructor(worldId) {
    this.worldId = worldId;
    this.tickInterval = 60000; // 1 minuto real = 1 tick
    this.isRunning = false;
  }

  /**
   * Ejecuta un tick de simulación del mundo.
   * Un tick representa ~1 hora en el mundo del juego.
   */
  async tick() {
    const tickStart = Date.now();
    
    // 1. Avanzar tiempo del mundo
    await this.advanceTime();
    
    // 2. Procesar NPCs (rutinas, trabajos, desplazamientos)
    await this.processNPCRoutines();
    
    // 3. Simular economía local
    await this.processEconomy();
    
    // 4. Procesar ecosistema (criaturas, monstruos)
    await this.processEcosystem();
    
    // 5. Procesar política y facciones
    await this.processPolitics();
    
    // 6. Procesar clima
    await this.processWeather();
    
    // 7. Generar eventos
    await this.generateEvents();
    
    // 8. Persistir estado
    await this.persistState();
    
    const elapsed = Date.now() - tickStart;
    await this.logTick(elapsed);
    
    // Emitir cambios a clientes conectados
    this.emitStateUpdate();
  }

  async advanceTime() {
    // Incrementar contador de ticks
    // Actualizar hora del día, día, mes, año
    // Disparar eventos programados
  }

  async processNPCRoutines() {
    // Para cada NPC con rutina activa:
    // 1. Obtener acción programada para este tick
    // 2. Ejecutar acción (trabajar, descansar, viajar, etc.)
    // 3. Actualizar posición, estado, inventario
    // 4. Registrar en memoria si es relevante
  }

  async processEconomy() {
    // 1. Producción de bienes según edificios/NPCs
    // 2. Consumo de recursos por NPCs y asentamientos
    // 3. Comercio entre asentamientos
    // 4. Ajuste de precios (oferta/demanda)
  }

  async processEcosystem() {
    // 1. Movimiento de criaturas
    // 2. Caza y alimentación
    // 3. Reproducción
    // 4. Migración estacional
  }

  async processPolitics() {
    // 1. Relaciones entre facciones
    // 2. Decisiones de gobernantes
    // 3. Propaganda y corrupción
    // 4. Rebeliones
  }
}
```

### Cronología

```javascript
// src/services/Chronology.js

class Chronology {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async recordEvent(event) {
    // event: { type, title, description, entities, importance, location }
    
    // 1. Persistir en history_events
    // 2. Actualizar cronología del mundo
    // 3. Propagar a NPCs relevantes (memoria)
    // 4. Notificar a jugadores conectados
    // 5. Si es muy importante, generar entrada en enciclopedia
  }

  async getTimeline(filters) {
    // filters: { from, to, types, entities, minImportance }
    // Devolver línea de tiempo paginada
  }

  async getEncyclopedia() {
    // Generar/actualizar enciclopedia del mundo
    // Entradas: guerras, muertes importantes, descubrimientos,
    //           objetos legendarios, árboles genealógicos
  }
}
```

---

## Fase 2 — NPC + Memoria

### NPCMemory System

```javascript
// src/services/NPCMemory.js

class NPCMemory {
  constructor(npcId) {
    this.npcId = npcId;
    this.shortTerm = [];  // Recuerdos recientes (se desvanecen)
    this.longTerm = [];   // Recuerdos permanentes
  }

  async remember(event) {
    // event: { type, entities, description, emotionalImpact, timestamp }
    
    // 1. Almacenar en memoria del NPC
    // 2. Si el impacto emocional es alto, consolidar en long-term
    // 3. Actualizar relaciones con entidades involucradas
    // 4. Actualizar reputación
    // 5. Evaluar si el recuerdo cambia objetivos/comportamiento
  }

  async recall(query) {
    // query: { entity, type, timeframe, keywords }
    // Buscar en memoria del NPC
    // Devolver recuerdos relevantes con puntuación
  }

  getRelationship(targetId) {
    // Calcular relación basada en:
    // - Interacciones pasadas
    // - Reputación
    // - Afinidad de personalidad
    // - Eventos compartidos
    // Devolver { affinity, trust, fear, respect }
  }

  async consolidateMemory() {
    // 1. Revisar short-term memory
    // 2. Reforzar recuerdos importantes
    // 3. Desvanecer recuerdos triviales después de tiempo
    // 4. Consolidar en long-term si es relevante
  }
}
```

### NPC Routine System

```javascript
// Ejemplo de rutina diaria de NPC

const npcRoutine = {
  npcId: 'uuid-...',
  schedule: [
    { hour: 6, activity: 'wake_up', location: 'home', duration: 30 },
    { hour: 7, activity: 'breakfast', location: 'home', duration: 30 },
    { hour: 8, activity: 'work', location: 'blacksmith', duration: 480 },
    { hour: 12, activity: 'lunch', location: 'tavern', duration: 60 },
    { hour: 13, activity: 'work', location: 'blacksmith', duration: 240 },
    { hour: 17, activity: 'socialize', location: 'tavern', duration: 120 },
    { hour: 19, activity: 'dinner', location: 'home', duration: 60 },
    { hour: 20, activity: 'leisure', location: 'home', duration: 120 },
    { hour: 22, activity: 'sleep', location: 'home', duration: 480 },
  ],
  // La rutina puede cambiar según:
  // - Día de la semana
  // - Estación
  // - Eventos especiales
  // - Estado emocional
  // - Objetivos actuales
  exceptions: [
    { condition: 'is_market_day', override: { hour: 10, activity: 'market', ... } },
    { condition: 'has_urgent_quest', override: { hour: 6, activity: 'travel', ... } },
    { condition: 'emotional_state.fear > 70', override: { activity: 'hide' } }
  ]
};
```

---

## Fase 3 — Economía Viva

### Economy Engine

```javascript
// src/services/EconomyEngine.js

class EconomyEngine {
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Calcula el precio de un item basado en el estado del mundo.
   */
  async calculatePrice(item, settlement) {
    const basePrice = item.value;
    
    // Factores de ajuste:
    const supply = await this.getSupply(item, settlement);
    const demand = await this.getDemand(item, settlement);
    const scarcity = await this.getScarcity(item, settlement);
    const inflation = await this.getInflation(settlement);
    const distance = await this.getTradeDistance(item, settlement);
    const season = await this.getSeasonalModifier(item);
    const politics = await this.getPoliticalModifier(item, settlement);
    
    // Fórmula: precio_base × (demanda/oferta) × escasez × inflación × distancia × estación × política
    const price = basePrice 
      * (demand / Math.max(supply, 1))
      * scarcity
      * inflation
      * distance
      * season
      * politics;
    
    return Math.round(price * 100) / 100;
  }

  async processTrade() {
    // 1. Caravanas entre asentamientos
    // 2. Comercio en mercados
    // 3. Mercado negro
    // 4. Importaciones/exportaciones
    // 5. Bancos y préstamos
  }

  async processTaxation() {
    // 1. Cobrar impuestos a NPCs y jugadores
    // 2. Transferir al tesoro del reino/facción
    // 3. Ajustar según leyes y corrupción
  }
}
```

---

## Fase 4 — Multijugador + Tiempo Real

### WebSocket Events

```javascript
// Eventos del servidor al cliente
socket.on('world:tick',        { tick, time, changes })
socket.on('npc:update',        { npcId, changes })
socket.on('economy:price',     { itemId, settlementId, price })
socket.on('combat:start',      { combatId, participants })
socket.on('combat:action',     { combatId, actor, action, result })
socket.on('quest:update',      { questId, status, progress })
socket.on('chat:message',      { userId, message, channel })
socket.on('world:event',       { event })
socket.on('map:update',        { region, changes })

// Eventos del cliente al servidor
socket.emit('player:action',   { type, data })
socket.emit('chat:send',       { message, channel })
socket.emit('combat:act',      { combatId, action })
socket.emit('npc:interact',    { npcId, interaction })
socket.emit('world:request',   { type, filters })
```

---

## Fase 5 — IA del Director de Juego

### Prompt del DM IA

```
Eres el Director de Juego de una partida de rol de fantasía medieval.
Tienes acceso completo al estado del mundo, los NPCs, los jugadores y su historia.

Debes:
1. Narrar escenas de forma inmersiva, adaptando tono y ritmo
2. Crear aventuras coherentes con el mundo y las acciones de los jugadores
3. Generar diálogos naturales para cada NPC (personalidad, memoria, estado emocional)
4. Adaptar dificultad según el rendimiento del grupo
5. Recordar el historial completo de la campaña
6. Crear NPCs, objetos, ciudades, acertijos y mazmorras sobre la marcha
7. Improvisar cuando los jugadores tomen direcciones inesperadas
8. Mantener coherencia: lo que ocurre tiene consecuencias permanentes

Contexto actual del mundo:
{world_state}

Últimas acciones de los jugadores:
{player_actions}

NPCs presentes:
{present_npcs}

Historial relevante:
{relevant_history}
```

---

## Notas de implementación

### Rendimiento y escalabilidad

- **Caché**: Redis para consultas frecuentes (precios, NPCs activos, estado de mundo)
- **Background jobs**: Bull/BullMQ para tareas pesadas (ticks de simulación, economía, ecosistema)
- **Sharding**: Por mundo (cada mundo se simula independientemente)
- **Read replicas**: Para consultas de historia y enciclopedia
- **CDN**: Para assets estáticos (mapas, retratos de NPC)
- **Rate limiting**: Por usuario y por endpoint
- **Compression**: gzip/brotli para respuestas API

### Seguridad

- **Auth**: JWT con refresh tokens
- **Roles**: admin, dm, player, spectator (validación en cada endpoint)
- **Input validation**: Joi/Zod para todos los endpoints
- **SQL injection**: Prepared statements (pg with parameterized queries)
- **XSS**: Sanitización de inputs, CSP headers
- **Rate limiting**: express-rate-limit
- **Helmet**: Headers de seguridad HTTP

### Testing

```
tests/
├── unit/
│   ├── services/
│   │   ├── WorldSimulation.test.js
│   │   ├── EconomyEngine.test.js
│   │   ├── NPCMemory.test.js
│   │   └── CombatEngine.test.js
│   └── utils/
│       ├── dice.test.js
│       └── nameGenerator.test.js
├── integration/
│   ├── api/
│   │   ├── auth.test.js
│   │   ├── worlds.test.js
│   │   └── npcs.test.js
│   └── db/
│       └── migrations.test.js
├── e2e/
│   └── gameplay.test.js
└── performance/
    └── simulation.test.js
```

### Despliegue

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: rpg_platform
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres/rpg_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  worker:
    build: .
    command: node src/jobs/worker.js
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres/rpg_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./public:/usr/share/nginx/html
    depends_on:
      - api

volumes:
  pgdata:
  redisdata:
```
