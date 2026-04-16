/**
 * SkSL shader for animated orb gradient sphere.
 * Creates a radial gradient with 3 color nodes that slowly rotate,
 * FBM-based nebula distortion, atmospheric fringe, and inner glow core.
 * Uniforms: time (seconds), resolution (px), color1/color2/color3 (vec3).
 */
export const ORB_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;

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
        mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// Fractional Brownian Motion — 4 octaves for organic nebula texture
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
    vec2 center = vec2(0.5);
    float dist = length(uv - center);

    // Circular mask — smooth sphere edge (extended for atmosphere)
    float sphere = 1.0 - smoothstep(0.38, 0.50, dist);
    float atmosphere = 1.0 - smoothstep(0.44, 0.56, dist);
    if (atmosphere < 0.01) return vec4(0.0);

    // Slow rotating color nodes
    float t = time * 0.15;
    float angle1 = t * 0.7;
    float angle2 = t * 0.7 + 2.094; // +120 degrees
    float angle3 = t * 0.7 + 4.189; // +240 degrees

    vec2 p1 = center + 0.15 * vec2(cos(angle1), sin(angle1));
    vec2 p2 = center + 0.15 * vec2(cos(angle2), sin(angle2));
    vec2 p3 = center + 0.15 * vec2(cos(angle3), sin(angle3));

    // --- 2-pass FBM for organic nebula-like distortion ---
    vec2 q = vec2(
        fbm(uv * 3.0 + vec2(0.0, 0.0) + t * 0.3),
        fbm(uv * 3.0 + vec2(5.2, 1.3) + t * 0.25)
    );
    vec2 r = vec2(
        fbm(uv * 3.0 + 1.0 * q + vec2(1.7, 9.2) + t * 0.2),
        fbm(uv * 3.0 + 1.0 * q + vec2(8.3, 2.8) + t * 0.2)
    );
    vec2 uvd = uv + 0.12 * (r - 0.5);

    // Distance-based blending
    float d1 = smoothstep(0.45, 0.0, length(uvd - p1));
    float d2 = smoothstep(0.45, 0.0, length(uvd - p2));
    float d3 = smoothstep(0.45, 0.0, length(uvd - p3));

    vec3 color = color1 * d1 + color2 * d2 + color3 * d3;
    float total = d1 + d2 + d3;
    if (total > 0.001) color /= total;

    // Edge darkening for 3D sphere illusion
    float edgeFade = 1.0 - smoothstep(0.2, 0.48, dist);
    color *= (0.6 + 0.4 * edgeFade);

    // Inner glow core — subtle brightening near center
    float innerGlow = 1.0 - smoothstep(0.0, 0.22, dist);
    color += (color1 * 0.5 + color2 * 0.3) * innerGlow * 0.35;

    // Wider specular highlight
    float highlight = smoothstep(0.28, 0.0, length(uv - vec2(0.40, 0.36)));
    color += vec3(0.22) * highlight;

    // --- Atmosphere layer: pale color fringe outside sphere body ---
    float atmosphereRing = atmosphere - sphere;
    vec3 atmoColor = mix(color2, color1, 0.5);
    vec3 finalColor = color * sphere + atmoColor * atmosphereRing * 0.5;
    float finalAlpha = sphere + atmosphereRing * 0.45;

    return vec4(finalColor, finalAlpha);
}
`;
