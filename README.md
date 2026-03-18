# Curriculum-Christsopher

CV personal de Christopher Ivan Ortiz pensado para publicarse en GitHub Pages.

## Que incluye

- Frontend estatico en HTML, CSS y JavaScript (compatible con GitHub Pages).
- Workflow de GitHub Actions para desplegar automaticamente la carpeta public.
- Backend opcional en Node.js + Express para uso local o despliegue externo.

## Stack

- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Backend opcional: Node.js, Express
- Seguridad backend: helmet, express-rate-limit, zod, compression

## Estructura

curriculum/
|- .github/workflows/deploy-pages.yml
|- public/
|  |- index.html
|  |- styles.css
|  |- app.js
|- server.js
|- package.json
|- .env.example

## Publicar en GitHub Pages

1. Sube tus cambios a la rama main.
2. En GitHub, entra a Settings > Pages.
3. En Build and deployment, selecciona Source = GitHub Actions.
4. El workflow deploy-pages.yml publicara automaticamente la carpeta public.

Tu sitio quedara disponible en:
https://TU_USUARIO.github.io/TU_REPOSITORIO/

## Si falla el deploy de Pages

Si en GitHub Actions aparece un error como:
HttpError: Not Found / Get Pages site failed

hacer esto:

1. Ve a Settings > Pages.
2. En Build and deployment selecciona Source = GitHub Actions.
3. Guarda los cambios.
4. Re-ejecuta el workflow Deploy GitHub Pages.

Nota: El workflow ya incluye enablement: true para intentar habilitar Pages automaticamente. Si tu organizacion o permisos lo bloquean, debes habilitarlo manualmente en Settings.

## Contacto en GitHub Pages

GitHub Pages no ejecuta backend Node.js.

Por eso el formulario hace esto:
- Si existe backend en /api/contact, envia por API.
- Si estas en GitHub Pages sin backend, usa fallback con mailto.

Antes de publicar, cambia el valor de data-fallback-email en public/index.html por tu correo real.

## Ejecutar local con backend (opcional)

1. Instala dependencias:

   npm install

2. Crea archivo de entorno:

   Copy-Item .env.example .env

3. Levanta servidor:

   npm run dev

4. Abre:

   http://localhost:3000

## Endpoints backend

- GET /api/health: estado del backend
- POST /api/contact: recibe mensajes de contacto

## Personalizacion obligatoria

Edita public/index.html y reemplaza:
- Correo del hero
- Email en el bloque de contacto
- LinkedIn y GitHub
- og:url con la URL final de GitHub Pages
- Experiencia y proyectos con datos reales

## Buenas practicas aplicadas

- Rutas relativas para compatibilidad con repositorios de GitHub Pages
- UI responsive y accesible
- Validacion de formulario en frontend
- Fallback de contacto para hosting estatico
- Endpoints backend con validacion y protecciones basicas
