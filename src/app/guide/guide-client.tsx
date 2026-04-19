"use client";

import { useState } from "react";

type Tab = "overview" | "fan" | "member" | "staff" | "admin";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "全体像", icon: "🏠" },
  { key: "fan", label: "ファン", icon: "🎟️" },
  { key: "member", label: "メンバー", icon: "⭐" },
  { key: "staff", label: "スタッフ", icon: "📱" },
  { key: "admin", label: "運営", icon: "🔧" },
];

// =====================================================================
// 共通パーツ
// =====================================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2
        className="text-xl md:text-2xl font-black text-[#111] mb-4 flex items-center gap-2 border-b-[3px] border-[#111] pb-2"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 mb-3">
      <div
        className="flex w-9 h-9 shrink-0 items-center justify-center bg-[#D41E28] text-white text-base font-black"
        style={{
          fontFamily: "var(--font-outfit)",
          boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
        }}
      >
        {num}
      </div>
      <div>
        <p
          className="text-sm md:text-base font-black text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {title}
        </p>
        <p
          className="text-xs text-[#4A5060] mt-0.5 leading-relaxed"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative bg-[#F5F1E8] border-2 border-[#111] p-4"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
        backgroundSize: "5px 5px",
        boxShadow: "3px 3px 0 rgba(17,17,17,0.16)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h3
          className="text-sm font-black text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {title}
        </h3>
      </div>
      <div
        className="text-xs text-[#4A5060] leading-relaxed"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {children}
      </div>
    </div>
  );
}

function FAQ({
  q,
  a,
}: {
  q: string;
  a: string;
}) {
  return (
    <div className="bg-[#F5F1E8] border-l-4 border-[#D41E28] px-4 py-3 mb-2">
      <p
        className="text-xs md:text-sm font-black text-[#111]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        <span className="text-[#D41E28] mr-1">Q.</span>
        {q}
      </p>
      <p
        className="text-xs text-[#4A5060] mt-1 leading-relaxed"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        <span className="text-[#4A5060] mr-1 font-black">A.</span>
        {a}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <span className="text-[#D41E28] text-lg font-black">↓</span>
    </div>
  );
}

// =====================================================================
// 全体像
// =====================================================================

function OverviewTab() {
  return (
    <div>
      <Section title="🏁 かけあがり とは？">
        <Card icon="✦" title="競争型エンタメプロジェクト">
          <p className="text-sm leading-relaxed text-[#111]">
            かけあがり は、<b className="text-[#D41E28]">12 人のメンバーが数字で競い合い、主役の座を勝ち取る</b>競争型エンタメプロジェクト。
          </p>
          <p className="text-sm leading-relaxed mt-2 text-[#111]">
            毎月の「ステージ」で<b>バズ・配信・収支・主役</b>の 4 指標を競い、上位 6 名が <b>PLAYER</b>（ステージの主役）、
            下位 6 名が <b>PIT</b>（待機組）に振り分けられる。月末の特番で順位が確定し、翌月の編成が決まる。
          </p>
        </Card>
      </Section>

      <Section title="🔄 全体の流れ">
        <Card icon="⤓" title="月のサイクル">
          <div className="space-y-1 mt-2">
            <div className="bg-[#D41E28] text-white px-4 py-2 text-center text-sm font-black">
              ステージ開始（月初）
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs text-[#111]">
              メンバー活動 → バズ・配信・収支のポイント蓄積
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs text-[#111]">
              ファンが順位予想を提出（6 賭式）+ 主役指名
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs text-[#111]">
              ライブイベント開催 → 来場者投票（予想ボーナスで票数 UP）
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs text-[#111]">
              月末特番で最終順位確定 → 予想採点
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs text-[#111]">
              的中者に景品発行（チェキ券・投票ボーナス）
            </div>
            <FlowArrow />
            <div className="bg-[#111] text-[#FFE600] px-4 py-2 text-center text-sm font-black">
              翌月の PLAYER / PIT 決定 → 次のステージへ
            </div>
          </div>
        </Card>
      </Section>

      <Section title="👥 登場人物">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="⭐" title="メンバー（12 名）">
            数字を競い合うプロジェクトの主役。バズ・配信・収支のポイントで順位が決まる。
          </Card>
          <Card icon="🎟️" title="ファン会員">
            順位予想を提出し、的中すると景品がもらえる。ライブ投票にも参加できる。
          </Card>
          <Card icon="📱" title="スタッフ">
            ライブ会場で景品の消込（QR スキャン）を担当。ログイン不要の専用 URL で操作。
          </Card>
          <Card icon="🔧" title="運営">
            ステージ管理・採点・景品発行・イベント作成など、プロジェクト全体を管理。
          </Card>
        </div>
      </Section>

      <Section title="🎯 予想のスコア配分">
        <Card icon="◇" title="6 賭式・最大 63 pt">
          <p
            className="text-xs text-[#4A5060] mb-3"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            全 12 名から 6 種類の賭式で予想。
          </p>
          <div className="space-y-1.5">
            {[
              { name: "複勝", desc: "3 着以内に入る 1 名を予想", pts: 1 },
              { name: "単勝", desc: "1 着を予想", pts: 2 },
              { name: "二連複", desc: "1-2 着の 2 名を順不同で", pts: 5 },
              { name: "二連単", desc: "1-2 着を順番通りに", pts: 10 },
              { name: "三連複", desc: "1-3 着の 3 名を順不同で", pts: 15 },
              { name: "三連単", desc: "1-3 着を順番通りに", pts: 30 },
            ].map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between bg-white border border-[#111]/30 px-3 py-2"
              >
                <div>
                  <span
                    className="text-sm font-black text-[#111]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {b.name}
                  </span>
                  <span className="text-[10px] text-[#4A5060] ml-2">
                    {b.desc}
                  </span>
                </div>
                <span
                  className="text-sm font-black text-[#D41E28] tabular-nums"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  +{b.pts}pt
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}

// =====================================================================
// ファン向け
// =====================================================================

function FanTab() {
  return (
    <div>
      <Section title="どうやって会員になるの？">
        <Step num={1} title="ログインページにアクセス" desc="サイト右上の「会員ログイン」ボタン、または /fan/login にアクセス" />
        <Step num={2} title="メールアドレスを入力" desc="普段使いのメアドを入力して「ログインリンクを送る」をタップ" />
        <Step num={3} title="メールのリンクをタップ" desc="届いたメール内のボタンをタップするとログイン完了。初回は自動で会員登録されます" />
        <Step num={4} title="表示名を設定（任意）" desc="マイページで表示名を設定すると、ランキングに名前が載ります" />
      </Section>

      <Section title="どうやって予想するの？">
        <Step num={1} title="予想ページを開く" desc="ヘッダーの「順位予想」をタップ" />
        <Step num={2} title="6 種類の賭式を選ぶ" desc="複勝・単勝・二連複・二連単・三連複・三連単の各枠にメンバーを配置" />
        <Step num={3} title="提出する" desc="全て埋めたら「予想を提出する →」をタップ。何度でも上書き可能（締切まで）" />
        <div className="bg-[#FFE600] border-l-4 border-[#D41E28] px-4 py-3 mt-3">
          <p
            className="text-xs text-[#111] leading-relaxed font-bold"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            💡 <b>途中で離れても大丈夫！</b> 選んだ内容は自動保存されます。ログイン後にもう一度予想ページを開けば続きから提出できます。
          </p>
        </div>
      </Section>

      <Section title="景品はどうやってもらうの？">
        <Step num={1} title="予想が的中する" desc="ステージ終了後、自動で採点されます。スコアが一定以上なら景品対象" />
        <Step num={2} title="マイページで確認" desc="ヘッダーの「🎟️ マイページ」に赤バッジが出たら景品あり" />
        <Step num={3} title="会場で QR を見せる" desc="マイページに表示される QR コードをスタッフに見せてください" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Card icon="📸" title="チェキ券">スタッフに QR を見せて、その場でチェキがもらえます</Card>
          <Card icon="🗳️" title="投票ボーナス">ライブ投票の時に自動で票数が増えます（手続き不要）</Card>
        </div>
      </Section>

      <Section title="ライブ当日の投票ってどうやるの？">
        <Step num={1} title="会場でコードをもらう" desc="入場時に「PJ-XXXX」と書かれた紙を受け取ります" />
        <Step num={2} title="投票ページでコード入力" desc="スマホで投票ページを開き、4 桁のコードを入力" />
        <Step num={3} title="応援したいメンバーに投票" desc="チケット数ぶん投票できます。同じ人に複数票入れても OK" />
        <div className="bg-[#1CB4AF] text-white border-l-4 border-[#111] px-4 py-3 mt-3">
          <p
            className="text-xs leading-relaxed font-bold"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            🎯 <b>予想ボーナス！</b> ファン会員としてログイン中なら、予想の通算スコアに応じて投票数が 2 倍・3 倍に。さらに投票ボーナス景品を持っていれば追加 +1 倍！
          </p>
        </div>
      </Section>

      <Section title="❓ よくある質問">
        <FAQ q="予想は何回でも変えられるの？" a="締切前なら何度でも上書きできます。締切を過ぎると変更不可です。" />
        <FAQ q="匿名でも予想できる？" a="予想の提出にはファン会員登録（無料）が必要です。メールアドレスだけで登録できます。" />
        <FAQ q="景品に有効期限はある？" a="景品ごとに期限が設定されています。マイページで確認できます。期限切れの景品は使えません。" />
        <FAQ q="退会したい" a="マイページの一番下「退会する」から手続きできます。予想履歴と景品は全て削除されます。" />
      </Section>
    </div>
  );
}

// =====================================================================
// メンバー向け
// =====================================================================

function MemberTab() {
  return (
    <div>
      <Section title="ダッシュボードの見方">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="📊" title="順位 & ポイント">
            現在の順位と合計ポイントが大きく表示されます。上位との差「あと N pts で追いつけます」も確認できます。
          </Card>
          <Card icon="📈" title="ポイント内訳">
            バズ・配信・収支・主役の 4 つの内訳がバーで表示。どこが強くてどこが弱いか一目で分かる。
          </Card>
          <Card icon="🎯" title="ファンの予想">
            ファンの順位予想であなたが選ばれた回数。多いほどファンに期待されています。
          </Card>
          <Card icon="💰" title="収支提出状況">
            提出済み件数と、審査中・却下の件数を表示。「提出履歴 →」から詳細を確認。
          </Card>
        </div>
      </Section>

      <Section title="収支を提出するには？">
        <Step num={1} title="「収支提出」タブを開く" desc="メンバーナビの「収支提出」をタップ" />
        <Step num={2} title="「+ 新規提出」をタップ" desc="カメラまたはアルバムから収支スクショを選択" />
        <Step num={3} title="金額を確認して提出" desc="AI が自動認識した金額を確認し、必要に応じて修正して提出" />
        <Step num={4} title="運営の審査を待つ" desc="承認されるとポイントに反映。却下された場合はメモを確認して再提出" />
      </Section>

      <Section title="パフォーマンス分析">
        <p className="text-xs text-[#4A5060] mb-3">
          「分析」タブでは、自分の詳細なパフォーマンスを確認できます。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="💪" title="強み & 弱み">
            全体平均と比較して、20% 以上上回っている指標が「強み」、下回っている指標が「伸びしろ」として表示されます。
          </Card>
          <Card icon="📈" title="ステージ別推移">
            過去のステージごとの順位・ポイント・内訳を時系列で確認できます。
          </Card>
        </div>
      </Section>

      <Section title="ファンの声">
        <p className="text-xs text-[#4A5060] mb-3">
          「ファンの声」タブでは、ファンからの応援を数字で確認できます。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="🎯" title="予想で選ばれた回数">
            単勝・複勝・二連単など、賭式ごとにファンに選ばれた回数を表示。
          </Card>
          <Card icon="💖" title="ライブ投票の得票数">
            ライブイベントごとの得票数を棒グラフで表示。
          </Card>
        </div>
      </Section>

      <Section title="その他の機能">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="📅" title="スケジュール">
            配信予定・提出期限・ミーティングなどを管理。運営からの全体スケジュールも自動表示されます。
          </Card>
          <Card icon="📢" title="お知らせ">
            運営からのお知らせやフィードバックを受信。未読バッジで通知。
          </Card>
          <Card icon="⚙️" title="設定">
            自己紹介文と SNS リンク（Instagram / X / YouTube / TikTok）を編集できます。公開ページに反映されます。
          </Card>
        </div>
      </Section>
    </div>
  );
}

// =====================================================================
// スタッフ向け
// =====================================================================

function StaffTab() {
  return (
    <div>
      <Section title="景品消込の流れ">
        <Card icon="◐" title="事前準備（運営が行う）">
          運営が「スタッフ用消込 URL」を発行し、スタッフの LINE やメッセージで共有。
          この URL は当日 23:59 まで有効。<b className="text-[#D41E28]">ログイン不要</b>で使える。
        </Card>
        <div className="mb-4" />

        <Step num={1} title="共有された URL を開く" desc="スマホのブラウザで、運営から送られた URL をタップして開きます" />
        <Step num={2} title="「QR コードをスキャン」をタップ" desc="カメラが起動します。カメラへのアクセスを許可してください" />
        <Step num={3} title="ファンの QR をスキャン" desc="ファンのスマホに表示されている QR コードにカメラを向けます" />
        <Step num={4} title="結果を確認して景品を渡す" desc="「✓ 消込OK」と表示名が出れば成功。チェキ券を渡してください" />

        <div className="bg-white border-l-4 border-[#1447E6] px-4 py-3 mt-4">
          <p
            className="text-xs text-[#111] leading-relaxed font-bold"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            💡 <b>手入力もできます。</b> QR が読み取れない場合は、コード（10 文字の英数字）を入力欄に手打ちして「消込」を押してください。
          </p>
        </div>
      </Section>

      <Section title="⚠️ 注意事項">
        <div className="space-y-2">
          <Card icon="🚫" title="二重消込はできません">
            同じコードを 2 回スキャンすると「既に消込済みです」と表示されます。正常な動作です。
          </Card>
          <Card icon="🗳️" title="投票ボーナスは消込不要">
            「投票ボーナス」タイプの景品はライブ投票時に自動で適用されます。スタッフが消込する必要はありません。
          </Card>
          <Card icon="⏰" title="URL の有効期限">
            スタッフ URL は当日限りです。翌日は使えなくなります。新しい URL が必要な場合は運営に連絡してください。
          </Card>
        </div>
      </Section>

      <Section title="❓ トラブルシューティング">
        <FAQ q="カメラが起動しない" a="ブラウザのカメラ許可を確認してください。Safari: 設定 → Safari → カメラ → 許可。Chrome: アドレスバーの鍵マーク → カメラ → 許可。" />
        <FAQ q="「コードが見つかりません」と出る" a="コードの読み取りミスの可能性。ファンにコードの文字列を口頭で確認し、手入力を試してください。" />
        <FAQ q="「トークンの有効期限切れ」と出る" a="スタッフ URL の有効期限が切れています。運営に新しい URL を発行してもらってください。" />
        <FAQ q="同じファンが 2 回来た" a="1 つのコードは 1 回しか使えません。「既に消込済みです」と出たら、既に景品を受け取っています。" />
      </Section>
    </div>
  );
}

// =====================================================================
// 運営向け
// =====================================================================

function AdminTab() {
  return (
    <div>
      <Section title="ステージの運用フロー">
        <Card icon="⤓" title="運用ステップ">
          <div className="space-y-1 mt-2">
            <div className="bg-white border border-[#111] px-4 py-2 text-xs text-[#111]">
              <b className="text-[#D41E28]">1. ステージ作成</b> — /admin/stages → 新規作成。Series 番号・期間・タイトルを設定
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-xs text-[#111]">
              <b className="text-[#D41E28]">2. 予想締切を設定</b> — ステージ編集で「予想締切日時」を特番直前に設定
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-xs text-[#111]">
              <b className="text-[#D41E28]">3. 特番終了後に確定</b> — ステージカードの「確定」ボタン → 自動採点が走る
            </div>
            <FlowArrow />
            <div className="bg-white border border-[#111] px-4 py-2 text-xs text-[#111]">
              <b className="text-[#D41E28]">4. 景品発行</b> — カードの「🎁 景品発行」→ 最低スコアと有効期限を設定 → 発行
            </div>
          </div>
        </Card>
      </Section>

      <Section title="景品発行のやり方">
        <Step num={1} title="景品管理ページを開く" desc="/admin/rewards → 発行タブ" />
        <Step num={2} title="条件を設定" desc="ステージ・景品種別・最低スコアを選択。プリセットボタンで目安を簡単に設定" />
        <Step num={3} title="プレビューで確認" desc="「この条件で発行: N 人」と対象者リストを確認" />
        <Step num={4} title="発行" desc="「N 人へ発行」ボタン。既に同種の景品を発行済みのユーザーはスキップ" />
        <div className="bg-[#FFE600] border-l-4 border-[#D41E28] px-4 py-3 mt-3">
          <p
            className="text-xs text-[#111] leading-relaxed font-bold"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            💡 <b>投票ボーナスはライブ投票時に自動消費されます。</b>スタッフが手動で消込する必要はありません。チェキ券のみスタッフ消込が必要です。
          </p>
        </div>
      </Section>

      <Section title="スタッフ URL の発行">
        <Step num={1} title="消込タブを開く" desc="/admin/rewards → 会場消込タブ" />
        <Step num={2} title="URL を発行" desc="「スタッフ用消込 URL を発行」セクションでラベルを入力 → 発行" />
        <Step num={3} title="スタッフに共有" desc="生成された URL をコピーして LINE やメッセージで共有。当日 23:59 まで有効" />
      </Section>

      <Section title="ライブイベントの準備">
        <Step num={1} title="イベント作成" desc="/admin/events → イベント名・日付・会場・基本投票数を入力" />
        <Step num={2} title="ボーナス段階を設定" desc="予想スコアに応じた倍率を設定（例: 30pt 以上→2 倍、50pt 以上→3 倍）" />
        <Step num={3} title="コード生成" desc="イベント詳細で必要枚数を生成。PJ-XXXX 形式で印刷して配布" />
        <Step num={4} title="イベントを open に" desc="投票受付を開始。終了時は closed に変更" />
      </Section>

      <Section title="メンバー招待">
        <Step num={1} title="メンバー管理を開く" desc="/admin/connect → メンバーをクリック" />
        <Step num={2} title="「メンバーを招待」" desc="メンバーのメールアドレスを入力 → 招待。ダッシュボード用のログインリンクがメールで届く" />
      </Section>

      <Section title="お知らせ配信">
        <Step num={1} title="お知らせ管理を開く" desc="/admin/notifications" />
        <Step num={2} title="送信内容を入力" desc="宛先（全員 or 個別）・カテゴリ・タイトル・本文を入力して送信" />
        <Step num={3} title="スケジュール配信" desc="「スケジュール配信」タブで、全メンバーに配信予定や提出期限を共有" />
      </Section>

      <Section title="不正対策">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card icon="🧱" title="IP クラスタ検知">
            /admin/anomalies で同一 IP からの複数登録を検出。flag/ban で対応。
          </Card>
          <Card icon="🔥" title="レート制限">
            magic link の送信は 1 時間あたり 4 通/メール、8 通/IP に制限済み。
          </Card>
          <Card icon="🎁" title="景品除外">
            banned/flagged のファンは景品発行対象から自動除外されます。
          </Card>
          <Card icon="📋" title="監査ログ">
            全ての景品発行・消込・ステージ操作が audit_log に記録されます。
          </Card>
        </div>
      </Section>
    </div>
  );
}

// =====================================================================
// メイン
// =====================================================================

export function GuideClient() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-4 pt-12 md:pt-16 pb-8">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="inline-block w-2 h-2 bg-[#D41E28]" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ HOW TO PLAY
          </p>
          <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
        </div>
        <h1
          className="text-3xl md:text-5xl font-black leading-tight text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          かけあがり ガイド
        </h1>
        <div className="mt-5 max-w-2xl">
          <p
            className="text-lg md:text-2xl font-black leading-relaxed text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <span
              className="relative inline-block px-1"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, #FFE600 60%)",
              }}
            >
              ファン、メンバー、スタッフ、運営。
            </span>
            <br />
            君の役割ごとの遊び方を、ここに。
          </p>
          <div
            className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-[1100px] px-4 mb-8">
        <div className="flex flex-wrap gap-0 border-b-[3px] border-[#111]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-black tracking-wider border-2 border-b-0 -mb-[3px] transition-colors ${
                tab === t.key
                  ? "bg-[#111] text-[#FFE600] border-[#111]"
                  : "bg-[#F5F1E8] border-[#111] text-[#4A5060] hover:bg-white"
              }`}
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-4">
        {tab === "overview" && <OverviewTab />}
        {tab === "fan" && <FanTab />}
        {tab === "member" && <MemberTab />}
        {tab === "staff" && <StaffTab />}
        {tab === "admin" && <AdminTab />}
      </section>
    </div>
  );
}
