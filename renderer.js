const { ipcRenderer } = require('electron');

// Elementos DOM
const body = document.body;
const backgroundEffect = document.querySelector('.background-effect');
const textInput = document.getElementById('text-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const questionText = document.getElementById('question-text');
const responseText = document.getElementById('response-text');
const listeningIndicator = document.querySelector('.listening-indicator');
const btnMicrofono = document.getElementById('btn-microfono');

// Estado de la aplicación
let isListening = false;
let recognition = null;

// ================== INICIALIZACIÓN DEL RECONOCIMIENTO DE VOZ ==================
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true; // Permitir resultados intermedios
        recognition.lang = 'es-ES';
        
        recognition.onstart = function() {
            console.log('🎤 Reconocimiento de voz iniciado');
            isListening = true;
            updateListeningUI(true);
            questionText.textContent = "🎤 Escuchando... Habla ahora";
            responseText.textContent = "🔊 Te escucho...";
        };
        
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                } else {
                    transcript += event.results[i][0].transcript + '...';
                }
            }
            console.log('Texto reconocido:', transcript);
            questionText.textContent = transcript;
            
            // Solo procesar si es resultado final
            if (event.results[0].isFinal) {
                processQuestion(transcript);
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Error en reconocimiento de voz:', event.error);
            handleRecognitionError(event.error);
        };
        
        recognition.onend = function() {
            console.log('Reconocimiento de voz finalizado');
            stopListening();
        };
    } else {
        console.warn('El reconocimiento de voz no está soportado');
        enableFallbackVoiceRecognition();
    }
}

// ================== MANEJO DE ERRORES DE VOZ ==================
function handleRecognitionError(error) {
    stopListening();
    
    const errorMessages = {
        'not-allowed': '❌ Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.',
        'no-speech': '🔇 No se detectó voz. Intenta hablar más claro o más cerca del micrófono.',
        'audio-capture': '🎤 No se pudo acceder al micrófono. Verifica tu configuración de audio.',
        'network': '🌐 Error de red. Verifica tu conexión a internet.',
        'default': '⚠️ Error en el reconocimiento de voz. Usa el teclado como alternativa.'
    };
    
    responseText.textContent = errorMessages[error] || errorMessages.default;
}

function enableFallbackVoiceRecognition() {
    responseText.textContent = "💡 Usa el teclado para escribir o haz clic en el micrófono para simular voz";
}

// ================== INTERFAZ DE USUARIO ==================
function updateListeningUI(listening) {
    if (listening) {
        body.classList.add('listening');
        voiceButton.classList.add('voice-active');
        voiceButton.innerHTML = '🔴';
        voiceButton.title = 'Detener escucha';
        listeningIndicator.style.display = 'block';
    } else {
        body.classList.remove('listening');
        voiceButton.classList.remove('voice-active');
        voiceButton.innerHTML = '🎤';
        voiceButton.title = 'Iniciar escucha';
        listeningIndicator.style.display = 'none';
    }
}

// ================== CONTROL DE SIRI ==================
function showSiri() {
    body.classList.add('siri-active');
    ipcRenderer.send('show-siri');
    textInput.focus();
    responseText.textContent = "👋 ¡Hola! Pregúntame lo que quieras";
}

function hideSiri() {
    body.classList.remove('siri-active');
    updateListeningUI(false);
    ipcRenderer.send('hide-siri');
    if (recognition && isListening) {
        recognition.stop();
    }
    isListening = false;
}

// ================== RECONOCIMIENTO DE VOZ ==================
function startListening() {
    if (isListening) {
        stopListening();
        return;
    }
    
    if (recognition) {
        try {
            recognition.start();
            ipcRenderer.send('start-listening');
        } catch (error) {
            console.error("Error iniciando reconocimiento:", error);
            startFallbackListening();
        }
    } else {
        startFallbackListening();
    }
}

function startFallbackListening() {
    isListening = true;
    updateListeningUI(true);
    questionText.textContent = "🎤 Modo simulación - Habla ahora";
    responseText.textContent = "🔊 Escuchando en modo simulación...";
    
    // Ejemplos de preguntas comunes para simulación
    const sampleQuestions = [
        "Calcula la derivada de x al cuadrado",
        "Capital de Francia",
        "Área de un círculo con radio 5",
        "Resuelve la ecuación 2x + 5 = 15",
        "Derivada de seno de x",
        "Integral de x al cuadrado",
        "Límite cuando x tiende a 0 de seno x sobre x",
        "Capital de Japón",
        "Calcula 15 por 8 más 20",
        "Volumen de una esfera con radio 3",
        "Quién descubrió América",
        "Qué es la fotosíntesis"
    ];
    
    // Simular reconocimiento después de 2 segundos
    setTimeout(() => {
        const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
        questionText.textContent = randomQuestion;
        responseText.textContent = "🔄 Procesando tu pregunta...";
        processQuestion(randomQuestion);
        stopListening();
    }, 2000);
}

function stopListening() {
    isListening = false;
    updateListeningUI(false);
    if (recognition) {
        recognition.stop();
    }
    ipcRenderer.send('stop-listening');
}

// ================== PROCESAMIENTO INTELIGENTE DE PREGUNTAS ==================
async function processQuestion(question) {
    if (!question || !question.trim()) {
        responseText.textContent = "❌ Por favor, escribe o di algo";
        return;
    }
    
    const questionLower = question.toLowerCase().trim();
    
    // Mostrar estado de procesamiento
    responseText.textContent = "🔄 Analizando tu pregunta...";
    
    // Detectar tipo de pregunta para mejor feedback
    if (isMathematicalQuestion(questionLower)) {
        responseText.textContent = "🧮 Resolviendo problema matemático...";
    } else if (isGeographicalQuestion(questionLower)) {
        responseText.textContent = "🌍 Buscando información geográfica...";
    } else if (isScientificQuestion(questionLower)) {
        responseText.textContent = "🔬 Consultando base de conocimiento científica...";
    } else if (isEmotionalQuestion(questionLower)) {
        responseText.textContent = "💖 Analizando tu estado emocional...";
    }
    
    try {
        const respuesta = await ipcRenderer.invoke('process-question', question);
        displayResponse(respuesta, questionLower);
        speakResponse(respuesta);
    } catch (error) {
        console.error("Error procesando pregunta:", error);
        responseText.textContent = "❌ Error al procesar la solicitud. Intenta de nuevo.";
    }
}

// ================== DETECCIÓN DE TIPOS DE PREGUNTAS ==================
function isMathematicalQuestion(question) {
    const mathKeywords = [
        'calcula', 'cuánto es', 'derivada', 'integral', 'límite', 'ecuación',
        'área', 'volumen', 'perímetro', 'seno', 'coseno', 'tangente',
        'álgebra', 'geometría', 'trigonometría', 'cálculo', 'matemática', 'matemáticas',
        'suma', 'resta', 'multiplica', 'divide', 'porcentaje', 'raíz', 'potencia'
    ];
    return mathKeywords.some(keyword => question.includes(keyword));
}

function isGeographicalQuestion(question) {
    const geoKeywords = [
        'capital', 'país', 'ciudad', 'continente', 'océano', 'montaña',
        'río', 'desierto', 'bandera', 'ubicación', 'mapa', 'geografía'
    ];
    return geoKeywords.some(keyword => question.includes(keyword));
}

function isScientificQuestion(question) {
    const scienceKeywords = [
        'ciencia', 'científico', 'descubrimiento', 'invento', 'teoría',
        'física', 'química', 'biología', 'astronomía', 'átomo', 'molécula',
        'gravedad', 'energía', 'evolución', 'célula', 'adn', 'genética'
    ];
    return scienceKeywords.some(keyword => question.includes(keyword));
}

function isEmotionalQuestion(question) {
    const emotionalKeywords = [
        'siento', 'triste', 'feliz', 'enojado', 'preocupado', 'ansioso',
        'deprimido', 'estresado', 'solo', 'abrumado', 'cansado', 'motivación',
        'ánimo', 'ánimos', 'ayuda emocional', 'consejo'
    ];
    return emotionalKeywords.some(keyword => question.includes(keyword));
}

// ================== PRESENTACIÓN DE RESPUESTAS ==================
function displayResponse(respuesta, questionLower) {
    // Formatear respuestas según el tipo de pregunta
    if (isMathematicalQuestion(questionLower)) {
        responseText.innerHTML = `<div class="math-response">🧮 ${respuesta}</div>`;
    } else if (isGeographicalQuestion(questionLower)) {
        responseText.innerHTML = `<div class="geo-response">🌍 ${respuesta}</div>`;
    } else if (isScientificQuestion(questionLower)) {
        responseText.innerHTML = `<div class="science-response">🔬 ${respuesta}</div>`;
    } else if (isEmotionalQuestion(questionLower)) {
        responseText.innerHTML = `<div class="emotional-response">💖 ${respuesta}</div>`;
    } else if (questionLower.includes('música') || questionLower.includes('shazam')) {
        responseText.innerHTML = `<div class="music-response">🎵 ${respuesta}</div>`;
    } else {
        responseText.textContent = respuesta;
    }
    
    // Agregar sugerencias relacionadas
    addRelatedSuggestions(questionLower);
}

function addRelatedSuggestions(questionLower) {
    setTimeout(() => {
        const suggestions = generateRelatedSuggestions(questionLower);
        if (suggestions) {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestions';
            suggestionElement.innerHTML = `<br><small>💡 ${suggestions}</small>`;
            responseText.appendChild(suggestionElement);
        }
    }, 500);
}

function generateRelatedSuggestions(questionLower) {
    if (isMathematicalQuestion(questionLower)) {
        const mathSuggestions = [
            "¿Quieres que resuelva otra operación matemática?",
            "Puedo ayudarte con derivadas, integrales, ecuaciones y más",
            "Prueba: 'derivada de x^3' o 'área de un triángulo'"
        ];
        return mathSuggestions[Math.floor(Math.random() * mathSuggestions.length)];
    }
    
    if (isGeographicalQuestion(questionLower)) {
        const geoSuggestions = [
            "¿Te interesa conocer otra capital?",
            "Pregunta por cualquier capital del mundo",
            "También sé sobre ríos, montañas y países"
        ];
        return geoSuggestions[Math.floor(Math.random() * geoSuggestions.length)];
    }
    
    if (questionLower.includes('capital')) {
        return "Puedo contarte sobre la capital de cualquier país. ¡Pregúntame!";
    }
    
    return null;
}

// ================== SÍNTESIS DE VOZ MEJORADA ==================
function speakResponse(text) {
    if (!window.speechSynthesis) return;

    // Espera a que las voces estén cargadas
    function hablarConVoz() {
        const voces = window.speechSynthesis.getVoices();
        // Busca la voz "Microsoft Sabina Desktop - Spanish (Mexico)" o similar
        let vozFemenina = voces.find(v => v.name.toLowerCase().includes('sabina'));
        // Si no la encuentra, usa la primera voz femenina en español disponible
        if (!vozFemenina) {
            vozFemenina = voces.find(v => v.lang.startsWith('es') && v.gender === 'female');
        }
        // Si no encuentra ninguna, usa la primera voz en español disponible
        if (!vozFemenina) {
            vozFemenina = voces.find(v => v.lang.startsWith('es'));
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (vozFemenina) {
            utterance.voice = vozFemenina;
        }
        utterance.rate = 1;
        utterance.pitch = 1.1; // Un poco más aguda, estilo Siri

        window.speechSynthesis.speak(utterance);
    }

    // Si las voces aún no están cargadas, espera el evento
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = hablarConVoz;
    } else {
        hablarConVoz();
    }
}

// ================== EVENT LISTENERS ==================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideSiri();
    }
    
    if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        if (body.classList.contains('siri-active')) {
            hideSiri();
        } else {
            showSiri();
        }
    }
    
    if (e.key === 'Enter' && document.activeElement === textInput) {
        sendButton.click();
    }
});

sendButton.addEventListener('click', () => {
    if (textInput.value.trim()) {
        questionText.textContent = textInput.value;
        processQuestion(textInput.value);
        textInput.value = '';
        textInput.focus();
    } else {
        responseText.textContent = "❌ Por favor, escribe una pregunta";
    }
});

voiceButton.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

btnMicrofono.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

// ================== MANEJADORES DE EVENTOS IPC ==================
ipcRenderer.on('microphone-started', () => {
    updateListeningUI(true);
});

ipcRenderer.on('microphone-stopped', () => {
    updateListeningUI(false);
});

ipcRenderer.on('music-recognition-started', () => {
    responseText.textContent = "🎵 Analizando audio... Esto puede tomar unos segundos";
});

ipcRenderer.on('response-received', (event, response) => {
    responseText.textContent = response;
    body.classList.remove('music-recognition-active');
});

ipcRenderer.on('focus-input', () => {
    textInput.focus();
});

// ================== INICIALIZACIÓN Y ESTILOS ==================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Siri Windows - Renderer cargado');
    
    initializeSpeechRecognition();
    
    // Mensaje de bienvenida mejorado
    responseText.innerHTML = `
        <div class="welcome-message">
            <h3>👋 ¡Hola! Soy tu Siri para Windows</h3>
            <p>Puedo ayudarte con:</p>
            <ul>
                <li>🧮 <strong>Matemáticas:</strong> Derivadas, integrales, ecuaciones</li>
                <li>🌍 <strong>Geografía:</strong> Capitales, países, ciudades</li>
                <li>🔬 <strong>Ciencia:</strong> Más de 400 preguntas de cultura</li>
                <li>💖 <strong>Soporte emocional</strong> cuando lo necesites</li>
                <li>🎵 <strong>Reconocimiento de música</strong> estilo Shazam</li>
            </ul>
            <p>¡Pregúntame lo que quieras!</p>
        </div>
    `;
    
    // Agregar estilos dinámicos
    addDynamicStyles();
    
    setTimeout(() => {
        textInput.focus();
    }, 1000);
});

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .math-response {
            color: #4CAF50;
            font-weight: bold;
            background: rgba(76, 175, 80, 0.1);
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        
        .geo-response {
            color: #2196F3;
            font-weight: bold;
            background: rgba(33, 150, 243, 0.1);
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #2196F3;
        }
        
        .science-response {
            color: #9C27B0;
            font-weight: bold;
            background: rgba(156, 39, 176, 0.1);
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #9C27B0;
        }
        
        .emotional-response {
            color: #E91E63;
            font-weight: bold;
            background: rgba(233, 30, 99, 0.1);
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #E91E63;
        }
        
        .music-response {
            color: #1DB954;
            font-weight: bold;
            background: rgba(29, 185, 84, 0.1);
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #1DB954;
        }
        
        .welcome-message {
            text-align: left;
            font-size: 14px;
        }
        
        .welcome-message h3 {
            margin-bottom: 10px;
            color: #fff;
        }
        
        .welcome-message ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .welcome-message li {
            margin: 5px 0;
            color: #ccc;
        }
        
        .suggestions {
            margin-top: 10px;
            color: #888;
            font-style: italic;
        }
        
        #voice-button.voice-active {
            background: #ff4444 !important;
            animation: pulse 0.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .music-recognition-active .rainbow-container {
            animation-duration: 0.5s !important;
            border-color: #1DB954 !important;
        }
    `;
    document.head.appendChild(style);
}

// ================== FUNCIONES DE DEPURACIÓN ==================
window.debugSiri = {
    show: showSiri,
    hide: hideSiri,
    startListening: startListening,
    stopListening: stopListening,
    processQuestion: processQuestion,
    testMath: () => processQuestion("Calcula la derivada de x al cuadrado"),
    testGeo: () => processQuestion("Capital de Francia"),
    testScience: () => processQuestion("Qué es la fotosíntesis"),
    state: () => ({
        isListening,
        isVisible: body.classList.contains('siri-active')
    })
};

console.log('✅ Renderer.js cargado correctamente con todas las funciones');