# Figma Make に「そのまま貼る」1 メッセージ

以下のブロックをすべて選択してコピーし、**Figma Make の新規プロジェクトの最初のメッセージ**として貼り付ける。既存プロジェクトに追記するのではなく、必ず新規で始めること。既存への追記だと構造が上書きされない。

---

```
CRITICAL CONTEXT:
This is NOT a dashboard, admin panel, or standard web app UI.
This is a hybrid of (a) Japanese sports newspaper front pages like Tokyo Sports,
(b) 1960s-70s Tadanori Yokoo silkscreen posters (red-black, mis-registration, photographic cutouts on flat color),
(c) Saul Bass film poster geometry.
If your output looks like a typical SaaS dashboard, you have failed.

BUILD: Top page of "Project P" — a monthly competition site where 12 members race in buzz/streaming/revenue stats.

CANVAS:
- Desktop 1440px wide
- Background #F5F1E8 (newsprint beige)
- Text #111111 (ink black)
- Accent red #D41E28
- Accent yellow #FFE600
- Accent blue #1447E6
- Japanese display font: Noto Serif JP Bold or similar mincho-bold
- Latin display font: Anton or Unbounded Black
- Numbers: Space Grotesk Bold (tabular-nums)

LAYOUT (top to bottom, use these exact specs):

1. HEADER (y:0, h:56):
   Left: ink-stamp logo mark (red filled square 20×20 rotated -4° with white "P" inside) + text "PROJECT P" 18pt black, 12px gap.
   Right: "マイページ" text link 14pt.
   Border-bottom 1px black.

2. STAGE TIMELINE BAR (y:56, h:48):
   4 equal-width nodes spaced across viewport.
   Nodes 1 and 2: filled black circles Ø10.
   Node 3: red #D41E28 circle Ø14 with outer ring (CURRENT).
   Node 4: empty black circle Ø10.
   Horizontal 1px black rule through all nodes.
   Border-bottom 1px black.

3. HERO AREA (y:104, h:640) — TWO COLUMNS:

   LEFT COLUMN (x:0 to x:560, w:560, h:640):
   - Monochrome black-and-white portrait photo, cropped tightly to subject, 400×640px, positioned at x:40.
   - No circular crop. Rectangular only.
   - Red band #D41E28 at opacity 75%, width 600px height 80px, rotated -12°, passing diagonally across the portrait from upper-left to lower-right.
   - Huge number "01" in white, Space Grotesk Bold 280pt, positioned bottom-right of portrait, with mix-blend-mode: difference so it carves into the photo.

   RIGHT COLUMN (x:580 to x:1400, w:820, h:640):
   - At top-right (x:1260, y:120), a RED SQUARE STAMP: 140×140px, filled #D41E28, rotated -6°. Inside the stamp, Japanese text "激震" in white, 72pt mincho-bold, centered. This must look like an ink hanko pressed onto paper. Add slight roughness to edges if possible.
   - Headline line 1: Japanese "首位、" 96pt bold mincho, color #111111, positioned at (x:580, y:260).
   - Headline line 2: Japanese "陥落。" 120pt bold mincho, color #111111, positioned at (x:680, y:380) — offset 100px right from line 1.
   - Under headline line 2, PLACE A DUPLICATE of "陥落。" in RED #D41E28 at opacity 70%, offset 4px right and 4px down, BEHIND the black version. This creates a 2-color mis-registration effect.
   - (Optional: a third copy in blue #1447E6 offset 2px further, opacity 40%, behind both.)
   - Sub-text below at (x:580, y:500): "3時間前、塩見きら が 阿久津真央 に首位を譲渡。差はわずか 8pt。" 18pt regular, color #111111.
   - Draw a hand-drawn-looking red oval around the "8pt" portion — freehand ellipse, stroke 2.5px red #D41E28, opacity 85%. Must look hand-drawn, not geometric.
   - Date "2026年4月17日（木）" 14pt gray at (x:1260, y:440).
   - Under date: "第 12 節 / 終盤" 28pt bold at (x:1260, y:470). The "12" should be larger (40pt).
   - Below: small red filled badge "速報 GRADE S" 12pt white text, padding 8px 12px.

   BOTTOM OF HERO: 6px solid red #D41E28 horizontal rule full viewport width.

4. ONOMATOPOEIA BAND (y:750, h:120):
   FULL VIEWPORT WIDTH solid black #111111 band.
   Center: Japanese text "激闘。" 120pt bold mincho, color white.
   Left edge (x:40): 6 small squares in a row representing boat colors — white #F5F5F0, black #1A1A1A, red #D41E28, blue #1E4BC8, yellow #F2C81B, green #0F8F4A — each 14×14px with 4px gap.
   Right edge (x:1280): "STAGE 12 · DAY 07" 12pt gray.

5. SECTION HEADING (y:910, h:80):
   At (x:40, y:930): vertical bar 6×48 solid red, then text "本日の出走" 44pt bold mincho black, 20px gap.

6. RACE LIST (y:1040, each row 110px tall, total 12 rows):
   Each row left-to-right:
   - (x:40, w:50): jersey number "01"-"12" in Space Grotesk Bold 14pt gray, with thin black 1px border around it
   - (x:100, w:50): boat plate 36×36 — color-only square. Row 1 white with 1px black border, Row 2 solid black, Row 3 solid red, Row 4 solid blue, Row 5 solid yellow, Row 6 solid green. Rows 7-12: gray #4A5060 with small white "P" text.
   - (x:170, w:80): square 64×64 black-and-white portrait photo, no rounding.
   - (x:270, w:100): huge rank number "1"-"12" in Space Grotesk Bold 56pt, and a small trend indicator next to it: green ▲ with number if up, red ▼ if down, gray − if flat.
   - (x:380, w:180): Japanese name 20pt bold + small "PLAYER" or "PIT" pill 10px tall.
   - (x:580, w:220): THREE HORIZONTAL SCORE BARS stacked vertically. Each bar: w:140 h:5, bg gray #E0DCC8, fill with respective color (バズ=cyan #00BCFF, 配信=blue #1447E6, 収支=purple #7A3DFF). Next to each bar, right-aligned: numeric value 11pt Space Grotesk Bold. Label to the left of each bar: "バズ" "配信" "収支" 10pt gray.
   - (x:820, w:120): total points in Space Grotesk Bold 32pt, label "pt" 12pt gray below.
   - (x:960, w:180): recent activity text "3時間前 バズ +42" 11pt gray.
   - (x:1160, w:60): text link "詳細 →" 14pt red #D41E28.
   Row divider: 1px horizontal rule #D5CFC0 between rows. NO rounded corners. NO drop shadows.

7. PASS LINE (between row 6 and row 7):
   Full-width red band #D41E28, height 36px.
   Centered white text: "— PASS LINE · 6位以上が PLAYER —" 14pt bold.

8. FOOTER (after row 12, +80px gap):
   Full-width black #111111 band, h:200.
   Centered: 6 boat color squares + "PROJECT P" logo + small text links + timestamp.

ABSOLUTE REQUIREMENTS (non-negotiable):
- The left-column full-height portrait with red diagonal band and giant "01" overlaid MUST exist. Do not skip.
- The rotated red "激震" stamp MUST exist. Do not convert it into a rectangular badge. It must be rotated and look like an ink hanko.
- The 2-or-3-color mis-registration on the "陥落。" text MUST exist.
- The full-width black onomatopoeia band with white "激闘。" MUST exist.
- The three-bar score display per row MUST exist. Do not simplify to a single bar.
- Hand-drawn red oval around "8pt" MUST exist.

ABSOLUTE FORBIDDEN:
- NO rounded corners anywhere (except jersey numbers 2px max)
- NO drop shadows
- NO gradients
- NO gold color, NO pastels
- NO circular photo crops
- NO emoji medals 🥇🥈🥉
- NO "dashboard" aesthetic
- DO NOT center everything; use asymmetric layouts
- DO NOT make the portrait photo small; it must be floor-to-ceiling on the left
- DO NOT skip the ink stamp because it "looks unusual" — it is intentional

MOOD REFERENCES (search these if needed): Tadanori Yokoo 1965 "Made in Japan having reached a climax at 29", Tadanori Yokoo "Koshimaki-Osen", Tokyo Sports newspaper front page, Saul Bass "Anatomy of a Murder".
```

---

## 使い方

1. **Figma Make で新規プロジェクト**を作る（既存プロジェクトに追記しない）
2. 上記コードブロック内を全選択コピー
3. 最初のメッセージとして貼る
4. 生成を待つ
5. 出力を確認し、MUST が抜けている要素があれば **1 個ずつ個別指示**で追加:
   - 「左側の縦長人物写真がない。幅 400px、高さ 640px、白黒、赤い斜め帯が -12° で貫通した状態で追加して」
   - 「大見出し『陥落。』の背景に赤い版ズレがない。同じ文字を赤 #D41E28 で 4px 右下にズラして opacity 70% で重ねて」
   - 「右上に赤正方スタンプ（140×140、-6° 回転、白文字『激震』）を追加。朱肉判子のように見せて」

各個別指示も参照作品名を毎回添えると精度が上がる:
- 「Tadanori Yokoo のポスターのような版ズレ」
- 「東スポ一面のような凸版見出し」
- 「朱肉判子のような赤スタンプ」

## なぜ「新規プロジェクト」なのか

Figma Make は既存の React コードに差分で追記する。既存コードに「縦長写真のスロット」が無い場合、新プロンプトで指示しても追加されにくい（AI が既存レイアウトを守ろうとする）。

新規なら**白紙から全指示を解釈**するので、構造ごと作れる。どうしても既存に乗せたい場合は「**完全に再構築して。既存レイアウトは無視して**」の一文を冒頭に追加。
