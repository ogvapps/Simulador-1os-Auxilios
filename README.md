# Desafío Socorrista 🚑

Aplicación educativa interactiva de primeros auxilios construida con React, Tailwind CSS y Firebase.

## 🚀 Configuración Inicial

### 1. Clonar y preparar
Asegúrate de tener Node.js instalado.

```bash
npm install
```

### 2. Configurar Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Authentication** (Anónimo) y **Firestore**.
3. Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`).
4. Rellena las variables con la configuración de tu proyecto web de Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
# ... resto de variables
```

## 🛠 Desarrollo Local

Para correr la aplicación localmente:

```bash
npm run dev
# o
npm start
```

La aplicación detectará automáticamente las variables del archivo `.env`. Si no se detectan, entrará en "Modo Demostración" (Offline).

## 🌐 Despliegue en GitHub Pages

La aplicación está diseñada para funcionar en GitHub Pages. Sigue estos pasos:

### Opción A: Build Automático (Recomendado)

1. Sube tu código a GitHub.
2. Ve a **Settings** > **Secrets and variables** > **Actions**.
3. Crea "New repository secret" para cada variable de entorno de Firebase:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.
4. Configura un GitHub Action para construir y desplegar.

### Opción B: Build Manual

1. Asegúrate de que tu archivo `.env` tiene los datos de producción.
2. Ejecuta el build:
   ```bash
   npm run build
   ```
3. Sube el contenido de la carpeta `dist` (o `build`) a la rama `gh-pages`.

### Opción C: Configuración en Runtime (Sin Build)

Si no usas un proceso de build y subes los archivos tal cual, puedes inyectar la configuración globalmente en `index.html` antes de cargar la app:

```html
<script>
  window.__firebase_config = {
    apiKey: "...",
    authDomain: "...",
    projectId: "..."
  };
</script>
```

## 📝 Notas

- Si la base de datos no está conectada, la app funcionará en modo "Solo lectura/Local" y no guardará progreso persistente.
- Asegúrate de configurar las reglas de seguridad de Firestore adecuadamente para producción.
