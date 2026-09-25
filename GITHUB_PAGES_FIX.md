# GitHub Pages deployment

The repository now contains the Vite source under `src/`, public assets under `public/`, a committed `package-lock.json`, and a deployment workflow at `.github/workflows/deploy-pages.yml`.

After pushing `main`, set **Settings → Pages → Build and deployment → Source → GitHub Actions** once. The workflow builds the app and publishes `dist/`. Check the Actions tab for the deployment result and then visit https://mmk97-97.github.io/MK97-/.
