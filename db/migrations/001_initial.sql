-- ============================================
-- RPG Platform — Migration 001: Initial Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM types
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'dm', 'player', 'spectator');
CREATE TYPE world_status AS ENUM ('active', 'frozen', 'archived');
CREATE TYPE member_role AS ENUM ('dm', 'player', 'spectator');
CREATE TYPE region_type AS ENUM ('continent', 'sea', 'ocean', 'desert', 'forest', 'jungle', 'mountain', 'hill', 'swamp', 'tundra', 'grassland', 'coast', 'lake', 'river', 'valley', 'plain', 'cave', 'volcano');
CREATE TYPE settlement_type AS ENUM ('city', 'town', 'village', 'hamlet', 'fortress', 'castle', 'ruin', 'shrine', 'outpost');
CREATE TYPE wealth_level AS ENUM ('poor', 'moderate', 'wealthy', 'rich');
CREATE TYPE security_level AS ENUM ('none', 'low', 'moderate', 'high', 'maximum');
CREATE TYPE settlement_status AS ENUM ('active', 'ruined', 'abandoned', 'destroyed');
CREATE TYPE building_type AS ENUM ('shop', 'temple', 'tavern', 'house', 'blacksmith', 'farm', 'stable', 'warehouse', 'library', 'guild_hall', 'barracks', 'palace', 'town_hall', 'market', 'mill', 'bakery', 'brewery', 'alchemist');
CREATE TYPE npc_status AS ENUM ('alive', 'dead', 'missing', 'imprisoned');
CREATE TYPE item_type AS ENUM ('weapon', 'armor', 'potion', 'scroll', 'tool', 'loot', 'quest', 'ring', 'amulet', 'food', 'drink', 'material', 'book', 'key');
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact');
CREATE TYPE faction_type AS ENUM ('guild', 'kingdom', 'religion', 'cult', 'political_party', 'tribe', 'family', 'mercenary_company');
CREATE TYPE history_event_type AS ENUM ('battle', 'discovery', 'death', 'founding', 'war', 'treaty', 'coronation', 'disaster', 'festival', 'trade', 'exploration', 'assassination', 'revolution');
CREATE TYPE quest_type AS ENUM ('main', 'side', 'faction', 'personal', 'generated', 'daily');
CREATE TYPE quest_status AS ENUM ('available', 'active', 'completed', 'failed', 'cancelled');
CREATE TYPE owner_type AS ENUM ('npc', 'settlement', 'building', 'player', 'shop');

-- ============================================
-- Users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(32) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'player',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);

-- ============================================
-- Sessions
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > created_at),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Worlds
-- ============================================
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status world_status DEFAULT 'active',
  tick_count BIGINT DEFAULT 0 CHECK (tick_count >= 0),
  last_tick_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- World Members
-- ============================================
CREATE TABLE world_members (
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (world_id, user_id)
);

-- ============================================
-- Regions
-- ============================================
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type region_type NOT NULL,
  climate VARCHAR(30),
  area FLOAT CHECK (area IS NULL OR area > 0),
  center_lat FLOAT CHECK (center_lat IS NULL OR (center_lat >= -90 AND center_lat <= 90)),
  center_lng FLOAT CHECK (center_lng IS NULL OR (center_lng >= -180 AND center_lng <= 180)),
  borders POLYGON,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Settlements
-- ============================================
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  type settlement_type NOT NULL,
  population INT DEFAULT 0 CHECK (population >= 0),
  wealth_level wealth_level DEFAULT 'moderate',
  security_level security_level DEFAULT 'moderate',
  location_lat FLOAT CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90)),
  location_lng FLOAT CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180)),
  status settlement_status DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Buildings
-- ============================================
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type building_type NOT NULL,
  owner_id UUID,
  inventory JSONB DEFAULT '[]',
  employees UUID[] DEFAULT '{}',
  hours JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NPCs
-- ============================================
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  age INT CHECK (age IS NULL OR (age >= 0 AND age <= 10000)),
  gender VARCHAR(20),
  race VARCHAR(50),
  profession VARCHAR(100),
  personality JSONB DEFAULT '{}',
  emotional_state JSONB DEFAULT '{}',
  goals JSONB DEFAULT '[]',
  fears JSONB DEFAULT '[]',
  inventory JSONB DEFAULT '[]',
  gold DECIMAL(12,2) DEFAULT 0 CHECK (gold >= 0),
  reputation INT DEFAULT 0 CHECK (reputation >= -100 AND reputation <= 100),
  daily_routine JSONB DEFAULT '[]',
  memory JSONB DEFAULT '[]',
  relationships JSONB DEFAULT '{}',
  status npc_status DEFAULT 'alive',
  cause_of_death TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Items
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type item_type NOT NULL,
  subtype VARCHAR(50),
  description TEXT,
  weight DECIMAL(8,2) DEFAULT 0 CHECK (weight >= 0),
  value DECIMAL(12,2) DEFAULT 0 CHECK (value >= 0),
  rarity item_rarity DEFAULT 'common',
  properties JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Inventories
-- ============================================
CREATE TABLE inventories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  owner_type owner_type NOT NULL,
  owner_id UUID NOT NULL,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  condition DECIMAL(5,2) DEFAULT 100.00 CHECK (condition >= 0 AND condition <= 100),
  equipped BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Factions
-- ============================================
CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type faction_type NOT NULL,
  leader_id UUID REFERENCES npcs(id) ON DELETE SET NULL,
  headquarters_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
  wealth DECIMAL(14,2) DEFAULT 0 CHECK (wealth >= 0),
  influence INT DEFAULT 50 CHECK (influence >= 0 AND influence <= 100),
  reputation INT DEFAULT 0 CHECK (reputation >= -100 AND reputation <= 100),
  relations JSONB DEFAULT '{}',
  laws JSONB DEFAULT '[]',
  doctrines JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- History Events
-- ============================================
CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  tick BIGINT NOT NULL CHECK (tick >= 0),
  event_type history_event_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  entities JSONB DEFAULT '{}',
  importance INT DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Quests
-- ============================================
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type quest_type NOT NULL,
  status quest_status DEFAULT 'available',
  giver_id UUID REFERENCES npcs(id) ON DELETE SET NULL,
  objectives JSONB DEFAULT '[]',
  rewards JSONB DEFAULT '{}',
  prerequisites JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Migrations tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

CREATE INDEX idx_worlds_owner ON worlds(owner_id);
CREATE INDEX idx_worlds_status ON worlds(status);

CREATE INDEX idx_world_members_user ON world_members(user_id);
CREATE INDEX idx_world_members_role ON world_members(role);

CREATE INDEX idx_regions_world ON regions(world_id);
CREATE INDEX idx_regions_type ON regions(type);

CREATE INDEX idx_settlements_world ON settlements(world_id);
CREATE INDEX idx_settlements_region ON settlements(region_id);
CREATE INDEX idx_settlements_type ON settlements(type);
CREATE INDEX idx_settlements_status ON settlements(status);

CREATE INDEX idx_buildings_settlement ON buildings(settlement_id);
CREATE INDEX idx_buildings_type ON buildings(type);
CREATE INDEX idx_buildings_owner ON buildings(owner_id);

CREATE INDEX idx_npcs_world ON npcs(world_id);
CREATE INDEX idx_npcs_settlement ON npcs(settlement_id);
CREATE INDEX idx_npcs_profession ON npcs(profession);
CREATE INDEX idx_npcs_status ON npcs(status);
CREATE INDEX idx_npcs_race ON npcs(race);

CREATE INDEX idx_items_world ON items(world_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);

CREATE INDEX idx_inventories_owner ON inventories(owner_type, owner_id);
CREATE INDEX idx_inventories_item ON inventories(item_id);

CREATE INDEX idx_factions_world ON factions(world_id);
CREATE INDEX idx_factions_type ON factions(type);

CREATE INDEX idx_history_world ON history_events(world_id);
CREATE INDEX idx_history_type ON history_events(event_type);
CREATE INDEX idx_history_tick ON history_events(world_id, tick);
CREATE INDEX idx_history_importance ON history_events(importance);

CREATE INDEX idx_quests_world ON quests(world_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_type ON quests(type);
CREATE INDEX idx_quests_giver ON quests(giver_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_worlds_updated_at BEFORE UPDATE ON worlds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_npcs_updated_at BEFORE UPDATE ON npcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_factions_updated_at BEFORE UPDATE ON factions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
