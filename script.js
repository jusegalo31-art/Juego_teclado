/**
 * ===================================================================
 * LA AVENTURA DEL TECLADO - MOTOR DE JUEGO INTERACTIVO
 * Dirigido a: Niños de 2.º de primaria (7-8 años)
 * 100% JavaScript Vanilla (Sin librerías externas, 100% Offline)
 * ===================================================================
 */

(function () {
  'use strict';

  /* ===================================================================
   * 1. CONFIGURACIÓN PEDAGÓGICA Y CONTENIDOS (Fácilmente modificable)
   * =================================================================== */

  // NIVEL 1: Banco de letras para reconocimiento inicial
  const LEVEL_1_POOL = ['A', 'E', 'I', 'O', 'U', 'M', 'P', 'S', 'T', 'L', 'R', 'N'];

  // Pistas amigables para el Nivel 1 (para ubicar la tecla)
  const KEY_HINTS = {
    'A': 'Está en la fila de en medio, a la izquierda 👈',
    'S': 'Está al lado de la letra A, fila del medio',
    'D': 'Fila del medio, cerquita de la S',
    'E': 'Fila de arriba, cerca de los números',
    'I': 'Fila de arriba, mano derecha 👉',
    'O': 'Fila de arriba, casi al final',
    'U': 'Fila de arriba, en el centro',
    'M': 'Fila de abajo, mano derecha 👉',
    'P': 'Fila de arriba, ¡bien a la derecha!',
    'L': 'Fila de en medio, mano derecha',
    'R': 'Fila de arriba, al lado de la E',
    'T': 'Fila de arriba, al lado de la R',
    'N': 'Fila de abajo, al lado de la M'
  };

  // NIVEL 2: Configuraciones por ronda (Atrapa la letra con distractores)
  const LEVEL_2_ROUNDS = [
    { target: 'M', count: 3, label: 'Fácil (3 opciones)' },
    { target: 'S', count: 3, label: 'Fácil (3 opciones)' },
    { target: 'P', count: 4, label: 'Medio (4 opciones)' },
    { target: 'L', count: 5, label: 'Medio (5 opciones)' },
    { target: 'T', count: 5, label: 'Medio (5 opciones)' },
    { target: 'R', count: 6, label: 'Desafío (6 opciones)' },
    { target: 'N', count: 7, label: 'Desafío (7 opciones)' },
    { target: 'B', count: 7, label: 'Desafío (7 opciones)' }
  ];

  // NIVEL 3: Palabras sencillas con emojis llamativos
  const LEVEL_3_WORDS = [
    { word: 'GATO', emoji: '🐱', hint: 'Un felino muy cariñoso' },
    { word: 'SOL', emoji: '☀️', hint: 'Nos da luz y calor todos los días' },
    { word: 'CASA', emoji: '🏠', hint: 'El hogar de la familia' },
    { word: 'PEZ', emoji: '🐟', hint: 'Nada en el río y el mar' },
    { word: 'AUTO', emoji: '🚗', hint: 'Vehículo con cuatro ruedas' },
    { word: 'PERRO', emoji: '🐶', hint: 'El mejor amigo del ser humano' },
    { word: 'LUNA', emoji: '🌙', hint: 'Brilla en la noche' },
    { word: 'MANZANA', emoji: '🍎', hint: 'Una fruta dulce y roja' }
  ];

  // NIVEL 4: Frases cortas para enseñar espacio y fluidez
  const LEVEL_4_PHRASES = [
    { phrase: 'MI GATO', desc: 'Usa la barra espaciadora entre palabras' },
    { phrase: 'EL SOL', desc: '¡Escribe el espacio con tus pulgares!' },
    { phrase: 'MI CASA', desc: 'Dos palabras unidas por un espacio' },
    { phrase: 'EL PEZ ROJO', desc: '¡Gran reto de tres palabras!' },
    { phrase: 'MI PERRO SALTA', desc: '¡Misión final para un súper explorador!' }
  ];

  // Mensajes de motivación positiva aleatorios
  const POSITIVE_MESSAGES = [
    '⭐ ¡Muy bien hecho!',
    '🎯 ¡Excelente puntería!',
    '🌟 ¡Eres muy rápido!',
    '👏 ¡Qué bien lo haces!',
    '💪 ¡Sigue así, campeón!',
    '✨ ¡Brillante trabajo!',
    '🚀 ¡A toda velocidad!'
  ];

  /* ===================================================================
   * 2. ESTADO GENERAL DEL JUEGO
   * =================================================================== */
  const state = {
    currentLevel: 0,       // 0: bienvenida, 1-4: niveles de juego, 5: victoria, 6: game over
    roundIndex: 0,         // Índice dentro del nivel actual
    totalRounds: 0,        // Total de rondas del nivel actual
    score: 0,              // Puntuación acumulada
    streak: 0,             // Racha consecutiva de aciertos
    lives: 3,              // Corazones restantes (máx 3)
    maxLives: 3,
    totalHits: 0,          // Aciertos totales
    totalMisses: 0,        // Errores / reintentos
    completedWordsCount: 0,// Palabras o frases completadas
    gameStartTime: null,   // Inicio del juego
    soundEnabled: true,    // Estado del audio
    isProcessingInput: false,

    // Variables específicas para Nivel 3 y 4
    currentWordString: '',
    currentLetterPos: 0,   // Índice de la letra que se espera escribir
    activeTargetKey: ''    // Tecla que el niño debe presionar actualmente
  };

  /* ===================================================================
   * 3. SINTETIZADOR DE AUDIO (Web Audio API - 100% Puro y Offline)
   * =================================================================== */
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Reproductor de tonos armónicos con envolvente suave
  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, startDelay = 0) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const startTime = audioCtx.currentTime + startDelay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  }

  // Sonidos para cada evento del juego
  const sounds = {
    tap() {
      playTone(400, 'triangle', 0.05, 0.15);
    },
    correct() {
      // Arpegio alegre C5 - E5 - G5
      playTone(523.25, 'sine', 0.12, 0.25, 0);
      playTone(659.25, 'sine', 0.12, 0.25, 0.08);
      playTone(783.99, 'sine', 0.22, 0.25, 0.16);
    },
    streak() {
      // Campana de racha alta
      playTone(783.99, 'sine', 0.1, 0.25, 0);
      playTone(1046.50, 'triangle', 0.3, 0.3, 0.08);
    },
    miss() {
      // Tono suave amigable (evitar estruendos o zumbidos feos)
      playTone(280, 'sine', 0.18, 0.2, 0);
      playTone(220, 'sine', 0.25, 0.2, 0.1);
    },
    wordComplete() {
      // Fanfarria breve de palabra lista
      playTone(523.25, 'triangle', 0.12, 0.25, 0);
      playTone(659.25, 'triangle', 0.12, 0.25, 0.09);
      playTone(783.99, 'triangle', 0.12, 0.25, 0.18);
      playTone(1046.50, 'triangle', 0.4, 0.3, 0.27);
    },
    levelUp() {
      // Fanfarria de paso de nivel
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((note, idx) => {
        playTone(note, 'sine', 0.25, 0.3, idx * 0.1);
      });
    },
    victory() {
      // Gran celebración
      const melody = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
      melody.forEach((note, idx) => {
        playTone(note, 'triangle', 0.3, 0.35, idx * 0.14);
      });
    }
  };

  /* ===================================================================
   * 4. REFERENCIAS DOM
   * =================================================================== */
  const dom = {
    // Cabecera y estadísticas
    livesDisplay: document.getElementById('lives-display'),
    streakCount: document.getElementById('streak-count'),
    scoreDisplay: document.getElementById('score-display'),
    levelTitlePill: document.getElementById('level-title-pill'),
    levelTagIcon: document.getElementById('level-tag-icon'),
    levelTagText: document.getElementById('level-tag-text'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundStateText: document.getElementById('sound-state-text'),
    teacherBtn: document.getElementById('teacher-btn'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),

    // Mascota
    mascotAvatar: document.getElementById('mascot-avatar'),
    speechBubble: document.getElementById('speech-bubble'),
    instructionText: document.getElementById('instruction-text'),

    // Vistas de pantalla
    screenWelcome: document.getElementById('screen-welcome'),
    screenLevel1: document.getElementById('screen-level-1'),
    screenLevel2: document.getElementById('screen-level-2'),
    screenLevel3: document.getElementById('screen-level-3'),
    screenLevel4: document.getElementById('screen-level-4'),
    screenGameOver: document.getElementById('screen-game-over'),
    screenCelebration: document.getElementById('screen-celebration'),

    // Elementos de Nivel 1
    l1TargetLetter: document.getElementById('l1-target-letter'),
    l1HintPill: document.getElementById('l1-hint-pill'),

    // Elementos de Nivel 2
    l2TargetName: document.getElementById('l2-target-name'),
    l2DifficultyTag: document.getElementById('l2-difficulty-tag'),
    l2BubblesContainer: document.getElementById('l2-bubbles-container'),

    // Elementos de Nivel 3
    l3WordEmoji: document.getElementById('l3-word-emoji'),
    l3WordTilesContainer: document.getElementById('l3-word-tiles-container'),
    l3NextKeyTag: document.getElementById('l3-next-key-tag'),

    // Elementos de Nivel 4
    l4PhraseContainer: document.getElementById('l4-phrase-container'),
    l4NextKeyTag: document.getElementById('l4-next-key-tag'),

    // Pantalla de celebración
    finalScore: document.getElementById('final-score'),
    finalHits: document.getElementById('final-hits'),
    finalMisses: document.getElementById('final-misses'),
    finalWords: document.getElementById('final-words'),

    // Modal docente
    teacherModal: document.getElementById('teacher-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalOkBtn: document.getElementById('modal-ok-btn'),
    modalPrintBtn: document.getElementById('modal-print-btn'),
    metricHits: document.getElementById('metric-hits'),
    metricMisses: document.getElementById('metric-misses'),
    metricAccuracy: document.getElementById('metric-accuracy'),
    metricLevel: document.getElementById('metric-level'),
    metricWords: document.getElementById('metric-words'),
    metricTime: document.getElementById('metric-time'),

    // Notificación Toast
    feedbackToast: document.getElementById('feedback-toast'),
    feedbackToastIcon: document.getElementById('feedback-toast-icon'),
    feedbackToastText: document.getElementById('feedback-toast-text'),

    // Botones de acción
    startGameBtn: document.getElementById('start-game-btn'),
    retryLevelBtn: document.getElementById('retry-level-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    finalTeacherViewBtn: document.getElementById('final-teacher-view-btn'),

    // Teclado virtual
    virtualKeyboard: document.getElementById('virtual-keyboard'),
    allKeyButtons: document.querySelectorAll('.key-btn')
  };

  /* ===================================================================
   * 5. CONTROLADORES DE INTERFAZ Y MASCOTA
   * =================================================================== */

  function updateMascot(avatar, message) {
    if (avatar) dom.mascotAvatar.textContent = avatar;
    if (message) dom.instructionText.innerHTML = message;
  }

  function updateStatsDisplay() {
    // Vidas
    const hearts = '❤️'.repeat(Math.max(0, state.lives)) + '🖤'.repeat(Math.max(0, state.maxLives - state.lives));
    dom.livesDisplay.textContent = hearts;
    dom.livesDisplay.setAttribute('aria-label', `${state.lives} de 3 vidas`);

    // Puntos y racha
    dom.scoreDisplay.textContent = state.score;
    dom.streakCount.textContent = state.streak;

    // Barra de progreso
    if (state.totalRounds > 0) {
      const pct = Math.min(100, Math.round(((state.roundIndex + 1) / state.totalRounds) * 100));
      dom.progressFill.style.width = `${pct}%`;
      dom.progressText.textContent = `Progreso: ${state.roundIndex + 1} de ${state.totalRounds}`;
    }
  }

  let toastTimer = null;
  function showFeedbackToast(text, isError = false, icon = '⭐') {
    if (toastTimer) clearTimeout(toastTimer);

    dom.feedbackToastText.textContent = text;
    dom.feedbackToastIcon.textContent = icon;

    if (isError) {
      dom.feedbackToast.classList.add('toast-error');
    } else {
      dom.feedbackToast.classList.remove('toast-error');
    }

    dom.feedbackToast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      dom.feedbackToast.classList.add('hidden');
    }, 1800);
  }

  function switchScreen(screenElement) {
    const screens = [
      dom.screenWelcome,
      dom.screenLevel1,
      dom.screenLevel2,
      dom.screenLevel3,
      dom.screenLevel4,
      dom.screenGameOver,
      dom.screenCelebration
    ];
    screens.forEach(s => s.classList.remove('active'));
    screenElement.classList.add('active');
  }

  /* ===================================================================
   * 6. GESTIÓN DEL TECLADO VIRTUAL Y RESALTADO
   * =================================================================== */

  // Remueve cualquier resplandor objetivo previo
  function clearTargetHighlights() {
    dom.allKeyButtons.forEach(btn => btn.classList.remove('is-target'));
  }

  // Ilumina la tecla sugerida para guiar al niño
  function highlightTargetKey(targetKey) {
    clearTargetHighlights();
    if (!targetKey) return;

    const normalized = targetKey.toUpperCase();
    dom.allKeyButtons.forEach(btn => {
      const k = btn.getAttribute('data-key');
      if (k && k.toUpperCase() === normalized) {
        btn.classList.add('is-target');
      }
    });
  }

  // Efecto de pulsación visual breve cuando se presiona física o virtualmente
  function triggerKeyVisualPress(key) {
    const normalized = key === ' ' ? ' ' : key.toUpperCase();
    dom.allKeyButtons.forEach(btn => {
      const k = btn.getAttribute('data-key');
      if (k && (k.toUpperCase() === normalized || (k === ' ' && normalized === ' '))) {
        btn.classList.add('is-pressed');
        setTimeout(() => btn.classList.remove('is-pressed'), 160);
      }
    });
  }

  /* ===================================================================
   * 7. FLUJO DE NIVELES Y PROGRESIÓN
   * =================================================================== */

  // Iniciar el juego desde el botón inicial
  function startGame() {
    initAudio();
    state.score = 0;
    state.streak = 0;
    state.lives = 3;
    state.totalHits = 0;
    state.totalMisses = 0;
    state.completedWordsCount = 0;
    state.gameStartTime = new Date();

    startLevel1();
  }

  /* -------------------------------------------------------------
   * NIVEL 1: "Conoce el teclado" 🔎
   * ------------------------------------------------------------- */
  let level1LettersQueue = [];

  function startLevel1() {
    state.currentLevel = 1;
    state.roundIndex = 0;
    
    // Barajar letras para que no sea siempre el mismo orden
    level1LettersQueue = [...LEVEL_1_POOL].sort(() => Math.random() - 0.5);
    state.totalRounds = level1LettersQueue.length;

    dom.levelTagIcon.textContent = '🔎';
    dom.levelTagText.textContent = 'Nivel 1: Conoce el teclado';

    switchScreen(dom.screenLevel1);
    updateStatsDisplay();

    updateMascot('🤖', '¡Este es el teclado! Aquí escribimos letras, números y palabras. ¡Vamos a explorarlo!');
    setTimeout(() => {
      loadLevel1Round();
    }, 1200);
  }

  function loadLevel1Round() {
    if (state.roundIndex >= state.totalRounds) {
      celebrateLevelCompletion(2);
      return;
    }

    const letter = level1LettersQueue[state.roundIndex];
    state.activeTargetKey = letter;

    dom.l1TargetLetter.textContent = letter;
    dom.l1HintPill.textContent = KEY_HINTS[letter] ? `💡 ${KEY_HINTS[letter]}` : '💡 Búscala en tu teclado';

    updateMascot('🔎', `Encuentra y presiona la letra <strong>${letter}</strong>.`);
    highlightTargetKey(letter);
    updateStatsDisplay();
  }

  /* -------------------------------------------------------------
   * NIVEL 2: "Atrapa la letra" 🐭
   * ------------------------------------------------------------- */
  function startLevel2() {
    state.currentLevel = 2;
    state.roundIndex = 0;
    state.totalRounds = LEVEL_2_ROUNDS.length;

    dom.levelTagIcon.textContent = '🐭';
    dom.levelTagText.textContent = 'Nivel 2: Atrapa la letra';

    switchScreen(dom.screenLevel2);
    updateStatsDisplay();

    updateMascot('🐭', '¡Excelente! Ahora atrapa la letra correcta entre varios globitos flotantes.');
    setTimeout(() => {
      loadLevel2Round();
    }, 1200);
  }

  function loadLevel2Round() {
    if (state.roundIndex >= state.totalRounds) {
      celebrateLevelCompletion(3);
      return;
    }

    const currentConfig = LEVEL_2_ROUNDS[state.roundIndex];
    const target = currentConfig.target;
    state.activeTargetKey = target;

    dom.l2TargetName.textContent = target;
    dom.l2DifficultyTag.textContent = `Modo: ${currentConfig.label}`;

    // Generar distractores aleatorios
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(ch => ch !== target);
    const shuffledAlphabet = alphabet.sort(() => Math.random() - 0.5);
    const options = [target, ...shuffledAlphabet.slice(0, currentConfig.count - 1)].sort(() => Math.random() - 0.5);

    // Renderizar burbujas
    dom.l2BubblesContainer.innerHTML = '';
    options.forEach(char => {
      const bubble = document.createElement('button');
      bubble.className = 'bubble-btn';
      bubble.textContent = char;
      bubble.setAttribute('aria-label', `Letra ${char}`);
      bubble.addEventListener('click', () => {
        handleBubbleClick(char);
      });
      dom.l2BubblesContainer.appendChild(bubble);
    });

    updateMascot('🎯', `¡Atrapa la letra <strong>${target}</strong>! Haz clic en la burbuja o presiona la tecla.`);
    highlightTargetKey(target);
    updateStatsDisplay();
  }

  function handleBubbleClick(char) {
    triggerKeyVisualPress(char);
    processGameInput(char);
  }

  /* -------------------------------------------------------------
   * NIVEL 3: "Escribe la palabra" ✏️
   * ------------------------------------------------------------- */
  let level3WordsQueue = [];

  function startLevel3() {
    state.currentLevel = 3;
    state.roundIndex = 0;
    level3WordsQueue = [...LEVEL_3_WORDS].sort(() => Math.random() - 0.5);
    state.totalRounds = level3WordsQueue.length;

    dom.levelTagIcon.textContent = '✏️';
    dom.levelTagText.textContent = 'Nivel 3: Escribe la palabra';

    switchScreen(dom.screenLevel3);
    updateStatsDisplay();

    updateMascot('✏️', '¡Muy bien! Ahora vamos a escribir palabras completas. ¡Sigue la letra iluminada!');
    setTimeout(() => {
      loadLevel3Round();
    }, 1200);
  }

  function loadLevel3Round() {
    if (state.roundIndex >= state.totalRounds) {
      celebrateLevelCompletion(4);
      return;
    }

    const currentItem = level3WordsQueue[state.roundIndex];
    state.currentWordString = currentItem.word;
    state.currentLetterPos = 0;

    dom.l3WordEmoji.textContent = currentItem.emoji;
    renderWordTiles();

    updateCurrentWordTarget();
    updateStatsDisplay();
  }

  function renderWordTiles() {
    dom.l3WordTilesContainer.innerHTML = '';
    const letters = state.currentWordString.split('');

    letters.forEach((char, idx) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.id = `l3-tile-${idx}`;
      tile.textContent = char;

      if (idx < state.currentLetterPos) {
        tile.classList.add('completed');
      } else if (idx === state.currentLetterPos) {
        tile.classList.add('active-target');
      }

      dom.l3WordTilesContainer.appendChild(tile);
    });
  }

  function updateCurrentWordTarget() {
    const targetChar = state.currentWordString[state.currentLetterPos];
    state.activeTargetKey = targetChar;
    dom.l3NextKeyTag.textContent = targetChar;

    renderWordTiles();
    highlightTargetKey(targetChar);

    updateMascot('💡', `Escribe la palabra <strong>${state.currentWordString}</strong>. Siguiente tecla: <strong>${targetChar}</strong>`);
  }

  /* -------------------------------------------------------------
   * NIVEL 4: "La gran misión" 🏆 (Frases y uso de espacio)
   * ------------------------------------------------------------- */
  function startLevel4() {
    state.currentLevel = 4;
    state.roundIndex = 0;
    state.totalRounds = LEVEL_4_PHRASES.length;

    dom.levelTagIcon.textContent = '🏆';
    dom.levelTagText.textContent = 'Nivel 4: La gran misión';

    switchScreen(dom.screenLevel4);
    updateStatsDisplay();

    updateMascot('🏆', '¡Gran desafío final! Escribe frases usando letras y la <strong>barra de espacio</strong>.');
    setTimeout(() => {
      loadLevel4Round();
    }, 1200);
  }

  function loadLevel4Round() {
    if (state.roundIndex >= state.totalRounds) {
      showVictoryCelebration();
      return;
    }

    const currentItem = LEVEL_4_PHRASES[state.roundIndex];
    state.currentWordString = currentItem.phrase;
    state.currentLetterPos = 0;

    renderPhraseTiles();
    updateCurrentPhraseTarget();
    updateStatsDisplay();
  }

  function renderPhraseTiles() {
    dom.l4PhraseContainer.innerHTML = '';
    const chars = state.currentWordString.split('');

    chars.forEach((char, idx) => {
      const tile = document.createElement('div');
      tile.className = 'phrase-tile';
      tile.id = `l4-tile-${idx}`;

      if (char === ' ') {
        tile.classList.add('is-space');
        tile.textContent = '␣ Espacio';
      } else {
        tile.textContent = char;
      }

      if (idx < state.currentLetterPos) {
        tile.classList.add('completed');
      } else if (idx === state.currentLetterPos) {
        tile.classList.add('active-target');
      }

      dom.l4PhraseContainer.appendChild(tile);
    });
  }

  function updateCurrentPhraseTarget() {
    const targetChar = state.currentWordString[state.currentLetterPos];
    state.activeTargetKey = targetChar;

    if (targetChar === ' ') {
      dom.l4NextKeyTag.textContent = '␣ ESPACIO';
      highlightTargetKey(' ');
      updateMascot('🚀', '¡Toca presionar la <strong>Barra Espaciadora</strong> para separar las palabras!');
    } else {
      dom.l4NextKeyTag.textContent = targetChar;
      highlightTargetKey(targetChar);
      updateMascot('✍️', `Siguiente tecla: <strong>${targetChar}</strong>`);
    }

    renderPhraseTiles();
  }

  /* ===================================================================
   * 8. NÚCLEO DE VALIDACIÓN DE ENTRADAS (Físico y Virtual unificados)
   * =================================================================== */

  function processGameInput(inputKey) {
    if (state.currentLevel < 1 || state.currentLevel > 4) return;
    if (state.isProcessingInput) return;

    sounds.tap();

    const normalizedInput = inputKey === ' ' ? ' ' : inputKey.toUpperCase();
    const expectedTarget = state.activeTargetKey.toUpperCase();

    // Verificación de acierto
    if (normalizedInput === expectedTarget) {
      handleCorrectHit();
    } else {
      // Ignorar teclas modificadoras irrelevantes para no penalizar accidentalmente
      if (['SHIFT', 'CONTROL', 'ALT', 'CAPSLOCK', 'TAB', 'ENTER'].includes(normalizedInput)) {
        return;
      }
      handleIncorrectAttempt(normalizedInput);
    }
  }

  // Manejo de pulsación acertada
  function handleCorrectHit() {
    state.totalHits++;
    state.streak++;

    // Puntos: 10 base + bonus por racha
    const bonus = Math.floor(state.streak / 3) * 5;
    const pointsEarned = 10 + bonus;
    state.score += pointsEarned;

    if (state.streak >= 3 && state.streak % 3 === 0) {
      sounds.streak();
      showFeedbackToast(`🔥 ¡Racha x${state.streak}! +${pointsEarned} pts`, false, '🔥');
    } else {
      sounds.correct();
      const randomMsg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
      showFeedbackToast(`${randomMsg} +${pointsEarned} pts`, false, '⭐');
    }

    // Comportamiento según el nivel activo
    if (state.currentLevel === 1) {
      state.isProcessingInput = true;
      dom.l1TargetLetter.style.transform = 'scale(1.2)';
      setTimeout(() => {
        dom.l1TargetLetter.style.transform = '';
        state.roundIndex++;
        state.isProcessingInput = false;
        loadLevel1Round();
      }, 500);

    } else if (state.currentLevel === 2) {
      state.isProcessingInput = true;
      setTimeout(() => {
        state.roundIndex++;
        state.isProcessingInput = false;
        loadLevel2Round();
      }, 500);

    } else if (state.currentLevel === 3) {
      state.currentLetterPos++;
      if (state.currentLetterPos >= state.currentWordString.length) {
        // Palabra completa
        state.completedWordsCount++;
        state.score += 25; // Bonus por completar palabra
        sounds.wordComplete();
        showFeedbackToast(`🎉 ¡Palabra completada: ${state.currentWordString}!`, false, '🎉');
        updateMascot('🥳', `¡Genial! Escribiste la palabra <strong>${state.currentWordString}</strong> completa.`);

        state.isProcessingInput = true;
        setTimeout(() => {
          state.roundIndex++;
          state.isProcessingInput = false;
          loadLevel3Round();
        }, 1200);
      } else {
        updateCurrentWordTarget();
      }

    } else if (state.currentLevel === 4) {
      state.currentLetterPos++;
      if (state.currentLetterPos >= state.currentWordString.length) {
        // Frase completa
        state.completedWordsCount++;
        state.score += 50; // Gran bonus
        sounds.wordComplete();
        showFeedbackToast(`🎉 ¡Frase completada!`, false, '🏅');
        updateMascot('🌟', `¡Increíble trabajo! Escribiste: <em>"${state.currentWordString}"</em>`);

        state.isProcessingInput = true;
        setTimeout(() => {
          state.roundIndex++;
          state.isProcessingInput = false;
          loadLevel4Round();
        }, 1300);
      } else {
        updateCurrentPhraseTarget();
      }
    }

    updateStatsDisplay();
  }

  // Manejo de error con retroalimentación constructiva
  function handleIncorrectAttempt(wrongKey) {
    state.totalMisses++;
    state.streak = 0; // Se reinicia la racha

    sounds.miss();

    // Mensaje respetuoso y constructivo
    const targetLabel = state.activeTargetKey === ' ' ? 'la Barra Espaciadora' : `la letra ${state.activeTargetKey}`;
    showFeedbackToast(`Casi... ¡Busca ${targetLabel}! 🔎`, true, '💪');
    updateMascot('🤔', `Casi lo logras... Recuerda buscar <strong>${targetLabel}</strong>.`);

    // Perder un corazón
    state.lives--;
    updateStatsDisplay();

    // Si los corazones llegan a 0: pantalla de recuperación amigable
    if (state.lives <= 0) {
      triggerGameOverRecovery();
    }
  }

  // Pantalla de recuperación sin frustración
  function triggerGameOverRecovery() {
    clearTargetHighlights();
    updateMascot('🌱', '¡No te preocupes! Todo explorador necesita un respiro. ¡Recupera tus corazones y sigamos!');
    switchScreen(dom.screenGameOver);
  }

  // Reanudar nivel tras agotar corazones
  function retryCurrentLevel() {
    state.lives = 3;
    updateStatsDisplay();

    if (state.currentLevel === 1) {
      loadLevel1Round();
      switchScreen(dom.screenLevel1);
    } else if (state.currentLevel === 2) {
      loadLevel2Round();
      switchScreen(dom.screenLevel2);
    } else if (state.currentLevel === 3) {
      loadLevel3Round();
      switchScreen(dom.screenLevel3);
    } else if (state.currentLevel === 4) {
      loadLevel4Round();
      switchScreen(dom.screenLevel4);
    }
  }

  // Celebración entre niveles
  function celebrateLevelCompletion(nextLevelNumber) {
    sounds.levelUp();
    clearTargetHighlights();

    let nextName = '';
    if (nextLevelNumber === 2) nextName = 'Nivel 2: Atrapa la letra';
    if (nextLevelNumber === 3) nextName = 'Nivel 3: Escribe la palabra';
    if (nextLevelNumber === 4) nextName = 'Nivel 4: La gran misión';

    showFeedbackToast('🎉 ¡Nivel Superado! 🎉', false, '🏆');
    updateMascot('🌟', `¡SÚPER! Has completado este nivel. ¡Prepárate para <strong>${nextName}</strong>!`);

    setTimeout(() => {
      if (nextLevelNumber === 2) startLevel2();
      else if (nextLevelNumber === 3) startLevel3();
      else if (nextLevelNumber === 4) startLevel4();
    }, 1500);
  }

  // Pantalla final de victoria
  function showVictoryCelebration() {
    state.currentLevel = 5;
    sounds.victory();
    clearTargetHighlights();

    dom.finalScore.textContent = state.score;
    dom.finalHits.textContent = state.totalHits;
    dom.finalMisses.textContent = state.totalMisses;
    dom.finalWords.textContent = state.completedWordsCount;

    dom.levelTagIcon.textContent = '🏅';
    dom.levelTagText.textContent = '¡Misión Cumplida!';

    updateMascot('🥳', '¡Felicidades, CAMPEÓN! Te has convertido oficialmente en un <strong>Explorador del Teclado</strong>.');
    switchScreen(dom.screenCelebration);
  }

  /* ===================================================================
   * 9. PANEL DEL DOCENTE (Métricas Pedagógicas)
   * =================================================================== */

  function openTeacherModal() {
    // Calcular tiempo transcurrido
    let timeStr = '00:00';
    if (state.gameStartTime) {
      const diffSecs = Math.max(0, Math.floor((new Date() - state.gameStartTime) / 1000));
      const mins = Math.floor(diffSecs / 60).toString().padStart(2, '0');
      const secs = (diffSecs % 60).toString().padStart(2, '0');
      timeStr = `${mins}:${secs}`;
    }

    // Precisión
    const totalPulsaciones = state.totalHits + state.totalMisses;
    const accuracy = totalPulsaciones > 0 ? Math.round((state.totalHits / totalPulsaciones) * 100) : 100;

    // Nombre de nivel actual
    let levelName = 'Bienvenida';
    if (state.currentLevel === 1) levelName = 'Nivel 1 (Reconocimiento)';
    else if (state.currentLevel === 2) levelName = 'Nivel 2 (Distractores)';
    else if (state.currentLevel === 3) levelName = 'Nivel 3 (Palabras)';
    else if (state.currentLevel === 4) levelName = 'Nivel 4 (Frases y espacio)';
    else if (state.currentLevel === 5) levelName = 'Juego completado';

    dom.metricHits.textContent = state.totalHits;
    dom.metricMisses.textContent = state.totalMisses;
    dom.metricAccuracy.textContent = `${accuracy}%`;
    dom.metricLevel.textContent = levelName;
    dom.metricWords.textContent = state.completedWordsCount;
    dom.metricTime.textContent = timeStr;

    dom.teacherModal.classList.remove('hidden');
  }

  function closeTeacherModal() {
    dom.teacherModal.classList.add('hidden');
  }

  /* ===================================================================
   * 10. CONFIGURACIÓN DE EVENTOS (TECLADO FÍSICO Y CLICS VIRTUALES)
   * =================================================================== */

  function setupEventListeners() {
    // 1. Detección del Teclado Físico
    window.addEventListener('keydown', (e) => {
      // Ignorar si un modal está abierto o si no estamos jugando
      if (!dom.teacherModal.classList.contains('hidden')) return;

      const key = e.key;

      // Evitar que la barra espaciadora o backspace hagan scroll o navegación atrás en el navegador
      if ([' ', 'Backspace', 'Tab'].includes(key)) {
        e.preventDefault();
      }

      // Inicializar contexto de audio en la primera interacción
      initAudio();

      // Efecto visual en la tecla virtual correspondiente
      triggerKeyVisualPress(key);

      // Enviar a la lógica del juego
      processGameInput(key);
    });

    // 2. Clics en el Teclado Virtual
    dom.allKeyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        initAudio();

        const keyVal = btn.getAttribute('data-key');
        if (keyVal) {
          triggerKeyVisualPress(keyVal);
          processGameInput(keyVal);
        }
      });
    });

    // 3. Botones de acción principales
    dom.startGameBtn.addEventListener('click', () => {
      startGame();
    });

    dom.retryLevelBtn.addEventListener('click', () => {
      retryCurrentLevel();
    });

    dom.playAgainBtn.addEventListener('click', () => {
      startGame();
    });

    dom.finalTeacherViewBtn.addEventListener('click', () => {
      openTeacherModal();
    });

    // 4. Conmutador de Sonido ON/OFF
    dom.soundToggleBtn.addEventListener('click', () => {
      initAudio();
      state.soundEnabled = !state.soundEnabled;
      dom.soundStateText.textContent = state.soundEnabled ? 'ON' : 'OFF';
      dom.soundToggleBtn.title = `Sonido: ${state.soundEnabled ? 'Encendido' : 'Apagado'}`;
      if (state.soundEnabled) {
        sounds.tap();
      }
    });

    // 5. Botones del Modo Docente
    dom.teacherBtn.addEventListener('click', openTeacherModal);
    dom.closeModalBtn.addEventListener('click', closeTeacherModal);
    dom.modalOkBtn.addEventListener('click', closeTeacherModal);
    dom.modalPrintBtn.addEventListener('click', () => {
      window.print();
    });

    // Cerrar modal al hacer clic en el fondo oscuro
    dom.teacherModal.addEventListener('click', (e) => {
      if (e.target === dom.teacherModal) {
        closeTeacherModal();
      }
    });
  }

  // Inicialización al cargar el documento
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateStatsDisplay();
  });

})();
