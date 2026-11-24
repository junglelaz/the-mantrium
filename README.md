# The Mantrium

The interactive 3D sanctuary at [mantrium.io/themantrium](https://mantrium.io/themantrium/). This review snapshot contains the fluid251 source, local Three.js dependencies, scene assets and PHP endpoints.

## Project focus

An exploration of spatial storytelling and an immersive portfolio experience, connecting creative direction, interaction design and browser-based 3D. The public source lets reviewers inspect the arrival sequence, scene navigation, atmosphere and content presentation.

**Experience:** [Open The Mantrium](https://mantrium.io/themantrium/)

## Review the experience

Start in [index.html](themantrium/index.html). The [arrival sequence](themantrium/arrival-fluid251.js) loads the [scene and controls](themantrium/app-fluid251.js). [Cloud rendering](themantrium/clouds-fluid251.js) handles ambient drift, orb movement and desktop hover. [Temple interiors](themantrium/interiors-fluid251.js) and [reading panels](themantrium/temple-pages-fluid248.js) handle the portfolio experience. Server-side handlers live in [api](themantrium/api/).

## Run locally

From the repository root, run `php -S 127.0.0.1:8000` and open `http://127.0.0.1:8000/themantrium/`. For a visual-only preview, use `python3 -m http.server 8000` at the same address. The scene uses WebGL and browser ES modules.

NPC dialogue requires PHP cURL and a server-side `OPENAI_API_KEY`. Contact delivery uses the server's mail configuration. Production credentials and visitor state are excluded. See the [asset credits](themantrium/public/ASSET-CREDITS.md), [star credits](themantrium/STAR-CREDITS.txt) and license notices in the vendor and astronomy files.
