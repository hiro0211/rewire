# Asset Credits

Rewire bundles publicly available planetary textures. This document records
their provenance and license terms.

## Planet textures (`assets/images/planets/`)

The following equirectangular textures are sourced from
[Solar System Scope — Solar Textures](https://www.solarsystemscope.com/textures/),
licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/)
(CC BY 4.0). The maps are derived from NASA imagery (Cassini, Voyager, MESSENGER,
Mariner, MGS, Hubble, LRO, SDO and others) reprocessed by Solar System Scope.

| File | Source URL | License |
|------|-----------|---------|
| `mercury-equirect.webp` | https://www.solarsystemscope.com/textures/download/2k_mercury.jpg | CC BY 4.0 |
| `venus-equirect.webp`   | https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg | CC BY 4.0 |
| `earth-equirect.webp`   | https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg | CC BY 4.0 |
| `mars-equirect.webp`    | https://www.solarsystemscope.com/textures/download/2k_mars.jpg | CC BY 4.0 |
| `jupiter-equirect.webp` | https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg | CC BY 4.0 |
| `saturn-equirect.webp`  | https://www.solarsystemscope.com/textures/download/2k_saturn.jpg | CC BY 4.0 |
| `uranus-equirect.webp`  | https://www.solarsystemscope.com/textures/download/2k_uranus.jpg | CC BY 4.0 |
| `neptune-equirect.webp` | https://www.solarsystemscope.com/textures/download/2k_neptune.jpg | CC BY 4.0 |
| `moon-equirect.webp`    | https://www.solarsystemscope.com/textures/download/2k_moon.jpg | CC BY 4.0 |
| `sun-equirect.webp`     | https://www.solarsystemscope.com/textures/download/2k_sun.jpg | CC BY 4.0 |

All JPGs are converted to WebP (`cwebp -q 80`) at 2048×1024 by
`scripts/fetch_planet_textures.sh`.

## Required attribution

> Planet textures by Solar System Scope (https://www.solarsystemscope.com/textures/),
> licensed under CC BY 4.0. Derived from NASA imagery.

The above attribution should appear in the app's About / Licenses section
before public release.
