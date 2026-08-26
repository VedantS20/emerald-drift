# Emerald Drift

just create a website with single page with interative green nature , something you'll just open to stare , there should be objects moving , no need of sound , just moving nature , make UI very good

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10f11df2-41b0-4ab4-9be7-6f5ba47c4f24).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to static hosting

`npm run build:static` produces a plain static site in `dist/client` — no Node
runtime, no server process. Upload its contents to your web root.

```sh
npm install   # or: bun install
npm run build:static
# upload everything in dist/client/ — including .htaccess — to public_html
```

The app shell is prerendered to `index.html` and the scene renders client-side,
so the server needs a fallback rewrite for paths that aren't real files.
`public/.htaccess` handles that on Apache. On nginx, use:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

`npm run build` is unchanged — it builds the SSR app via nitro (Cloudflare
Worker by default), which is what Lovable's Publish uses. Set `NITRO_PRESET`
to target another platform, e.g. `NITRO_PRESET=node-server npm run build`.
