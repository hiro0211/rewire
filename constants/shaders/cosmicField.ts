/**
 * SkSL shader for "cosmic field" orbs — nebulae, clusters, galaxies, deep fields.
 *
 * 惑星シェーダー (PLANET_SHADER) が球体を緯度経度マッピングするのに対し、こちらは
 * 天体ごとに「らしい」立体モーションを付ける（motionMode で 4 分岐）:
 *   0 parallax   — 明るさを奥行きに見立てた 2.5D 視差（星雲・原始星）
 *   1 disk       — 傾けた円盤として自転（銀河・同心リング）
 *   2 sphere     — 球面マッピングで回転（星団・星野・惑星状星雲）※要 tx="repeat"
 *   3 flythrough — 回転せず進むズーム＋視差（ディープフィールド）
 *
 * マスク・輝度キー・ティント・コアグロー・ハロー・glowBoost・premultiplied の
 * エピローグは全モード共通（現状の見た目・タップ演出との一貫性）。
 * FBM ノイズは持ち込まない（実写がディテールを持つため不要）。
 *
 * Child shader: image（正方形センタークロップ済みテクスチャ）
 */
export const COSMIC_FIELD_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform float glowBoost;
uniform vec3 tintColor;
uniform float tintStrength;
uniform float driftSpeed;
uniform float rotationSpeed;
uniform float zoom;
uniform float coreBrightness;
uniform float edgeSoftness;
uniform float motionMode;
uniform float tilt;
uniform float zoomRate;
uniform float zoomMax;
uniform float parallaxStrength;
uniform float swaySpeed;
uniform shader image;

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 p  = (uv - 0.5) * 2.0;          // -1..1
    float r = length(p);

    // 円外は完全に破棄（惑星シェーダーの early-out と同じ規約）
    if (r > 1.0) return vec4(0.0);

    vec2 texCoord;
    float shade = 1.0;   // 立体シェーディング係数（球/円盤の陰影）

    if (motionMode < 0.5) {
        // mode: parallax — 明るさ=奥行きの 2.5D 視差
        vec2 base = clamp((p / zoom) * 0.5 + 0.5, 0.0, 1.0) * resolution;
        vec4 s0 = image.eval(base);
        float depth = dot(s0.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec2 view = vec2(sin(time * swaySpeed), cos(time * swaySpeed)) * parallaxStrength;
        vec2 q = p / zoom - view * depth;   // 明るい所ほど大きくずれる
        q += vec2(sin(time * driftSpeed) * 0.02, cos(time * driftSpeed * 0.7) * 0.02);
        texCoord = clamp(q * 0.5 + 0.5, 0.0, 1.0) * resolution;
    } else if (motionMode < 1.5) {
        // mode: disk — 傾けた円盤の自転
        float ct = max(cos(tilt), 0.35);
        float diskY = p.y / ct;             // 手前へ倒す→Y を引き伸ばして逆投影
        float a = time * rotationSpeed;
        float c = cos(a); float s = sin(a);
        vec2 q = vec2(p.x * c - diskY * s, p.x * s + diskY * c);
        q /= zoom;
        texCoord = clamp(q * 0.5 + 0.5, 0.0, 1.0) * resolution;
        // 手前(下)を明るく、奥(上)を暗く＝奥行き。円盤の外は暗くフェード
        shade = 0.72 + 0.36 * (0.5 - 0.5 * p.y);
        float diskR = length(vec2(p.x, diskY));
        shade *= 1.0 - smoothstep(0.95, 1.15, diskR);
    } else if (motionMode < 2.5) {
        // mode: sphere — 球面マッピングで回転（planetOrb の投影を流用）
        float lat = asin(clamp(p.y / 0.92, -1.0, 1.0));
        float cosLat = cos(lat);
        float lon = asin(clamp(p.x / (0.92 * max(cosLat, 0.001)), -1.0, 1.0));
        lon += time * rotationSpeed;
        texCoord = vec2(
            fract(lon / 6.2832 + 0.5),
            1.0 - (lat / 3.1416 + 0.5)
        ) * resolution;
        float edgeFade = 1.0 - smoothstep(0.1, 0.9, r);
        shade = 0.55 + 0.45 * edgeFade;     // 球の縁を暗く＝立体感
    } else {
        // mode: flythrough — 進むズーム＋視差（回転なし）
        float zf = mix(1.0, zoomMax, 0.5 - 0.5 * cos(time * zoomRate));
        vec2 q = p / zf;
        q += vec2(sin(time * driftSpeed) * 0.03, cos(time * driftSpeed * 0.7) * 0.03);
        texCoord = clamp(q * 0.5 + 0.5, 0.0, 1.0) * resolution;
    }

    vec4 tex = image.eval(texCoord);
    vec3 surface = tex.rgb * shade;

    // ソフト放射状マスク（球ではなく「光る雲」）
    float mask = 1.0 - smoothstep(1.0 - edgeSoftness, 1.0, r);
    mask *= mask;                        // 二乗でリムを溶かす

    // 輝度キー：黒い夜空を透過させる
    float lum = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));
    float key = smoothstep(0.03, 0.32, lum);
    float alpha = mask * mix(0.30, 1.0, key);

    // バッジ glow 色でティント
    vec3 col = mix(surface, surface * tintColor * 1.7, tintStrength);

    // 中心コアの発光
    float core = 1.0 - smoothstep(0.0, 0.45, r);
    col += tintColor * core * coreBrightness * (0.30 + lum * 0.55);

    // 外周ハロー
    float halo = smoothstep(1.0, 0.5, r) * (1.0 - core);
    col += tintColor * halo * 0.14;

    // タップ時ブースト
    col   += tintColor * glowBoost * 0.35 * mask;
    alpha  = clamp(alpha + glowBoost * 0.15 * mask, 0.0, 1.0);

    // premultiplied alpha を返す（PLANET_SHADER と同規約）
    return vec4(col * alpha, alpha);
}
`;
