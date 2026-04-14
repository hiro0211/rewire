/**
 * SkSL shader for animated orb gradient sphere.
 * Creates a radial gradient with 3 color nodes that slowly rotate.
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

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);

    // Circular mask — smooth sphere edge
    float sphere = 1.0 - smoothstep(0.38, 0.50, dist);
    if (sphere < 0.01) return vec4(0.0);

    // Slow rotating color nodes
    float t = time * 0.15;
    float angle1 = t * 0.7;
    float angle2 = t * 0.7 + 2.094; // +120 degrees
    float angle3 = t * 0.7 + 4.189; // +240 degrees

    vec2 p1 = center + 0.15 * vec2(cos(angle1), sin(angle1));
    vec2 p2 = center + 0.15 * vec2(cos(angle2), sin(angle2));
    vec2 p3 = center + 0.15 * vec2(cos(angle3), sin(angle3));

    // Noise distortion for organic feel
    float n = noise(uv * 4.0 + time * 0.1) * 0.06;
    vec2 uvd = uv + n;

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

    // Specular highlight
    float highlight = smoothstep(0.22, 0.0, length(uv - vec2(0.42, 0.38)));
    color += vec3(0.15) * highlight;

    return vec4(color * sphere, sphere);
}
`;
