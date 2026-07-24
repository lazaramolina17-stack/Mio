export const game = {
  state: 'menu',
  scene: null,
  player: null,
  combat: null,
  narrator: [],
  gold: 0,
  inventory: [],
  xp: 0,
  turnIndex: 0,
  lastCheck: null,
  ttsEnabled: true,
  ttsMode: 'web',
  selectedVoice: '',
  visitedScenes: [],
  dungeonDepth: 0,
  scenePools: null,
  randomFlow: false
};