CREATE TABLE IF NOT EXISTS spells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INT NOT NULL,
  school VARCHAR(50), -- Evocation, Abjuration, Conjuration, etc.
  components TEXT[], -- V, S, M (Material)
  mana_cost INT DEFAULT 0,
  cooldown INT DEFAULT 0, -- in seconds
  effects JSONB DEFAULT '{}', -- { type: 'damage'|'heal'|'buff'|'debuff', magnitude: INT, target: 'self'|'ally'|'enemy'|'area', duration: INT }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_magic (
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spell_id UUID REFERENCES spells(id) ON DELETE CASCADE,
  prepared BOOLEAN DEFAULT FALSE,
  learned_at TIMESTAMPTZ DEFAULT NOW(),
  times_cast INT DEFAULT 0,
  PRIMARY KEY (player_id, spell_id)
);

CREATE INDEX IF NOT EXISTS idx_spells_world ON spells(world_id);
CREATE INDEX IF NOT EXISTS idx_player_magic_player ON player_magic(player_id);
