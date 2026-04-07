/**
 * SkSL shader for aurora mesh gradient background.
 * 4 color nodes drift slowly using sin/cos, with FBM noise for organic feel.
 * Colors: #0D1117 (base) → #16213E → #2D1B69 → #4A2080
 */
export const AURORA_SHADER = `
uniform float time;
uniform vec2 resolution;

// Value noise
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

// Fractional Brownian Motion — 4 octaves for organic texture
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

    // Slow time — meditative pace
    float t = time * 0.12;

    // --- Color nodes drifting gently (amplitude ~5-10% of screen) ---
    vec2 p1 = vec2(0.50 + 0.08 * sin(t * 1.1),  0.65 + 0.05 * cos(t * 0.8));
    vec2 p2 = vec2(0.28 + 0.10 * cos(t * 0.9),  0.30 + 0.07 * sin(t * 1.3));
    vec2 p3 = vec2(0.74 + 0.06 * sin(t * 1.5),  0.18 + 0.04 * cos(t * 0.7));
    vec2 p4 = vec2(0.16 + 0.07 * cos(t * 1.0),  0.52 + 0.06 * sin(t * 1.2));

    // --- Colors ---
    vec3 base = vec3(0.051, 0.067, 0.090); // #0D1117 dark navy
    vec3 c1   = vec3(0.086, 0.129, 0.243); // #16213E deep navy
    vec3 c2   = vec3(0.176, 0.106, 0.412); // #2D1B69 purple
    vec3 c3   = vec3(0.290, 0.125, 0.502); // #4A2080 light purple
    vec3 c4   = vec3(0.118, 0.094, 0.286); // #1E1849 indigo accent

    // --- FBM distortion for organic, aurora-like waviness ---
    vec2 q = vec2(
        fbm(uv + vec2(0.0, 0.0) + t * 0.07),
        fbm(uv + vec2(5.2, 1.3) + t * 0.06)
    );
    vec2 r = vec2(
        fbm(uv + 1.0 * q + vec2(1.7, 9.2) + t * 0.05),
        fbm(uv + 1.0 * q + vec2(8.3, 2.8) + t * 0.05)
    );
    vec2 uvd = uv + 0.07 * r;

    // --- Distance-based smooth blending ---
    float d1 = smoothstep(0.70, 0.0, length(uvd - p1));
    float d2 = smoothstep(0.58, 0.0, length(uvd - p2));
    float d3 = smoothstep(0.48, 0.0, length(uvd - p3));
    float d4 = smoothstep(0.54, 0.0, length(uvd - p4));

    vec3 color = base;
    color = mix(color, c1, d1 * 0.78);
    color = mix(color, c2, d2 * 0.68);
    color = mix(color, c3, d3 * 0.55);
    color = mix(color, c4, d4 * 0.48);

    // Subtle radial vignette — keeps edges dark
    float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.85;
    color *= clamp(vignette, 0.0, 1.0);

    return vec4(color, 1.0);
}
`;
