# 「かけあがり」世界観ガイド

旧「Project P」を **かけあがり** にリブランド。本ドキュメントが全ビジュアル判断の最上位リファレンス。以降のプロンプト・コンポーネント設計はこの 4 セクション構造に則る。

---

## 1. 世界観の共通項

- **主題**: 走る少女群像 + ちぎられた紙 + 巨大平仮名タイトル + 煽りコピー散らし
- **層構造（下から上）**:
  1. 背景コラージュ（新聞紙片 + 網点 + 箔 + 色紙）
  2. 人物切抜き（鋸歯マスク、カラー写真、影なし）
  3. 破れ紙ラベル（キャッチコピー、散らし配置、少し回転）
  4. 巨大見出し（平仮名 160〜240pt、ブロック体、1-2 文字だけ色変え）
- **パレット**（5-6 色同居）:
  - オフホワイト `#F5F1E8`
  - スミ黒 `#111111`
  - 赤 `#D41E28`
  - ホットピンク `#ED2B86`
  - ティール `#1CB4AF`
  - 金 `#D4A73E`
- **タイポ**:
  - 見出し: 太ゴシック・ブロック体平仮名、160-240pt、強調 1-2 文字を赤/ピンク
  - ラベル: 太ゴシック黒字 or 赤背景白抜き、短文（10 字以内）
  - 本文: 控えめ、視認用のみ
- **質感**: 網点 + 紙繊維 + 版ズレ + 箔 + コピー紙のムラ。必ずどれかが各画面に存在
- **温度**: 青春・執念・切実・事件性・少し下世話・劇場性

## 2. 必ず残す要素（非交渉）

- [x] 巨大平仮名タイトル（サイト全体は「かけあがり」、各ページは事件/節テーマを同サイズで）
- [x] 破れ紙ラベル化: キャッチコピーは必ず破れた紙背景つき、単体文字でベタ置き禁止
- [x] 人物切抜きの鋸歯エッジ、なめらかな PNG トリミング禁止
- [x] 背景コラージュ: 単色塗り背景禁止、新聞紙片/網点/箔/色紙のいずれかを必ず重ねる
- [x] 網点・版ズレ・紙繊維のどれかが各画面に現れる
- [x] 赤 + ホットピンク + ティールの 2 色以上が同居
- [x] 句点止め・動詞止めの短いコピー（「主役はまだ空席」「虹を架けるのは君だ」等）

## 3. 避ける要素（禁止）

- [ ] ミニマル・余白美・整然グリッド
- [ ] 企業広告・SaaS・スポーツブランド的な洗練
- [ ] ファッション誌の整った組版
- [ ] 3D / CGI / ネオン / グロー / ガラスモーフィズム
- [ ] 未来的・テック
- [ ] 背景が単色ベタで紙片が無いもの
- [ ] なめらかな角丸・ドロップシャドウ
- [ ] グラデーションのみの装飾（必ず紙/網点/テクスチャと併用）
- [ ] メダル絵文字 🥇🥈🥉、円形プロフィール写真
- [ ] アイドル感の前面化（モチーフとして否定はしないが、競争/戦い/熱量を主軸に）

## 4. 再利用できるベースプロンプト

### 画像生成用（nanobanana / Gemini 2.5 Flash Image）

```
Japanese Showa-retro collage poster, tabloid magazine cutout aesthetic,
hand-torn paper layered composition, {{ASPECT_RATIO}} {{RESOLUTION}}.

BACKGROUND LAYER: dense collage of torn newspaper scraps, halftone dot
patches in teal #1CB4AF and hot pink #ED2B86, gold foil glitter fragments,
off-white paper base #F5F1E8, vintage print texture with slight registration
misalignment, visible paper fibers.

SUBJECT LAYER: {{SUBJECT_DESCRIPTION}}, full-color photograph, cut out with
rough hand-torn jagged edges (NOT smooth PNG cutout), high contrast, slight
grain, no shadow.

FOREGROUND LABELS: taglines on torn paper labels scattered across the
composition — {{TAGLINE_LIST}} — each in bold Japanese gothic / block
typography, some black-on-white, some white-on-red, one in white-on-hot-pink,
varied sizes, slight rotation (-5° to +5°), overlapping the subject.

HEADLINE: huge hiragana title "{{HEADLINE}}" in massive black block-gothic,
one or two characters tinted red #D41E28 or hot pink #ED2B86, positioned
{{HEADLINE_POSITION}}, rendered as if printed on torn paper strips.

STYLE: 1980s-90s Japanese weekly magazine 号外 (special issue), movie poster
tension, torn-and-pasted zine feel, unrefined hand-made collage.
Maximalist density, NOT minimalist. NOT clean advertising.
Must feel made by human hands with scissors and glue.

AVOID: rounded corners, drop shadows, clean gradients, 3D, CGI, neon, glass,
minimalism, sports brand look, fashion magazine refinement, corporate feel.

No text errors. No watermarks. No logos.
```

### 差し込み変数

| 変数 | 例 |
|---|---|
| `{{ASPECT_RATIO}}` | `9:16` / `16:9` / `1:1` / `3:4` |
| `{{RESOLUTION}}` | `1080x1920` / `1920x1080` / `1440x1440` / `1200x1600` |
| `{{SUBJECT_DESCRIPTION}}` | `a young Japanese woman in athletic wear, mid-sprint, fierce expression` |
| `{{TAGLINE_LIST}}` | `"主役はまだ空席", "命を賭けて", "全力疾走", "虹を架けるのは君だ"` |
| `{{HEADLINE}}` | `かけあがり` / `首位陥落` / `PIT上げろ` / `衝撃の結末` |
| `{{HEADLINE_POSITION}}` | `top of composition` / `center overlapping subject` / `bottom as torn banner` |

---

## ブランド

- **サービス名**: かけあがり
- **旧名**: Project P（段階的に削除、リダイレクトは別途）
- **ロゴ扱い**: 太ゴシック平仮名「かけあがり」で統一、欧文は補助扱い

## コピー語彙（OK リスト）

かけあがり / 主役 / 陥落 / 首位 / 逆転 / 差し / 逃げ / 捲り / 追走 / 上げる / 落ちる / 粘る / 食らう / 届く / 命を賭けて / 全力疾走 / 虹を架ける / 衝撃 / 激震 / 覚悟 / 執念 / 涙 / 汗

## コピー語彙（NG リスト）

推し / 応援 / 好き / ときめき / ワクワク / かわいい / きらめき / 輝く / 夢 / 絆（どうしてもの時のみ、1 画面で最大 1 回）
