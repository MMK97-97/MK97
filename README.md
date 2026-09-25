# MK97 Creative Studio

Mobile-first cricket poster and short video editor, built with React, TypeScript and Vite.

## What works

- Browse 100 cricket poster presets and open one in the editor.
- Edit, drag, hide, lock, duplicate, delete and reorder text or image layers; undo and redo edits.
- Import an image from your device and export the poster as a 1080 × 1350 PNG or JPG.
- Save posters locally, reopen or delete them, and keep an automatic working draft.
- Save brand colors and a team logo on this device.
- Import a video, choose its in and out points, preview at different speeds, and export the selected clip where the browser supports canvas recording and MediaRecorder.
- Install as a home screen web app; visited resources are available offline after first load.
- Download or use the native device share sheet for posters.

Projects and brand assets are stored in browser storage on the current device. Browser data removal also removes them. Video editing is for one imported clip; browser support and output format depend on the device. Social accounts are not connected: export or share the file and post it in the desired app.

## Development

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` runs a clean Node 22 build on push to `main` and deploys `dist/` using the official Pages actions. Pull requests run the build without deploying. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The Vite base is relative, so the app works under `/MK97-/`.

## Future server integration

Direct Meta posting, AI processing, cloud projects and long video rendering need a backend. Never put provider tokens in this static frontend. The unused service contract in `src/services/metaPublish.ts` can be integrated once a secure backend and account authorization are available.
