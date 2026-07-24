const AIDirector = require('./AIDirector');

class AIBuilder {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async generateSettlementDescription(settlement) {
    const director = new AIDirector(settlement.worldId); // Assuming worldId is passed or accessible
    const context = {
      scene: `${settlement.name} (${settlement.type})`,
      world_state: `...`, // Fetch more world context if needed
      player_actions: 'N/A',
      present_npcs: 'N/A',
      relevant_history: 'N/A',
      // Detailed settlement data
      settlementData: settlement
    };
    return await director.generateNarration(context) || `A ${settlement.type} named ${settlement.name}.`;
  }

  async generateQuestHook(settlement) {
    const director = new AIDirector(settlement.worldId);
    const context = {
      settlementId: settlement.id,
      settlementName: settlement.name,
      difficulty: settlement.wealth_level || 'moderate',
      settlementData: settlement
    };
    // Request a quest hook relevant to the settlement's status
    return await director.generateQuest(context) || { title: `Rumor in ${settlement.name}`, description: 'Something interesting might be happening.' };
  }
    
  async generateSettlement(worldId, regionId) {
    console.log(`[AIBuilder] Generating new settlement for world ${worldId} in region ${regionId}`);
    const director = new AIDirector(worldId);

    // Use AI to determine settlement name, type, population, etc.
    // This is a placeholder - a real implementation would involve complex prompts
    const name = "New Settlement";
    const type = "village";
    const population = Math.floor(Math.random() * 500) + 50;
    const wealth_level = ["poor", "moderate", "wealthy"][Math.floor(Math.random() * 3)];
    const security_level = ["none", "low", "moderate", "high"][Math.floor(Math.random() * 4)];
    
    // Placeholder coordinates
    const metadata = {
        x: 100 + Math.random() * 800,
        y: 100 + Math.random() * 600,
        location_lat: 42.5 + (Math.random() - 0.5) * 0.5,
        location_lng: -8.3 + (Math.random() - 0.5) * 0.5,
        description: "A village founded by pioneers..."
    };

    return { name, type, region_id: regionId, population, wealth_level, security_level, metadata };
  }
}

module.exports = AIBuilder;
