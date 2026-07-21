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
`scripts/fetch_planet_textures.sh`. (Later downscaled to 1024×512.)

## Deep-sky images (`assets/images/cosmic/`)

The non-planet badges use real imagery from the James Webb Space Telescope
(JWST) and the Hubble Space Telescope. All are published by
[ESA/Webb](https://esawebb.org/copyright/) and
[ESA/Hubble](https://esahubble.org/copyright/) under the
[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/)
(CC BY 4.0). They are center-cropped and re-encoded to WebP by
`scripts/fetch_cosmic_textures.sh`.

| File | Subject | Source URL | Credit | License |
|------|---------|-----------|--------|---------|
| `stardust-field.webp`      | Sagittarius Star Cloud ("A sky full of glittering jewels") | https://cdn.esahubble.org/archives/images/large/opo9828d.jpg | NASA, ESA/Hubble | CC BY 4.0 |
| `nebula-field.webp`        | Cosmic Cliffs, Carina Nebula (NGC 3324) | https://cdn.esawebb.org/archives/images/large/weic2205a.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |
| `protostar-field.webp`     | Protostar L1527 (NIRCam) | https://cdn.esawebb.org/archives/images/large/weic2219a.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |
| `whiteDwarf-field.webp`    | Southern Ring Nebula (NIRCam) | https://cdn.esawebb.org/archives/images/large/weic2207b.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |
| `stellarSystem-field.webp` | Wolf-Rayet 140 (concentric dust rings) | https://cdn.esawebb.org/archives/images/large/WR140a.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |
| `starCluster-field.webp`   | Star cluster Westerlund 2 (Hubble 25th anniversary) | https://cdn.esahubble.org/archives/images/large/heic1509a.jpg | NASA, ESA/Hubble | CC BY 4.0 |
| `galaxy-field.webp`        | Phantom Galaxy M74 | https://cdn.esawebb.org/archives/images/large/potm2208a.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |
| `cosmos-field.webp`        | Webb's First Deep Field (SMACS 0723) | https://cdn.esawebb.org/archives/images/large/weic2209a.jpg | NASA, ESA, CSA, STScI (ESA/Webb) | CC BY 4.0 |

## Required attribution

> Planet textures by Solar System Scope (https://www.solarsystemscope.com/textures/),
> licensed under CC BY 4.0. Derived from NASA imagery.
>
> Deep-sky images: NASA, ESA, CSA, STScI (ESA/Webb) and ESA/Hubble,
> licensed under CC BY 4.0.

The above attribution should appear in the app's About / Licenses section
before public release. ESA/Webb and ESA/Hubble additionally require that the
imagery not be used to imply their endorsement of a product — the badge use
here is decorative and does not.
