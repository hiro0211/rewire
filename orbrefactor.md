オーブUIリファクタリング — ターゲットUI再現 + コード重複解消                        │
│                                                                                     │
│ Context                                                                             │
│                                                                                     │
│ ターゲットのスクリーンショットでは、オーブの背後に大きく滑らかなハロー（後光）と周  │
│ 囲に散らばる星パーティクルが見える。現在のAnimatedOrbからはこれら2つのコンポーネン  │
│ ト（OrbSoftAura, OrbScatteredStars）が削除されており、ターゲットUIと乖離がある。    │
│                                                                                     │
│ 同時に、AnimatedOrb / BadgeOrb / StaticOrb 間で hexToVec3() と                      │
│ Skia初期化ブロックが3重複しているため、リファクタリングで解消する。                 │
│                                                                                     │
│ ターゲットUI vs 現在のコードの差分                                                  │
│                                                                                     │
│ ┌──────────────────────────┬────────────────────────┬─────────────────┬─────────┐   │
│ │           要素           │       ターゲット       │  現在のコード   │  対応   │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ コアオーブ（Skiaシェーダ │ 滑らかなFBMプラズマ    │ ✅ 実装済み     │ そのま  │   │
│ │ ー）                     │                        │                 │ ま      │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ 内側グロー + 外側ハロー  │ SVGグラデーション      │ ✅              │ そのま  │   │
│ │                          │                        │ OrbGlowLayers   │ ま      │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ 大きな淡いハロー         │ オーブの背後に~2x      │ ❌ 削除済み     │ 再作成  │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ 散布星パーティクル       │ 周囲に散らばる白い点   │ ❌ 削除済み     │ 再作成  │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ 軌道パーティクル         │ 小さな周回点           │ ✅ OrbParticles │ そのま  │   │
│ │                          │                        │                 │ ま      │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ タップ（弾性バウンス）   │ スナッピーな縮小→弾性  │ ✅ useOrbTapAni │ そのま  │   │
│ │                          │ 戻り                   │ mation          │ ま      │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ タップ（グロー強化）     │ 中心発光がシェーダーで │ ✅ glowBoost    │ そのま  │   │
│ │                          │ 強化                   │ uniform         │ ま      │   │
│ ├──────────────────────────┼────────────────────────┼─────────────────┼─────────┤   │
│ │ タップ（波紋）           │ 外側に広がるリング     │ ✅ OrbTapRipple │ そのま  │   │
│ │                          │                        │                 │ ま      │   │
│ └──────────────────────────┴────────────────────────┴─────────────────┴─────────┘   │
│                                                                                     │
│ 変更計画                                                                            │
│                                                                                     │
│ Part A: ターゲットUI再現（2ファイル新規作成 + AnimatedOrb修正）                     │
│                                                                                     │
│ A1. components/dashboard/OrbSoftAura.tsx — SVGラジアルグラデーションで再作成        │
│                                                                                     │
│ 前の実装はiOS shadow + ソリッドカラー円だったが、OrbGlowLayersと同様にSVG           │
│ RadialGradientを使い、クロスプラットフォームで滑らかなフォールオフを実現する。      │
│                                                                                     │
│ - サイズ: size * 2.0（コンテナに収まる）                                            │
│ - 単一のSVG RadialGradient：中心 glowColor（opacity 0.3）→ 外周 opacity 0           │
│ - リムリングなし、border なし — 完全にソフトなエッジ                                │
│ - pointerEvents="none"                                                              │
│                                                                                     │
│ A2. components/dashboard/OrbScatteredStars.tsx — 散布星パーティクルを再作成         │
│                                                                                     │
│ OrbParticles（軌道周回）とは異なり、ランダムな固定位置で瞬く白い点。                │
│                                                                                     │
│ - 8-12個の白い点をコンテナ内にランダム配置（useMemoで位置固定）                     │
│ - 各点がopacity 0.2↔0.8 で独立してtwinkle（withRepeat + Easing.sin）                │
│ - サイズ: size * 2.0（コンテナに収まる）                                            │
│ - pointerEvents="none"                                                              │
│                                                                                     │
│ A3. components/dashboard/AnimatedOrb.tsx — OrbSoftAura + OrbScatteredStars を再追加 │
│                                                                                     │
│ レイヤー順序（背面→前面）:                                                          │
│ 0. OrbSoftAura（最背面 — 大きな淡いハロー）                                         │
│ 1. OrbGlowLayers（内側グロー + 外側ハロー + パルスリング）                          │
│ 2. OrbScatteredStars（散布星）                                                      │
│ 3. OrbParticles（軌道周回パーティクル）                                             │
│ 4. Core orb（Skiaシェーダー / fallback）                                            │
│ 5. OrbTapRipple（タップ波紋）                                                       │
│                                                                                     │
│ Part B: コード重複解消（3ファイル新規作成 + 3ファイル修正）                         │
│                                                                                     │
│ B1. lib/color/hexToVec3.ts — hexToVec3 関数を抽出                                   │
│                                                                                     │
│ 3ファイル（AnimatedOrb, StaticOrb, BadgeOrb）の同一関数を1箇所に統一。              │
│ 既存の lib/color/ ディレクトリに配置。                                              │
│                                                                                     │
│ B2. lib/dashboard/skiaOrbInit.ts — Skia初期化ブロックを抽出                         │
│                                                                                     │
│ 3ファイルの同一モジュールレベル初期化を1箇所に。                                    │
│ 既存の isExpoGo（lib/nativeGuard.ts）を再利用。                                     │
│                                                                                     │
│ B3. hooks/dashboard/useOrbBreathing.ts — 呼吸アニメーションhookを抽出               │
│                                                                                     │
│ AnimatedOrbとBadgeOrb/UnlockedBadgeOrbの重複ロジックを統一:                         │
│ - 呼吸パルス（useSharedValue + withRepeat）                                         │
│ - AppStateリスナー（バックグラウンド時停止）                                        │
│ - useFrameCallback（シェーダーtime進行）                                            │
│ - 返り値: { time, breathingScale, pulseStyle }                                      │
│                                                                                     │
│ AnimatedOrbでは breathingScale * tapScale で合成。BadgeOrbでは pulseStyle           │
│ をそのまま使用。                                                                    │
│                                                                                     │
│ B4. glowIntensity プロップバグ修正                                                  │
│                                                                                     │
│ AnimatedOrbがOrbGlowLayersに glowIntensity={glowIntensity}                          │
│ を渡しているが、interfaceに存在しないデッドコード。削除する。                       │
│                                                                                     │
│ 変更ファイル一覧                                                                    │
│                                                                                     │
│ 新規作成（6ソース + 5テスト = 11ファイル）                                          │
│                                                                                     │
│ - components/dashboard/OrbSoftAura.tsx (~40行)                                      │
│ - components/dashboard/OrbScatteredStars.tsx (~70行)                                │
│ - lib/color/hexToVec3.ts (~8行)                                                     │
│ - lib/dashboard/skiaOrbInit.ts (~20行)                                              │
│ - hooks/dashboard/useOrbBreathing.ts (~45行)                                        │
│ - テストファイル: 上記5つそれぞれの __tests__/ 配下                                 │
│                                                                                     │
│ 修正（3ファイル）                                                                   │
│                                                                                     │
│ - components/dashboard/AnimatedOrb.tsx — OrbSoftAura/OrbScatteredStars再追加 +      │
│ hexToVec3/Skia init/呼吸ロジック抽出 + glowIntensityバグ修正（218行→~130行）        │
│ - components/dashboard/StaticOrb.tsx — hexToVec3/Skia init抽出（102行→~80行）       │
│ - components/achievements/BadgeOrb.tsx — hexToVec3/Skia                             │
│ init/呼吸ロジック抽出（266行→~170行）                                               │
│                                                                                     │
│ 変更なし                                                                            │
│                                                                                     │
│ - OrbGlowLayers.tsx — SVG RadialGradientによるグロー、そのまま                      │
│ - OrbTapRipple.tsx — タップ波紋、そのまま                                           │
│ - OrbParticles.tsx — 軌道パーティクル、そのまま                                     │
│ - useOrbTapAnimation.ts — タップハンドラー、そのまま                                │
│ - constants/shaders/orb.ts — FBMシェーダー、そのまま                                │
│ - constants/orbConfig.ts — 色設定、そのまま                                         │
│                                                                                     │
│ TDD手順                                                                             │
│                                                                                     │
│ Step 1: hexToVec3 抽出                                                              │
│                                                                                     │
│ Red: lib/color/__tests__/hexToVec3.test.ts（#FF0000→[1,0,0]等）                     │
│ Green: lib/color/hexToVec3.ts 実装                                                  │
│ Refactor: 3ファイルのローカル関数削除、import差し替え → npm test                    │
│                                                                                     │
│ Step 2: skiaOrbInit 抽出                                                            │
│                                                                                     │
│ Red: lib/dashboard/__tests__/skiaOrbInit.test.ts（ExpoGoでnull等）                  │
│ Green: lib/dashboard/skiaOrbInit.ts 実装                                            │
│ Refactor: 3ファイルのSkia initブロック削除 → npm test                               │
│                                                                                     │
│ Step 3: useOrbBreathing 抽出                                                        │
│                                                                                     │
│ Red: hooks/dashboard/__tests__/useOrbBreathing.test.ts                              │
│ Green: hooks/dashboard/useOrbBreathing.ts 実装                                      │
│ Refactor: AnimatedOrb + BadgeOrb書き換え → npm test                                 │
│                                                                                     │
│ Step 4: OrbSoftAura 再作成                                                          │
│                                                                                     │
│ Red: components/dashboard/__tests__/OrbSoftAura.test.tsx（SVG                       │
│ RadialGradient存在確認等）                                                          │
│ Green: components/dashboard/OrbSoftAura.tsx 実装                                    │
│ Refactor: AnimatedOrbに追加 → npm test                                              │
│                                                                                     │
│ Step 5: OrbScatteredStars 再作成                                                    │
│                                                                                     │
│ Red: components/dashboard/__tests__/OrbScatteredStars.test.tsx                      │
│ Green: components/dashboard/OrbScatteredStars.tsx 実装                              │
│ Refactor: AnimatedOrbに追加 → npm test                                              │
│                                                                                     │
│ Step 6: glowIntensity バグ修正 + 最終確認                                           │
│                                                                                     │
│ AnimatedOrbからデッドプロップ削除 → npm test → npm run lint                         │
│                                                                                     │
│ 検証                                                                                │
│                                                                                     │
│ npm test                                                                            │
│ npm run lint                                                                        │
│                                                                                     │
│ dev clientでの視覚確認:                                                             │
│ - オーブの背後に大きく滑らかなハロー（ターゲットスクリーンショットと一致）          │
│ - 周囲に散らばる星がゆっくり瞬いている                                              │
│ - タップで弾性バウンス + グロー強化 + 波紋が正常動作                                │
│ - 2Dリング感がなく、滑らかな3D球体に見える            