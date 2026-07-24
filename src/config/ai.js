const config = {
  apiKey: process.env.AI_API_KEY || '',
  endpoint: process.env.AI_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
  model: process.env.AI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.8,
  headers: {
    'HTTP-Referer': 'https://github.com/lazaramolina17-stack/Mio',
    'X-Title': 'RPG Platform',
  },
};

module.exports = config;
