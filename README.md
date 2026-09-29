# 🎮 La Aventura del Teclado - Guía Pedagógica y de Uso

¡Bienvenido(a) a **La Aventura del Teclado**! Este es un videojuego educativo interactivo desarrollado en **HTML5, CSS3 y JavaScript Vanilla**, diseñado especialmente para niñas y niños de **2.º de primaria (7 a 8 años)**.

---

## 🚀 ¿Cómo Ejecutar el Juego?

El juego funciona de forma **100% offline (sin conexión a Internet)** y sin necesidad de instalar programas especiales, bases de datos ni servidores.

### Opción 1: Directamente en el Navegador (Recomendada para el aula)
1. Ve a la carpeta del juego:
   `Juego_teclado/`
2. Haz doble clic sobre el archivo **`index.html`** (o clic derecho > *Abrir con* > Google Chrome, Microsoft Edge, Firefox o Safari).
3. ¡Listo! El juego comenzará de inmediato.

---

## 🗺️ Estructura de los 4 Niveles

1. **Nivel 1: Conoce el teclado 🔎**
   - **Objetivo:** Reconocer y localizar teclas individuales.
   - Letras objetivo barajadas aleatoriamente (A, E, I, O, U, M, P, S, T, L, R, N).
   - El teclado virtual resalta en color amarillo brillante la tecla objetivo para guiar visualmente al niño.

2. **Nivel 2: Atrapa la letra 🐭**
   - **Objetivo:** Encontrar la letra correcta entre distractores flotantes.
   - Progresión de dificultad:
     - *Fácil:* 3 opciones.
     - *Medio:* 4 y 5 opciones.
     - *Desafío:* 6 y 7 opciones.
   - El niño puede pulsar la tecla física o hacer clic en la burbuja en pantalla.

3. **Nivel 3: Escribe la palabra ✏️**
   - **Objetivo:** Combinar letras consecutivas para formar palabras reales con apoyo de emojis.
   - Palabras incluidas: `GATO`, `SOL`, `CASA`, `PEZ`, `AUTO`, `PERRO`, `LUNA`, `MANZANA`.
   - La siguiente letra que el niño debe pulsar se resalta con un marco activo y una etiqueta guía.

4. **Nivel 4: La gran misión 🏆**
   - **Objetivo:** Escribir frases sencillas utilizando letras y la **barra espaciadora**.
   - Frases: `MI GATO`, `EL SOL`, `MI CASA`, `EL PEZ ROJO`, `MI PERRO SALTA`.
   - Enseña la lateralidad y el uso de los pulgares para presionar el espacio.

---

## 👩‍🏫 Modo Docente (Panel de Observación)

En la esquina superior derecha encontrarás el botón **👩‍🏫 Docente**. Al presionarlo en cualquier momento (o al finalizar el juego), podrás consultar:

- **Aciertos totales:** Cantidad de pulsaciones correctas.
- **Errores / Reintentos:** Intentos que requirieron corrección.
- **Porcentaje de precisión:** Relación porcentual de aciertos.
- **Nivel alcanzado:** Etapa actual del estudiante.
- **Palabras y frases logradas:** Cantidad de ejercicios completados.
- **Tiempo de práctica:** Minutos y segundos transcurridos.
- **Botón "🖨️ Imprimir Reporte":** Permite imprimir o guardar en PDF las estadísticas del estudiante para el registro escolar.

---

## 🛠️ ¿Cómo Modificar Palabras, Niveles y Puntuaciones?

Todo el contenido está centralizado al inicio del archivo **[`script.js`](./script.js)** en la sección `1. CONFIGURACIÓN PEDAGÓGICA Y CONTENIDOS`.

### 1. Cambiar o agregar palabras al Nivel 3:
Abre `script.js` y busca `LEVEL_3_WORDS`:
```javascript
const LEVEL_3_WORDS = [
  { word: 'GATO', emoji: '🐱', hint: 'Un felino muy cariñoso' },
  { word: 'SOL', emoji: '☀️', hint: 'Nos da luz y calor' },
  // Para agregar una palabra nueva, solo copia esta línea:
  { word: 'MESA', emoji: '🪑', hint: 'Mueble con cuatro patas' },
];
```

### 2. Cambiar o agregar frases al Nivel 4:
Busca `LEVEL_4_PHRASES`:
```javascript
const LEVEL_4_PHRASES = [
  { phrase: 'MI GATO', desc: 'Usa la barra espaciadora entre palabras' },
  // Puedes agregar una nueva frase:
  { phrase: 'LA MESA AZUL', desc: 'Frase de tres palabras' },
];
```

### 3. Modificar puntuaciones y vidas:
En `handleCorrectHit()` dentro de `script.js`:
- Puntos por tecla acertada: actualmente `10 + bonus`.
- Puntos por palabra completa: actualmente `+25 pts`.
- Puntos por frase completa: actualmente `+50 pts`.
- Vidas iniciales: variable `state.lives = 3` (puedes cambiarlo a 5 si deseas mayor tolerancia).

---

## 🎨 Código de Colores del Teclado Virtual

- **Amarillo pastel:** Fila superior de números (0–9).
- **Azul celeste:** Teclas asignadas a la mano izquierda.
- **Lavanda / Morado:** Teclas asignadas a la mano derecha.
- **Verde menta y Coral:** Teclas de acción especial (Enter, Backspace, Shift, Espacio).
- **Amarillo resplandeciente pulsante:** Guía para la siguiente tecla a presionar.

---

## 🔊 Sonido 100% Sintetizado (Sin archivos externos)
Utiliza la **Web Audio API** nativa del navegador. Funciona sin descargar audios MP3 ni librerías adicionales, garantizando que nunca se rompan los enlaces a sonidos. Incluye botón para silenciar (**🔊 ON/OFF**).
