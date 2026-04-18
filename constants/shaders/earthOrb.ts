/**
 * SkSL shader for Earth orb with texture sampling.
 * Uses child ImageShader bound as `uniform shader image` for equirectangular
 * texture mapping onto a sphere with procedural clouds, atmosphere, and specular.
 * Uniforms: time (seconds), resolution (px), glowBoost (0-1).
 * Child shader: image (equirectangular earth texture via ImageShader).
 */
export const EARTH_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform float glowBoost;
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
        mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
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

    // Sphere mask
    float sphere = 1.0 - smoothstep(0.88, 0.92, r);
    float atmosphere = 1.0 - smoothstep(0.88, 1.0, r);
    if (atmosphere < 0.01) return vec4(0.0);

    // Spherical UV projection (equirectangular -> orthographic)
    float lat = asin(clamp(centered.y / 0.9, -1.0, 1.0));
    float cosLat = cos(lat);
    float sinLon = clamp(centered.x / (0.9 * max(cosLat, 0.001)), -1.0, 1.0);
    float lon = asin(sinLon);

    // Rotation animation
    lon += time * 0.08;

    // Texture coordinates (equirectangular mapping)
    vec2 texCoord = vec2(
        fract(lon / 6.2832 + 0.5),
        1.0 - (lat / 3.1416 + 0.5)
    ) * resolution;
    vec4 earthColor = image.eval(texCoord);

    // Procedural cloud layer
    vec2 cloudUV = vec2(lon * 2.0 + time * 0.03, lat * 3.0);
    float cloud = fbm(cloudUV);
    cloud = smoothstep(0.52, 0.7, cloud) * 0.35;
    vec3 surface = mix(earthColor.rgb, vec3(1.0), cloud);

    // Edge darkening (3D sphere illusion)
    float edgeFade = 1.0 - smoothstep(0.1, 0.85, r);
    surface *= (0.55 + 0.45 * edgeFade);

    // Specular highlight (sun from upper-left)
    float spec = smoothstep(0.5, 0.0, length(centered - vec2(-0.2, -0.25)));
    surface += vec3(0.15) * spec;

    // Inner glow boost on tap
    float innerGlow = 1.0 - smoothstep(0.0, 0.5, r);
    surface += vec3(0.35, 0.65, 1.0) * innerGlow * glowBoost * 0.3;

    // Atmosphere ring
    float ring = atmosphere - sphere;
    vec3 atmoColor = vec3(0.35, 0.65, 1.0);

    vec3 finalColor = surface * sphere + atmoColor * ring * 0.6;
    float finalAlpha = sphere + ring * 0.5;

    return vec4(finalColor, finalAlpha);
}
`;
