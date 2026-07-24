-- ============================================
-- RPG Platform — Seed: Demo World "Vallebruma"
-- ============================================

-- 1. Demo World
INSERT INTO worlds (id, name, slug, status, tick_count, settings, metadata)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Vallebruma',
  'vallebruma',
  'active',
  0,
  '{
    "time_scale": 60,
    "base_currency": "gold",
    "starting_season": "spring",
    "starting_year": 1247,
    "starting_month": 3,
    "starting_day": 15
  }',
  '{
    "description": "Un valle envuelto en niebla perpetua, donde los antiguos secretos yacen entre ruinas olvidadas. Tres grandes regiones conforman este territorio: el fértil Valle de Vallebruma, el misterioso Bosque de los Susurros, y las imponentes Montañas del Crepúsculo.",
    "tags": ["fantasy", "medieval", "low-magic", "mystery"],
    "era": "Edad del Crepúsculo",
    "gods": ["Aureon", "Sombría", "Valthor"]
  }'
);

-- 2. Regions
INSERT INTO regions (id, world_id, name, type, climate, area, center_lat, center_lng, metadata)
VALUES
(
  'a0000000-0000-0000-0000-000000000010',
  'a0000000-0000-0000-0000-000000000001',
  'Valle de Vallebruma',
  'valley',
  'templado',
  2450.5,
  42.5,
  -8.3,
  '{
    "description": "El corazón del mundo. Tierras fértiles bañadas por el río Bruma, con colinas suaves y extensos campos de cultivo. La niebla matinal es una constante que da nombre al valle.",
    "resources": ["madera", "trigo", "piedra", "agua_dulce"],
    "danger_level": "low"
  }'
),
(
  'a0000000-0000-0000-0000-000000000011',
  'a0000000-0000-0000-0000-000000000001',
  'Bosque de los Susurros',
  'forest',
  'húmedo',
  3800.0,
  43.1,
  -9.0,
  '{
    "description": "Un denso bosque donde los árboles susurran secretos antiguos. La luz del sol apenas penetra el espeso dosel. Criaturas feéricas y bestias sombrías habitan sus profundidades.",
    "resources": ["madera_preciosa", "hierbas_medicinales", "pieles", "cristales_de_luna"],
    "danger_level": "high"
  }'
),
(
  'a0000000-0000-0000-0000-000000000012',
  'a0000000-0000-0000-0000-000000000001',
  'Montañas del Crepúsculo',
  'mountain',
  'alpino',
  5200.0,
  43.8,
  -7.5,
  '{
    "description": "Picos imponentes que rasgan el cielo, cubiertos de nieve perpetua en sus cumbres. Antiguas minas enanas y templos olvidados se esconden en sus entrañas. Los crepúsculos son legendarios por su belleza.",
    "resources": ["hierro", "plata", "oro", "gemas", "piedra_obsidiana"],
    "danger_level": "extreme"
  }'
);

-- 3. Settlements
INSERT INTO settlements (id, world_id, region_id, name, type, population, wealth_level, security_level, location_lat, location_lng, status, metadata)
VALUES
(
  'a0000000-0000-0000-0000-000000000020',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000010',
  'Aldea de Vallebruma',
  'village',
  340,
  'moderate',
  'moderate',
  42.48,
  -8.31,
  'active',
  '{
    "description": "La aldea principal del valle, un refugio acogedor con casas de piedra y tejados de paja. La posada El Ciervo Dorado es el corazón social del pueblo.",
    "founded": "año 982",
    "notable_features": ["Posada El Ciervo Dorado", "Templo de Aureon", "Mercado del Alba"]
  }'
),
(
  'a0000000-0000-0000-0000-000000000021',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000012',
  'Fuerte Rocaoscura',
  'fortress',
  120,
  'poor',
  'high',
  43.75,
  -7.42,
  'active',
  '{
    "description": "Fortaleza militar construida en la ladera de la montaña, protegiendo el paso hacia el valle. Sus muros de obsidiana son famosos por su resistencia.",
    "founded": "año 1034",
    "notable_features": ["Muralla de Obsidiana", "Cuarteles", "Torre de Vigía"],
    "garrison": 45
  }'
),
(
  'a0000000-0000-0000-0000-000000000022',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000010',
  'Villa del Molino',
  'hamlet',
  85,
  'moderate',
  'low',
  42.55,
  -8.15,
  'active',
  '{
    "description": "Un pequeño asentamiento rural junto al río Bruma, conocido por sus molinos de agua y su fértil tierra de cultivo.",
    "founded": "año 1056",
    "notable_features": ["Molino del Río", "Campos de Trigo", "Puente de Piedra"]
  }'
),
(
  'a0000000-0000-0000-0000-000000000023',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000011',
  'Ruinas de Thalendor',
  'ruin',
  0,
  'poor',
  'none',
  43.05,
  -8.95,
  'ruined',
  '{
    "description": "Los restos de una antigua ciudad élfica, ahora cubierta de musgo y enredaderas. Se dice que un gran tesoro yace bajo sus ruinas, junto con un mal que nunca debería ser despertado.",
    "founded": "desconocido",
    "fell": "año 892",
    "notable_features": ["Templo Lunar", "Biblioteca en Ruinas", "Criptas Olvidadas"]
  }'
);

-- 4. NPCs
INSERT INTO npcs (id, world_id, settlement_id, name, age, gender, race, profession, personality, emotional_state, goals, fears, gold, reputation, daily_routine, memory, relationships, status)
VALUES
(
  'a0000000-0000-0000-0000-000000000100',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Elara Morningsong',
  42,
  'female',
  'Humana',
  'Posadera',
  '{"traits": ["amable", "observadora", "charlatana"], "alignment": "neutral_good", "quirks": ["siempre limpia el mismo vaso", "tararea mientras trabaja"]}',
  '{"mood": "content", "stress": 20, "happiness": 75}',
  '[{"priority": 1, "description": "Expandir la posada"}, {"priority": 2, "description": "Encontrar un buen cocinero"}]',
  '["que los bandidos lleguen al pueblo", "que el pozo se seque"]',
  450.00,
  65,
  '[
    {"hour": 6, "activity": "wake_up", "location": "home", "duration": 30},
    {"hour": 7, "activity": "prepare_breakfast", "location": "inn", "duration": 60},
    {"hour": 8, "activity": "serve_guests", "location": "inn", "duration": 240},
    {"hour": 12, "activity": "lunch", "location": "inn", "duration": 60},
    {"hour": 13, "activity": "afternoon_rest", "location": "home", "duration": 60},
    {"hour": 14, "activity": "clean_and_organize", "location": "inn", "duration": 120},
    {"hour": 16, "activity": "serve_guests", "location": "inn", "duration": 300},
    {"hour": 21, "activity": "dinner", "location": "home", "duration": 60},
    {"hour": 22, "activity": "sleep", "location": "home", "duration": 480}
  ]',
  '[
    {"date": "año 1240", "event": "heredó la posada de su padre", "emotion": "nostalgia"},
    {"date": "año 1245", "event": "sobrevivió al ataque de bandidos", "emotion": "miedo_superado"}
  ]',
  '{"alvric": {"relationship": "amistad", "trust": 80}, "marcus": {"relationship": "clientela", "trust": 60}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000101',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Alvric Martillo de Hierro',
  156,
  'male',
  'Enano',
  'Herrero',
  '{"traits": ["gruñón", "leal", "perfeccionista", "orgulloso"], "alignment": "lawful_neutral", "quirks": ["habla solo cuando trabaja", "odia a los duendes"]}',
  '{"mood": "focused", "stress": 45, "happiness": 60}',
  '[{"priority": 1, "description": "Forjar una espada legendaria"}, {"priority": 2, "description": "Enseñar el oficio a un aprendiz"}]',
  '["que su fragua se apague", "los elfos oscuros"]',
  1200.00,
  80,
  '[
    {"hour": 5, "activity": "wake_up", "location": "home", "duration": 30},
    {"hour": 6, "activity": "forge_prep", "location": "smithy", "duration": 60},
    {"hour": 7, "activity": "smithing", "location": "smithy", "duration": 300},
    {"hour": 12, "activity": "lunch", "location": "inn", "duration": 60},
    {"hour": 13, "activity": "smithing", "location": "smithy", "duration": 300},
    {"hour": 18, "activity": "dinner", "location": "home", "duration": 60},
    {"hour": 19, "activity": "tavern", "location": "inn", "duration": 120},
    {"hour": 21, "activity": "sleep", "location": "home", "duration": 480}
  ]',
  '[
    {"date": "año 1203", "event": "llegó a Vallebruma huyendo de una guerra enana", "emotion": "tristeza"},
    {"date": "año 1230", "event": "forjó la espada Rompenieblas para el antiguo alcalde", "emotion": "orgullo"}
  ]',
  '{"elara": {"relationship": "amistad", "trust": 90}, "theodor": {"relationship": "competencia", "trust": 30}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000102',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000021',
  'Comandante Lysandra Valtor',
  34,
  'female',
  'Humana',
  'Comandante de la Guardia',
  '{"traits": ["disciplinada", "estricta", "valiente", "protectora"], "alignment": "lawful_good", "quirks": ["siempre tiene el uniforme impecable", "no sonríe en público"]}',
  '{"mood": "vigilant", "stress": 70, "happiness": 45}',
  '[{"priority": 1, "description": "Reforzar las defensas del fuerte"}, {"priority": 2, "description": "Descubrir quién robó los suministros"}]',
  '["que el fuerte caiga", "fallar en su deber"]',
  300.00,
  90,
  '[
    {"hour": 5, "activity": "wake_up", "location": "barracks", "duration": 30},
    {"hour": 6, "activity": "patrol_check", "location": "fortress", "duration": 60},
    {"hour": 7, "activity": "training", "location": "fortress", "duration": 120},
    {"hour": 9, "activity": "administrative_duties", "location": "office", "duration": 180},
    {"hour": 12, "activity": "lunch", "location": "mess_hall", "duration": 30},
    {"hour": 13, "activity": "patrol_inspection", "location": "fortress", "duration": 120},
    {"hour": 15, "activity": "strategy_planning", "location": "office", "duration": 120},
    {"hour": 17, "activity": "evening_training", "location": "fortress", "duration": 60},
    {"hour": 18, "activity": "dinner", "location": "mess_hall", "duration": 30},
    {"hour": 19, "activity": "night_patrol", "location": "fortress_walls", "duration": 60},
    {"hour": 20, "activity": "sleep", "location": "barracks", "duration": 480}
  ]',
  '[
    {"date": "año 1240", "event": "nombrada comandante del fuerte tras la muerte de su predecesor", "emotion": "determinación"},
    {"date": "año 1246", "event": "repelió un ataque de orcos", "emotion": "orgullo"}
  ]',
  '{"durnik": {"relationship": "respeto_mutuo", "trust": 75}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000103',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Durnik Barbasombra',
  87,
  'male',
  'Semielfo',
  'Guardabosques / Erudito',
  '{"traits": ["sabio", "reservado", "curioso", "solitario"], "alignment": "neutral", "quirks": ["habla con los animales", "colecciona hojas secas"]}',
  '{"mood": "contemplative", "stress": 25, "happiness": 80}',
  '[{"priority": 1, "description": "Descubrir el origen de los susurros del bosque"}, {"priority": 2, "description": "Proteger el bosque de taladores ilegales"}]',
  '["que el bosque sea destruido", "los no-muertos"]',
  180.00,
  70,
  '[
    {"hour": 6, "activity": "wake_up", "location": "cabin", "duration": 30},
    {"hour": 7, "activity": "morning_patrol", "location": "forest", "duration": 180},
    {"hour": 10, "activity": "research", "location": "cabin", "duration": 120},
    {"hour": 12, "activity": "lunch", "location": "cabin", "duration": 30},
    {"hour": 13, "activity": "herb_gathering", "location": "forest", "duration": 180},
    {"hour": 16, "activity": "study_artifacts", "location": "cabin", "duration": 120},
    {"hour": 18, "activity": "dinner", "location": "cabin", "duration": 30},
    {"hour": 19, "activity": "evening_walk", "location": "forest", "duration": 60},
    {"hour": 20, "activity": "writing_journal", "location": "cabin", "duration": 120},
    {"hour": 22, "activity": "sleep", "location": "cabin", "duration": 480}
  ]',
  '[
    {"date": "año 1184", "event": "descubrió las ruinas de Thalendor", "emotion": "asombro"},
    {"date": "año 1220", "event": "sobrevivió al encuentro con una banshee", "emotion": "miedo"}
  ]',
  '{"lysandra": {"relationship": "respeto_mutuo", "trust": 75}, "thalassa": {"relationship": "maestro_alumno", "trust": 85}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000104',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Padre Theodor Mellis',
  58,
  'male',
  'Humano',
  'Sacerdote de Aureon',
  '{"traits": ["bondadoso", "paciente", "devoto", "ingenuo"], "alignment": "lawful_good", "quirks": ["bendice su comida antes de comer", "regala amuletos a los niños"]}',
  '{"mood": "peaceful", "stress": 15, "happiness": 85}',
  '[{"priority": 1, "description": "Terminar la restauración del templo"}, {"priority": 2, "description": "Convertir a los incrédulos"}]',
  '["que la oscuridad corrompa el valle", "perder la fe"]',
  80.00,
  75,
  '[
    {"hour": 6, "activity": "morning_prayer", "location": "temple", "duration": 60},
    {"hour": 7, "activity": "prepare_sermon", "location": "temple", "duration": 60},
    {"hour": 8, "activity": "morning_service", "location": "temple", "duration": 60},
    {"hour": 9, "activity": "community_work", "location": "village", "duration": 120},
    {"hour": 11, "activity": "counseling", "location": "temple", "duration": 60},
    {"hour": 12, "activity": "lunch", "location": "temple", "duration": 30},
    {"hour": 13, "activity": "study_scriptures", "location": "temple", "duration": 120},
    {"hour": 15, "activity": "visiting_sick", "location": "village", "duration": 120},
    {"hour": 17, "activity": "evening_service", "location": "temple", "duration": 60},
    {"hour": 18, "activity": "dinner", "location": "inn", "duration": 60},
    {"hour": 19, "activity": "evening_prayer", "location": "temple", "duration": 60},
    {"hour": 20, "activity": "sleep", "location": "temple", "duration": 480}
  ]',
  '[
    {"date": "año 1210", "event": "llegó a Vallebruma como misionero", "emotion": "esperanza"},
    {"date": "año 1244", "event": "detuvo una plaga con hierbas y oraciones", "emotion": "gratitud"}
  ]',
  '{"elara": {"relationship": "amistad", "trust": 85}, "alvric": {"relationship": "respeto", "trust": 60}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000105',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000022',
  'Milo Triguero',
  29,
  'male',
  'Humano',
  'Granjero / Molinero',
  '{"traits": ["trabajador", "tímido", "honesto", "soñador"], "alignment": "neutral_good", "quirks": ["silba mientras trabaja", "nombra a sus vacas con nombres de diosas"]}',
  '{"mood": "hopeful", "stress": 35, "happiness": 65}',
  '[{"priority": 1, "description": "Comprar un nuevo molino"}, {"priority": 2, "description": "Conquistar el corazón de la hija del panadero"}]',
  '["que una sequía arruine la cosecha", "las tormentas"]',
  220.00,
  55,
  '[
    {"hour": 5, "activity": "wake_up", "location": "home", "duration": 30},
    {"hour": 6, "activity": "feed_animals", "location": "farm", "duration": 60},
    {"hour": 7, "activity": "field_work", "location": "farm", "duration": 240},
    {"hour": 11, "activity": "mill_work", "location": "mill", "duration": 120},
    {"hour": 13, "activity": "lunch", "location": "home", "duration": 30},
    {"hour": 14, "activity": "field_work", "location": "farm", "duration": 180},
    {"hour": 17, "activity": "mill_maintenance", "location": "mill", "duration": 60},
    {"hour": 18, "activity": "dinner", "location": "home", "duration": 60},
    {"hour": 19, "activity": "village_social", "location": "village_square", "duration": 120},
    {"hour": 21, "activity": "sleep", "location": "home", "duration": 480}
  ]',
  '[
    {"date": "año 1244", "event": "heredó la granja de su padre", "emotion": "orgullo_melancólico"},
    {"date": "año 1246", "event": "su molino fue destruido por una inundación", "emotion": "tristeza"}
  ]',
  '{"elara": {"relationship": "amistad", "trust": 70}, "thalassa": {"relationship": "enamorado", "trust": 50}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000106',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Thalassa Brisa Marina',
  23,
  'female',
  'Elfa',
  'Bibliotecaria / Curandera',
  '{"traits": ["inteligente", "misteriosa", "gentil", "perfeccionista"], "alignment": "chaotic_good", "quirks": ["lee mientras camina", "sonríe sin razón aparente"]}',
  '{"mood": "focused", "stress": 40, "happiness": 70}',
  '[{"priority": 1, "description": "Traducir los rollos élficos encontrados en Thalendor"}, {"priority": 2, "description": "Ayudar a Durnik con sus investigaciones"}]',
  '["que los conocimientos antiguos se pierdan", "las arañas"]',
  520.00,
  60,
  '[
    {"hour": 7, "activity": "wake_up", "location": "library", "duration": 30},
    {"hour": 8, "activity": "morning_meditation", "location": "garden", "duration": 30},
    {"hour": 9, "activity": "library_duties", "location": "library", "duration": 180},
    {"hour": 12, "activity": "lunch", "location": "inn", "duration": 60},
    {"hour": 13, "activity": "research", "location": "library", "duration": 240},
    {"hour": 17, "activity": "healing_hours", "location": "clinic", "duration": 120},
    {"hour": 19, "activity": "dinner", "location": "home", "duration": 60},
    {"hour": 20, "activity": "reading", "location": "home", "duration": 120},
    {"hour": 22, "activity": "sleep", "location": "home", "duration": 480}
  ]',
  '[
    {"date": "año 1242", "event": "llegó de una ciudad élfica lejana en busca de conocimiento", "emotion": "curiosidad"},
    {"date": "año 1245", "event": "curó a un niño de una enfermedad rara", "emotion": "alegría"}
  ]',
  '{"milo": {"relationship": "amistad", "trust": 50}, "durnik": {"relationship": "maestro_alumno", "trust": 85}}',
  'alive'
),
(
  'a0000000-0000-0000-0000-000000000107',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000020',
  'Grim Balkar',
  45,
  'male',
  'Medio-orco',
  'Mercader Ambulante',
  '{"traits": ["astuto", "carismático", "desconfiado", "ambicioso"], "alignment": "neutral", "quirks": ["regatea hasta por una manzana", "tiene un loro mascota llamado Oro"]}',
  '{"mood": "calculating", "stress": 55, "happiness": 50}',
  '[{"priority": 1, "description": "Establecer una ruta comercial con las Montañas del Crepúsculo"}, {"priority": 2, "description": "Encontrar un comprador para un artefacto élfico"}]',
  '["que los bandidos roben su mercancía", "los guardias"]',
  2300.00,
  35,
  '[
    {"hour": 7, "activity": "wake_up", "location": "inn", "duration": 30},
    {"hour": 8, "activity": "breakfast_and_planning", "location": "inn", "duration": 60},
    {"hour": 9, "activity": "trade_negotiations", "location": "market", "duration": 180},
    {"hour": 12, "activity": "lunch_with_contacts", "location": "inn", "duration": 60},
    {"hour": 13, "activity": "inventory_check", "location": "warehouse", "duration": 120},
    {"hour": 15, "activity": "travel_prep", "location": "stables", "duration": 60},
    {"hour": 16, "activity": "buying_goods", "location": "village", "duration": 120},
    {"hour": 18, "activity": "dinner", "location": "inn", "duration": 60},
    {"hour": 19, "activity": "card_games_and_gossip", "location": "inn", "duration": 180},
    {"hour": 22, "activity": "sleep", "location": "inn", "duration": 480}
  ]',
  '[
    {"date": "año 1238", "event": "fue estafado por un socio comercial", "emotion": "rabia"},
    {"date": "año 1245", "event": "descubrió una mina de plata abandonada", "emotion": "codicia"}
  ]',
  '{"elara": {"relationship": "negocios", "trust": 45}, "alvric": {"relationship": "desconfianza", "trust": 20}, "lysandra": {"relationship": "vigilada", "trust": 15}}',
  'alive'
);

-- 5. Items
INSERT INTO items (id, world_id, name, type, subtype, description, weight, value, rarity, properties, tags)
VALUES
(
  'a0000000-0000-0000-0000-000000000200',
  'a0000000-0000-0000-0000-000000000001',
  'Espada Rompenieblas',
  'weapon',
  'longsword',
  'Una espada de acero enano con runas brillantes. Forjada por Alvric Martillo de Hierro para el antiguo alcalde. Corta la niebla a su paso.',
  3.50,
  850.00,
  'rare',
  '{"damage": "1d8+1", "type": "slashing", "properties": ["versatile", "magic"], "requirements": {"strength": 13}, "bonus": {"attack": 1, "damage": 1}}',
  ARRAY['arma', 'mágica', 'enana', 'acero']
),
(
  'a0000000-0000-0000-0000-000000000201',
  'a0000000-0000-0000-0000-000000000001',
  'Amuleto de la Niebla',
  'amulet',
  'necklace',
  'Un amuleto de plata con una gema opalina que brilla suavemente. Protege al portador de la niebla mágica y permite ver a través de ella.',
  0.20,
  1200.00,
  'very_rare',
  '{"effects": ["see_through_fog", "protection_from_fog"], "charges": 5, "recharge": "dawn"}',
  ARRAY['amuleto', 'mágico', 'protección', 'élfico']
),
(
  'a0000000-0000-0000-0000-000000000202',
  'a0000000-0000-0000-0000-000000000001',
  'Poción de Luz Estelar',
  'potion',
  'healing',
  'Un líquido brillante que emana una luz tenue. Restaura la salud y cura enfermedades menores. Sabe a miel y menta.',
  0.50,
  150.00,
  'uncommon',
  '{"healing": "4d4+4", "cures": ["disease", "poison"], "light_duration": 3600}',
  ARRAY['poción', 'curación', 'luz']
),
(
  'a0000000-0000-0000-0000-000000000203',
  'a0000000-0000-0000-0000-000000000001',
  'Martillo de Forja de los Ancestros',
  'tool',
  'blacksmith_tool',
  'Un martillo de forja enano con sigilos ancestrales. Quien lo empuña siente la sabiduría de los antiguos herreros enanos.',
  5.00,
  2000.00,
  'legendary',
  '{"bonus": {"smithing": 5}, "abilities": ["repair_any_metal", "detect_metal_quality"], "weight_reduction": true}',
  ARRAY['herramienta', 'enano', 'legendario', 'forja', 'ancestral']
),
(
  'a0000000-0000-0000-0000-000000000204',
  'a0000000-0000-0000-0000-000000000001',
  'Mapa del Vallebruma (Antiguo)',
  'loot',
  'map',
  'Un pergamino amarillento con un mapa detallado del valle. Marca varias ubicaciones no descubiertas y caminos secretos.',
  0.10,
  300.00,
  'rare',
  '{"locations_revealed": 5, "secret_paths": 3, "age_years": 200}',
  ARRAY['mapa', 'antiguo', 'pergamino', 'tesoro']
),
(
  'a0000000-0000-0000-0000-000000000205',
  'a0000000-0000-0000-0000-000000000001',
  'Anillo del Susurro Lunar',
  'ring',
  'ring',
  'Un anillo de plata con una piedra lunar. Susurra secretos al portador bajo la luz de la luna llena.',
  0.05,
  NULL,
  'artifact',
  '{"effects": ["whisper_knowledge", "moonlight_power"], "curse": "addiction_to_knowledge", "attunement": "full_moon"}',
  ARRAY['anillo', 'élfico', 'arte_facto', 'luna']
),
(
  'a0000000-0000-0000-0000-000000000206',
  'a0000000-0000-0000-0000-000000000001',
  'Escudo de Rocaoscura',
  'armor',
  'shield',
  'Un escudo de obsidiana reforzado con hierro, emblema del Fuerte Rocaoscura. Resistente al fuego y a los golpes contundentes.',
  8.00,
  400.00,
  'rare',
  '{"armor_class": 2, "resistances": ["fire", "bludgeoning"], "properties": ["heavy"]}',
  ARRAY['escudo', 'obsidiana', 'militar', 'defensa']
),
(
  'a0000000-0000-0000-0000-000000000207',
  'a0000000-0000-0000-0000-000000000001',
  'Rollos de Thalendor',
  'scroll',
  'ancient_script',
  'Un conjunto de rollos élficos parcialmente quemados. Contienen conocimientos arcanos sobre la caída de la civilización élfica en estas tierras.',
  0.30,
  500.00,
  'very_rare',
  '{"spells": ["comprehend_languages", "identify", "legend_lore"], "language": "elfico_antiguo", "pages_remaining": 12}',
  ARRAY['rollo', 'élfico', 'conocimiento', 'antiguo']
),
(
  'a0000000-0000-0000-0000-000000000208',
  'a0000000-0000-0000-0000-000000000001',
  'Cerveza Enana "Piedra Líquida"',
  'food',
  'drink',
  'Una cerveza enana extremadamente fuerte y espesa. Los no enanos suelen caer después de dos jarras. Sabe a roca y miel.',
  2.00,
  15.00,
  'common',
  '{"healing": "1d4", "effects": ["drunkenness", "temporary_hp"], "duration_minutes": 60}',
  ARRAY['comida', 'bebida', 'enana', 'alcohol']
),
(
  'a0000000-0000-0000-0000-000000000209',
  'a0000000-0000-0000-0000-000000000001',
  'Cristal de Luna Crudo',
  'loot',
  'gem',
  'Un cristal que brilla con luz propia. Se encuentra en las profundidades del Bosque de los Susurros. Usado en rituales y para forjar armas mágicas.',
  0.80,
  250.00,
  'uncommon',
  '{"magical_property": "moonlight_infusion", "crafting_material": true}',
  ARRAY['gema', 'cristal', 'mágico', 'bosque', 'artesanal']
);

-- 6. Factions
INSERT INTO factions (id, world_id, name, type, leader_id, headquarters_id, wealth, influence, reputation, relations, laws, doctrines, metadata)
VALUES
(
  'a0000000-0000-0000-0000-000000000300',
  'a0000000-0000-0000-0000-000000000001',
  'La Corona del Norte',
  'kingdom',
  'a0000000-0000-0000-0000-000000000102',
  'a0000000-0000-0000-0000-000000000021',
  150000.00,
  75,
  80,
  '{
    "hijos_del_bosque": {"status": "peaceful", "trust": 40, "treaties": ["non_aggression"]},
    "ladrones_de_la_bruma": {"status": "war", "trust": -80}
  }',
  '[
    {"type": "criminal", "description": "Prohibido el robo y asesinato", "penalty": "exile"},
    {"type": "tax", "description": "Impuesto del 10% sobre comercio", "frequency": "monthly"},
    {"type": "military", "description": "Todo ciudadano debe servir 2 años en la milicia", "age_range": "18-35"}
  ]',
  '{
    "creed": "Por la paz y la prosperidad del valle",
    "values": ["honor", "justicia", "proteccion"],
    "symbol": "un sol naciente sobre una montaña"
  }',
  '{
    "history": "Fundada tras la Guerra del Valle Olvidado (año 1002)",
    "capital": "Vallebruma",
    "ruler_title": "Comandante Supremo",
    "population_under_rule": 4500
  }'
),
(
  'a0000000-0000-0000-0000-000000000301',
  'a0000000-0000-0000-0000-000000000001',
  'Los Hijos del Bosque',
  'cult',
  'a0000000-0000-0000-0000-000000000103',
  'a0000000-0000-0000-0000-000000000023',
  45000.00,
  45,
  50,
  '{
    "corona_del_norte": {"status": "peaceful", "trust": 40, "treaties": ["non_aggression"]},
    "ladrones_de_la_bruma": {"status": "hostile", "trust": -60}
  }',
  '[
    {"type": "environmental", "description": "No talar árboles vivos", "penalty": "curse"},
    {"type": "ritual", "description": "Ofrenda mensual a los espíritus del bosque", "frequency": "monthly"},
    {"type": "membership", "description": "Solo quienes demuestren respeto por la naturaleza pueden unirse"}
  ]',
  '{
    "creed": "El bosque es vida, el bosque es memoria",
    "values": ["naturaleza", "sabiduria", "equilibrio"],
    "symbol": "un árbol plateado con hojas de luna"
  }',
  '{
    "history": "Surgió de los antiguos druidas élficos hace siglos",
    "holy_sites": ["Ruinas de Thalendor", "Claro Lunar"],
    "rituals": ["La Danza de las Sombras", "El Despertar del Árbol"],
    "members": 120
  }'
);

-- 7. History Events
INSERT INTO history_events (id, world_id, tick, event_type, title, description, entities, importance, location)
VALUES
(
  'a0000000-0000-0000-0000-000000000400',
  'a0000000-0000-0000-0000-000000000001',
  0,
  'founding',
  'Fundación de Vallebruma',
  'Los primeros colonos llegaron al valle guiados por una luz en la niebla. Establecieron la aldea de Vallebruma junto al río Bruma, dando inicio a la era conocida como la Edad del Crepúsculo.',
  '{"npcs": [], "settlements": ["a0000000-0000-0000-0000-000000000020"], "factions": ["a0000000-0000-0000-0000-000000000300"]}',
  10,
  '{"region_id": "a0000000-0000-0000-0000-000000000010", "settlement_id": "a0000000-0000-0000-0000-000000000020"}'
),
(
  'a0000000-0000-0000-0000-000000000401',
  'a0000000-0000-0000-0000-000000000001',
  0,
  'discovery',
  'Redescubrimiento de Thalendor',
  'El guardabosques Durnik Barbasombra descubrió las ruinas de la antigua ciudad élfica de Thalendor en el corazón del Bosque de los Susurros. Halló rollos ancestrales que hablan de una gran catástrofe mágica.',
  '{"npcs": ["a0000000-0000-0000-0000-000000000103"], "settlements": ["a0000000-0000-0000-0000-000000000023"], "factions": ["a0000000-0000-0000-0000-000000000301"]}',
  8,
  '{"region_id": "a0000000-0000-0000-0000-000000000011", "settlement_id": "a0000000-0000-0000-0000-000000000023"}'
),
(
  'a0000000-0000-0000-0000-000000000402',
  'a0000000-0000-0000-0000-000000000001',
  0,
  'treaty',
  'Pacto de No Agresión entre facciones',
  'La Corona del Norte y Los Hijos del Bosque firmaron un pacto de no agresión tras meses de tensiones. El acuerdo establece los límites territoriales entre el valle y el bosque.',
  '{"npcs": ["a0000000-0000-0000-0000-000000000102", "a0000000-0000-0000-0000-000000000103"], "factions": ["a0000000-0000-0000-0000-000000000300", "a0000000-0000-0000-0000-000000000301"]}',
  7,
  '{"region_id": "a0000000-0000-0000-0000-000000000010"}'
);
