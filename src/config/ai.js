const config = {
  apiKey: process.env.AI_API_KEY || '',
  endpoint: process.env.AI_ENDPOINT || 'https://api.freegpt.me/v1/chat/completions',
  model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.8,
};

module.exports = config;
