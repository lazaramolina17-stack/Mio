const db = require('../../db/connection');
const AIDirector = require('./AIDirector'); // Assuming AIDirector is in place

class CityEngine {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async generateBuildings(settlement) {
    // Basic building generation based on settlement type and wealth
    // In a real scenario, this might use AI or more complex rules
    const buildings = [];
    const cityType = settlement.type || 'village';
    const wealth = settlement.wealth_level || 'moderate';
    
    // Common buildings
    buildings.push({ name: 'Marketplace', type: 'market', settlement_id: settlement.id, metadata: { tier: wealth === 'wealthy' ? 2 : 1 } });
    buildings.push({ name: 'Tavern', type: 'tavern', settlement_id: settlement.id, metadata: { tier: 1 } });

    if (cityType === 'city' || cityType === 'town') {
      buildings.push({ name: 'Guardhouse', type: 'guardhouse', settlement_id: settlement.id, metadata: { tier: wealth === 'wealthy' ? 2 : 1 } });
      buildings.push({ name: 'Temple', type: 'temple', settlement_id: settlement.id, metadata: { tier: 1 } });
      if (wealth === 'wealthy') {
        buildings.push({ name: 'Guild Hall', type: 'guild', settlement_id: settlement.id, metadata: { tier: 2 } });
      }
    } else if (cityType === 'fortress') {
      buildings.push({ name: 'Barracks', type: 'barracks', settlement_id: settlement.id, metadata: { tier: 1 } });
      buildings.push({ name: 'Watchtower', type: 'watchtower', settlement_id: settlement.id, metadata: { tier: 1 } });
    } else if (cityType === 'village') {
      buildings.push({ name: 'Farm', type: 'farm', settlement_id: settlement.id, metadata: { tier: 1 } });
    }

    const insertedBuildings = [];
    for (const b of buildings) {
      try {
        const result = await db.query(
          `INSERT INTO buildings (settlement_id, name, type, metadata) VALUES ($1, $2, $3, $4) RETURNING *`,
          [b.settlement_id, b.name, b.type, JSON.stringify(b.metadata)]
        );
        insertedBuildings.push(result.rows[0]);
      } catch (e) {
        console.error("Failed to insert building:", b, e.message);
      }
    }
    return insertedBuildings;
  }

  async updateSettlementEconomy(settlement) {
    // Placeholder: basic update based on wealth level
    const production = settlement.wealth_level === 'wealthy' ? 100 : settlement.wealth_level === 'moderate' ? 50 : 20;
    const consumption = settlement.population * 0.5; // Rough consumption estimate
    const net = production - consumption;

    let newWealth = settlement.wealth_level;
    if (net > 50 && settlement.wealth_level !== 'rich') newWealth = 'rich';
    else if (net < -20 && settlement.wealth_level !== 'poor') newWealth = 'poor';
    else if (net < -40) newWealth = 'poor';

    await db.query('UPDATE settlements SET wealth_level = $1 WHERE id = $2', [newWealth, settlement.id]);
    console.log(`Updated settlement ${settlement.name} economy: wealth ${settlement.wealth_level} -> ${newWealth}`);
  }

  async build(settlementId, buildingData) {
    // Placeholder for actual resource checks, costs, etc.
    const result = await db.query(
      'INSERT INTO buildings (settlement_id, name, type, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [settlementId, buildingData.name, buildingData.type, JSON.stringify(buildingData.metadata || {})]
    );
    return result.rows[0];
  }

  // Placeholder for AI integration - more complex generation logic
  async generateSettlementDescription(settlement) {
      // UseAIDirector to generate description based on settlement data
      const AIDirector = require('./AIDirector'); // Lazy load
      const director = new AIDirector(settlement.world_id);
      const context = { scene: settlement.name + ' (' + settlement.type + ')', world_state: '...', /* more detailed context */ };
      return await director.generateNarration(context) || `A ${settlement.type} named ${settlement.name} in the world ${settlement.world_id}.`;
  }
  
  async generateQuestHook(settlement) {
      const AIDirector = require('./AIDirector');
      const director = new AIDirector(settlement.world_id);
      const context = { settlementId: settlement.id, settlementName: settlement.name, difficulty: settlement.wealth_level };
      // Request a quest hook relevant to the settlement's status
      return await director.generateQuest(context) || { title: `Rumor in ${settlement.name}`, description: 'Something strange is happening.' };
  }
  
  // Placeholder for IA generation of a new settlement
  async generateSettlement_IA(userId) {
      console.log("Generating new settlement IA (placeholder)");
      return {
          name: "New Settlement", type: "village", region_id: "a0000000-0000-0000-0000-000000000010", // Default region
          population: 100, wealth_level: "moderate", security_level: "moderate",
          metadata: { x: 500, y: 400, location_lat: 42.5, location_lng: -8.3, description: "A newly founded settlement." }
      };
  }
}

module.exports = CityEngine;
