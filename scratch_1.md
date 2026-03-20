I need to serve these static sites (public/thuisbatterij & public/vaste-lasten) under different domains and different paths.

- `vastelastenonderzoek.nl/voltafy` must resolve to `/public/vaste-lasten/index.html?partner=voltafy`
- `vastelastenonderzoek.nl/gemakkelijkbesparen` must resolve to `/public/vaste-lasten/index.html?partner=gemakkelijk-besparen`
- `vastelastenonderzoek.nl/vle` must resolve to `/public/vaste-lasten/index.html?partner=vle`
- `vastelastenonderzoek.nl/` must resolve to `/public/vaste-lasten/index.html` (no partner logo)
- `verdienduurzaam.nl/thuisbatterij` must resolve to `/public/thuisbatterij/index.html`

This must be dynamic and configurable as possible, since we will add more sites in the future.

Keep in mind some sites have their own assets (css, js, img) and some assets are shared between sites.

You can also use server-side rendering to render pages and choose the correct assets.

Please propose me a solution for this. You can proprose with adjusting vercel.json file, or using backend (express) to render the pages or whatever.
Please also think on something I can serve different sites for local development. I can use a local server with a configuration file to map domains to specific directories and serve them locally or use different ports for each site.. or whatever.
