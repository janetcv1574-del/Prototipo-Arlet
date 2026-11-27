#!/bin/sh
# Arma la versión web (Vercel) en public/index.html, a partir de las mismas piezas de src/.
cd "$(dirname "$0")"
mkdir -p public
S=src
{
  printf '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  cat $S/head.html $S/base.css $S/extra.css
  printf '</style>\n</head>\n<body>\n'
  sed '1d' $S/body.html
  printf 'window.ARLET_WEB = true;\n'
  cat $S/0-config.js $S/1-core.js $S/planes.js $S/2-ai.js $S/3-ui.js $S/4-bienvenida.js $S/5-inicio.js $S/6-views.js $S/7-cuenta-admin.js $S/8-actions.js
  printf '</script>\n</body>\n</html>\n'
} > public/index.html
