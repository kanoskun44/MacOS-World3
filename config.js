// Configuración de APIs - Coloca tus claves aquí
module.exports = {
  // OpenAI GPT (https://platform.openai.com/api-keys)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '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'
  },
  
  // Google Speech-to-Text (opcional, como alternativa)
  googleSpeech: {
    apiKey: process.env.GOOGLE_SPEECH_API_KEY || 'tu-google-api-key'
  },
  
  // Configuración de la aplicación
  app: {
    name: "Siri Windows",
    version: "1.0.0"
  }
};

