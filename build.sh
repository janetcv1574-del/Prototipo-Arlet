#!/bin/sh
# Une las partes en arlet.html (la página que se publica)
cd "$(dirname "$0")/src"
cat head.html base.css extra.css body.html 0-config.js 1-core.js planes.js 2-ai.js 3-ui.js 4-bienvenida.js 5-inicio.js 6-views.js 7-cuenta-admin.js 8-actions.js > ../arlet.html
printf '</script>\n' >> ../arlet.html
