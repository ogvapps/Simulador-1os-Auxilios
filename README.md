# Desafío Socorrista 🚑

Aplicación educativa interactiva de primeros auxilios con seguimiento de progreso y gamificación.

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. Habilita **Authentication** (Proveedor Anónimo) y **Firestore Database**.
3. Crea un archivo `.env` en la raíz (basado en `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Pega tus credenciales en el archivo `.env`.

### 3. Ejecutar localmente
```bash
npm run dev
```

---

## 🌐 Despliegue en GitHub Pages

Esta aplicación está lista para desplegarse en GitHub Pages usando GitHub Actions.

### Paso 1: Subir el código
Sube tu código a un repositorio de GitHub.

### Paso 2: Configurar Secretos
Para que la aplicación funcione en producción sin exponer tus claves en el código público:

1. Ve a tu repositorio en GitHub.
2. Entra en **Settings** > **Secrets and variables** > **Actions**.
3. Haz clic en **New repository secret** y añade las siguientes variables (copiando los valores de tu `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Paso 3: Configurar GitHub Actions
Crea un archivo en `.github/workflows/deploy.yml` con el siguiente contenido (ajustando si usas `npm` o `yarn`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          # ... añade el resto de secrets aquí

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Opción Alternativa: Configuración Externa (Runtime)
Si prefieres no recompilar la aplicación para cambiar la configuración, puedes crear un archivo `config.js` en la carpeta `public/` e importarlo en `index.html` antes del script principal:

```javascript
// public/config.js
window.__firebase_config = {
  apiKey: "...",
  authDomain: "...",
  projectId: "..."
};
```

## ⚠️ Notas Importantes
- Si no configuras las variables, la app entrará automáticamente en **Modo Mock (Demostración)**. No se guardarán datos, pero la interfaz será totalmente funcional.
- Asegúrate de configurar las **Reglas de Firestore** para permitir lectura/escritura a usuarios autenticados.