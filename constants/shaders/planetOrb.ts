/**
 * SkSL shader for planet orbs with texture sampling.
 * Generalized from EARTH_SHADER to support any planet via uniforms.
 *
 * Uniforms:
 *   time           — elapsed seconds
 *   resolution     — canvas size (px)
 *   glowBoost      — 0-1, tap-driven inner glow intensity
 *   cloudOpacity   — 0-1, procedural cloud layer blend (0 = no clouds)
 *   atmosphereColor — vec3 0-1, atmosphere ring + inner glow tint
 *   emissive       — 0=normal lit sphere, 1=uniform self-emission (Sun)
 *   rotationSpeed  — texture longitude scroll rate per second
 *
 * Child shader: image (equirectangular planet texture via ImageShader)
 */
export const PLANET_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform float glowBoost;
uniform float cloudOpacity;
uniform vec3 atmosphereColor;
uniform float emissive;
uniform float rotationSpeed;
uniform shader image;

float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(100.0);
    mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p  = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 centered = (uv - 0.5) * 2.0;
    float r = length(centered);

    float sphere = 1.0 - smoothstep(0.88, 0.92, r);
    float atmosphere = 1.0 - smoothstep(0.88, 1.0, r);
    if (atmosphere < 0.01) return vec4(0.0);

    float lat = asin(clamp(centered.y / 0.9, -1.0, 1.0));
    float cosLat = cos(lat);
    float sinLon = clamp(centered.x / (0.9 * max(cosLat, 0.001)), -1.0, 1.0);
    float lon = asin(sinLon);

    lon += time * rotationSpeed;

    vec2 texCoord = vec2(
        fract(lon / 6.2832 + 0.5),
        1.0 - (lat / 3.1416 + 0.5)
    ) * resolution;
    vec4 planetColor = image.eval(texCoord);

    // Procedural cloud layer (skipped when cloudOpacity = 0)
    vec2 cloudUV = vec2(lon * 2.0 + time * 0.03, lat * 3.0);
    float cloud = fbm(cloudUV);
    cloud = smoothstep(0.52, 0.7, cloud) * cloudOpacity;
    vec3 surface = mix(planetColor.rgb, vec3(1.0), cloud);

    // Edge darkening (disabled when emissive = 1, e.g. Sun)
    float edgeFade = 1.0 - smoothstep(0.1, 0.85, r);
    surface *= mix(0.55 + 0.45 * edgeFade, 1.0, emissive);

    // Specular highlight (disabled when emissive = 1)
    float spec = smoothstep(0.5, 0.0, length(centered - vec2(-0.2, -0.25)));
    surface += vec3(0.15) * spec * (1.0 - emissive);

    // Inner glow boost on tap
    float innerGlow = 1.0 - smoothstep(0.0, 0.5, r);
    surface += atmosphereColor * innerGlow * glowBoost * 0.3;

    // Atmosphere ring
    float ring = atmosphere - sphere;
    vec3 finalColor = surface * sphere + atmosphereColor * ring * 0.6;
    float finalAlpha = sphere + ring * 0.5;

    return vec4(finalColor, finalAlpha);
}
`;
