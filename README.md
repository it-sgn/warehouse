# Dashboard (fixed)
This is a fixed version of the Vue 3 + Vite dashboard with Keycloak init, Pinia auth store, axios instance, and Vite alias.

## Run
1. Copy `.env.template` to `.env` and adjust values.
2. Install dependencies:
   - npm: `npm install`
   - yarn: `yarn`
3. Run dev server:
   - `npm run dev` or `yarn dev`

## Keycloak notes
- Ensure Keycloak client has Web Origins set to `http://localhost:5173` (or your dev origin).
- Valid Redirect URIs: `http://localhost:5173/*`
- If backend token endpoint doesn't allow CORS, either configure Keycloak CORS or use Vite proxy.

