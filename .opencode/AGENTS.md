# Medieval Survival — Juego RPG HTML

## Estructura
- **Origen desarrollo**: `~/proyecto/` (node_modules aquí, ejecutar siempre desde acá)
- **Distribución**: `/sdcard/Download/proyectos de termux/juego-medieval/` (solo fuentes, sin node_modules)
- **Acceso directo**: `/sdcard/juego.html` (abrir desde gestor de archivos Android)

## Comandos clave
- Abrir juego: `termux-open /sdcard/juego.html`
- Servir local: `cd ~/proyecto && python3 -m http.server 8080 --bind 0.0.0.0`
- Captura pantalla: `cd ~/proyecto && node captura.js /sdcard/salida.png`
- Sincronizar a /sdcard: `cp ~/proyecto/juego.html /sdcard/juego.html`
- Sincronizar a distribucióm: `cp ~/proyecto/juego.html "/sdcard/Download/proyectos de termux/juego-medieval/"`

## Reglas de edición
- Sin dependencias externas; el juego es un solo HTML autónomo
- Todas las mejoras se hacen en `juego.html`
- Después de cambios visuales: `node captura.js /sdcard/test.png` para verificar
- No editar dentro de /sdcard — editar en ~/proyecto, luego copiar
