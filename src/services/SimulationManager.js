const db = require('../../db/connection');
const WorldSimulation = require('./WorldSimulation');
const Ecosystem = require('./Ecosystem');
const PoliticsEngine = require('./PoliticsEngine');
const ReligionEngine = require('../services/ReligionEngine'); // Adjusted path based on typical structure
const LegalSystem = require('./LegalSystem');
const MagicSystem = require('./MagicSystem');
const CityEngine = require('./CityEngine');
const HistoryEngine = require('./HistoryEngine');

const TASKS_PER_WORLD_TICK = 100; // Frequency for long-term simulations

class SimulationManager {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async runSingleWorldTick() {
    const world = await db.query('SELECT * FROM worlds WHERE id = $1 AND status = \'active\'', [this.worldId]);
    if (world.rows.length === 0) {
      console.log(`[SimulationManager] World ${this.worldId} is not active or not found.`);
      return;
    }
    const worldData = world.rows[0];
    const simulation = new WorldSimulation(this.worldId);
    const historyEngine = new HistoryEngine(this.worldId);
    let eventData = { world_id: this.worldId, tick: worldData.tick_count || 0 };

    try {
      // Execute main simulation steps
      const simResults = await simulation.tick(); // This orchestrates Ecosystem, Politics, Weather, Magic etc.

      // Record major events based on simulation results if any significant changes occurred (e.g., war, natural disaster)
      // This is a simplified example, actual event generation needs more logic
      if (simResults.steps?.['politics']?.status === 'war_declared') { 
        eventData = { ...eventData, type: 'war', title: 'War Declared', description: 'A new war has broken out!', importance: 8, entities: { factions: [...] }, location: { region_id: '...' } };
        await historyEngine.recordWorldEvent(eventData);
      }
      // More event recording logic based on simulation results...

      // Long-term simulations runner
      if ((worldData.tick_count || 0) % TASKS_PER_WORLD_TICK === 0) {
        await this.runLongTermSimulations(worldData);
      }
      
      console.log(`[SimulationManager] World ${worldData.name} tick ${worldData.tick_count} completed successfully.`);
    } catch (err) {
      console.error(`[SimulationManager] Error during tick for world ${worldData.name} (${this.worldId}):`, err);
      // Optionally record simulation error as an event
      await historyEngine.recordWorldEvent({ ...eventData, type: 'simulation_error', title: 'Simulation Error', description: err.message, importance: 5 });
    }
  }

  async runLongTermSimulations(worldData) {
    console.log(`[SimulationManager] Running long-term simulations for world ${worldData.name} (${this.worldId})...`);
    const politics = new PoliticsEngine(this.worldId);
    const religion = new ReligionEngine(this.worldId);
    const legal = new LegalSystem(this.worldId);
    const city = new CityEngine(this.worldId);
    const history = new HistoryEngine(this.worldId);

    try {
      // Faction evolution (influence, relations)
      await politics.processPoliticsTick(); // This might need to be split or adjusted
      await politics.processDiplomacy();

      // Religion impact
      await religion.processReligion();

      // Legal system application (if crimes occur or judgments are needed)
      // await legal.applyLaws(); // Needs implementation

      // City growth and maintenance
      const settlements = await db.query('SELECT * FROM settlements WHERE world_id = $1', [this.worldId]);
      for (const s of settlements.rows) {
        await city.updateSettlementEconomy(s);
        // Potential city growth logic here
      }

      // Historical trend analysis and lore generation
      await history.updateWorldLore();

      console.log(`[SimulationManager] Long-term simulations completed for world ${worldData.name}.`);
    } catch (err) {
      console.error(`[SimulationManager] Error during long-term simulations for world ${worldData.name}:`, err);
    }
  }
}

module.exports = SimulationManager;
