"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members } from "@/lib/data";

type Section =
  | "cool"
  | "members"
  | "points"
  | "youtube"
  | "live"
  | "checkin"
  | "votes"
  | "special"
  | "formation"
  | "rewards";

const sidebarItems: { key: Section; icon: string; label: string }[] = [
  { key: "cool", icon: "📅", label: "クール作成" },
  { key: "members", icon: "👥", label: "メンバー管理" },
  { key: "points", icon: "📊", label: "ポイント更新" },
  { key: "youtube", icon: "📺", label: "YouTube追跡" },
  { key: "live", icon: "🎤", label: "ライブ作成" },
  { key: "checkin", icon: "✅", label: "チェックイン管理" },
  { key: "votes", icon: "🗳️", label: "応援投票集計" },
  { key: "special", icon: "🎬", label: "月末特番結果" },
  { key: "formation", icon: "⚡", label: "PLAYER/PIT確定" },
  { key: "rewards", icon: "🎁", label: "特典管理" },
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-muted mb-1">{children}</label>;
}

function Input({ defaultValue = "", placeholder = "" }: { defaultValue?: string; placeholder?: string }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
    />
  );
}

function SaveButton({ label = "保存" }: { label?: string }) {
  return (
    <button
      onClick={() => alert(`${label}しました（デモ）`)}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
    >
      💾 {label}
    </button>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-5">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function CoolSection() {
  return (
    <SectionCard title="クール管理" icon="📅">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-base font-bold text-foreground">2026年4月クール</p>
            <p className="text-xs text-muted">開催中</p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-primary to-primary-cyan px-3 py-1 text-[11px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
            進行中
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>クール名</Label><Input defaultValue="2026年4月クール" /></div>
          <div><Label>予想締切</Label><Input placeholder="2026-04-25 23:59" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>月末特番日時</Label><Input placeholder="2026-04-30 19:00" /></div>
          <div>
            <Label>ステータス</Label>
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
              <option>予想受付中</option>
              <option>進行中</option>
              <option>特番待ち</option>
              <option>終了</option>
            </select>
          </div>
        </div>
        <SaveButton />
      </div>
    </SectionCard>
  );
}

function MembersSection() {
  return (
    <SectionCard title="メンバー管理" icon="👥">
      <div className="rounded-2xl bg-white/70 border border-white/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 text-xs font-bold text-muted">#</th>
              <th className="px-4 py-3 text-xs font-bold text-muted">メンバー</th>
              <th className="px-4 py-3 text-xs font-bold text-muted">ロール</th>
              <th className="px-4 py-3 text-xs font-bold text-muted text-right">ポイント</th>
              <th className="px-4 py-3 text-xs font-bold text-muted text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                <td className="px-4 py-2.5 font-[family-name:var(--font-outfit)] text-xs font-bold text-[#0092b8]">
                  {m.rank}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Image src={m.avatarUrl} alt={m.name} width={28} height={28} className="size-7 rounded-full object-cover object-top" />
                    <span className="font-bold text-foreground">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                    m.role === "PLAYER" ? "bg-gradient-to-r from-player to-player-end" : "bg-gradient-to-r from-pit to-pit-end"
                  }`}>{m.role}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-[family-name:var(--font-outfit)] font-bold">{m.points.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right">
                  <button className="text-xs text-primary-dark hover:underline">編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function PointsSection() {
  return (
    <SectionCard title="ポイント更新" icon="📊">
      <div className="rounded-2xl bg-white/70 border border-white/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 text-xs font-bold text-muted">メンバー</th>
              <th className="px-4 py-3 text-xs font-bold text-muted">バズ</th>
              <th className="px-4 py-3 text-xs font-bold text-muted">同接</th>
              <th className="px-4 py-3 text-xs font-bold text-muted">収支</th>
            </tr>
          </thead>
          <tbody>
            {members.slice(0, 6).map((m) => (
              <tr key={m.id} className="border-b border-gray-50">
                <td className="px-4 py-2.5 font-bold text-foreground">{m.name}</td>
                <td className="px-4 py-2"><input type="number" defaultValue={m.detail.stats.buzz} className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center focus:border-primary focus:outline-none" /></td>
                <td className="px-4 py-2"><input type="number" defaultValue={m.detail.stats.concurrent} className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center focus:border-primary focus:outline-none" /></td>
                <td className="px-4 py-2"><input type="number" defaultValue={m.detail.stats.revenue} className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center focus:border-primary focus:outline-none" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs text-muted">※ 上位6名のみ表示（デモ）</div>
      </div>
      <div className="mt-4"><SaveButton label="ポイント一括更新" /></div>
    </SectionCard>
  );
}

function YoutubeSection() {
  const tracks = [
    { title: "【生配信】4月ランキング中間発表", url: "https://youtube.com/watch?v=xxx1", status: "追跡中" },
    { title: "【MV】塩見きら - 新曲", url: "https://youtube.com/watch?v=xxx2", status: "追跡中" },
    { title: "【コラボ】清宮みゆ × ねこみ。", url: "https://youtube.com/watch?v=xxx3", status: "完了" },
  ];
  return (
    <SectionCard title="YouTube追跡対象" icon="📺">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm space-y-3">
        {tracks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{t.title}</p>
              <p className="text-xs text-muted truncate">{t.url}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider font-[family-name:var(--font-outfit)] ${
              t.status === "追跡中" ? "bg-[#d0fae5] text-[#007a55]" : "bg-gray-100 text-muted"
            }`}>{t.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm space-y-3">
        <Label>新規追跡URLを追加</Label>
        <div className="flex gap-2">
          <Input placeholder="https://youtube.com/watch?v=..." />
          <button className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-sm font-bold text-white">追加</button>
        </div>
      </div>
    </SectionCard>
  );
}

function LiveSection() {
  return (
    <SectionCard title="ライブ作成" icon="🎤">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>公演名</Label><Input defaultValue="SPACE ODD お披露目ライブ" /></div>
          <div><Label>会場</Label><Input defaultValue="SPACE ODD" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>開催日</Label><Input defaultValue="2026-04-29" /></div>
          <div><Label>投票開始</Label><Input defaultValue="15:00" /></div>
          <div><Label>投票終了</Label><Input defaultValue="21:00" /></div>
        </div>
        <SaveButton label="ライブを作成" />
      </div>
    </SectionCard>
  );
}

function CheckinSection() {
  return (
    <SectionCard title="チェックイン管理" icon="✅">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm text-center">
          <p className="font-[family-name:var(--font-outfit)] text-3xl font-black text-primary-dark">342</p>
          <p className="text-xs text-muted mt-1">チェックイン済み</p>
        </div>
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm text-center">
          <p className="font-[family-name:var(--font-outfit)] text-3xl font-black text-[#007a55]">298</p>
          <p className="text-xs text-muted mt-1">投票完了</p>
        </div>
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm text-center">
          <p className="font-[family-name:var(--font-outfit)] text-3xl font-black text-pit">87%</p>
          <p className="text-xs text-muted mt-1">投票率</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-5 py-4 text-center">
        <p className="text-sm font-bold text-primary-dark">🟢 チェックイン受付中 — SPACE ODD お披露目ライブ</p>
      </div>
    </SectionCard>
  );
}

function VotesSection() {
  const results = members.slice(0, 6).map((m, i) => ({ ...m, votes: [120, 98, 87, 72, 65, 53][i] }));
  return (
    <SectionCard title="応援投票集計" icon="🗳️">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        <p className="text-xs font-bold text-muted mb-3 font-[family-name:var(--font-outfit)]">PLAYER 部門（当日投票）</p>
        {results.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <Image src={m.avatarUrl} alt={m.name} width={28} height={28} className="size-7 rounded-full object-cover object-top" />
            <span className="flex-1 text-sm font-bold text-foreground">{m.name}</span>
            <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-blue" style={{ width: `${(m.votes / 120) * 100}%` }} />
            </div>
            <span className="w-10 text-right font-[family-name:var(--font-outfit)] text-sm font-bold text-foreground">{m.votes}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SpecialSection() {
  return (
    <SectionCard title="月末特番結果入力" icon="🎬">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-gradient-to-r from-pit to-pit-end px-3 py-1 text-[10px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">未反映</span>
          <span className="text-sm text-muted">特番結果を入力してください</span>
        </div>
        {members.slice(0, 6).map((m, i) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="w-8 font-[family-name:var(--font-outfit)] text-sm font-bold text-muted">{i + 1}位</span>
            <select className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option>{m.name}</option>
              {members.filter((x) => x.id !== m.id).map((x) => <option key={x.id}>{x.name}</option>)}
            </select>
          </div>
        ))}
        <p className="text-xs text-muted">※ 上位6名のみ表示（デモ）</p>
        <SaveButton label="特番結果を確定" />
      </div>
    </SectionCard>
  );
}

function FormationSection() {
  const nextPlayer = members.filter((m) => m.rank <= 6);
  const nextPit = members.filter((m) => m.rank > 6);
  return (
    <SectionCard title="翌月 PLAYER / PIT 確定" icon="⚡">
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
          <span className="rounded-full bg-gradient-to-r from-player to-player-end px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">PLAYER</span>
          <div className="mt-3 space-y-2">
            {nextPlayer.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <Image src={m.avatarUrl} alt={m.name} width={24} height={24} className="size-6 rounded-full object-cover object-top" />
                <span className="font-bold text-foreground">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
          <span className="rounded-full bg-gradient-to-r from-pit to-pit-end px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">PIT</span>
          <div className="mt-3 space-y-2">
            {nextPit.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <Image src={m.avatarUrl} alt={m.name} width={24} height={24} className="size-6 rounded-full object-cover object-top" />
                <span className="font-bold text-foreground">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveButton label="翌月編成を確定" />
    </SectionCard>
  );
}

function RewardsSection() {
  const rewards = [
    { label: "PLAYER連単 的中", count: 234, status: "未付与" },
    { label: "PLAYER3連単 的中", count: 42, status: "未付与" },
    { label: "PIT連単 的中", count: 189, status: "付与済み" },
    { label: "PIT3連単 的中", count: 31, status: "付与済み" },
  ];
  return (
    <SectionCard title="特典管理" icon="🎁">
      <div className="rounded-2xl bg-white/70 border border-white/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 text-xs font-bold text-muted">予想カテゴリ</th>
              <th className="px-4 py-3 text-xs font-bold text-muted text-right">的中者数</th>
              <th className="px-4 py-3 text-xs font-bold text-muted text-right">ステータス</th>
              <th className="px-4 py-3 text-xs font-bold text-muted text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3 font-bold text-foreground">{r.label}</td>
                <td className="px-4 py-3 text-right font-[family-name:var(--font-outfit)] font-bold">{r.count}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider font-[family-name:var(--font-outfit)] ${
                    r.status === "付与済み" ? "bg-[#d0fae5] text-[#007a55]" : "bg-[#fef3c6] text-[#b45309]"
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "未付与" && <button className="text-xs text-primary-dark hover:underline">特典付与</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

const sectionComponents: Record<Section, () => React.ReactNode> = {
  cool: CoolSection,
  members: MembersSection,
  points: PointsSection,
  youtube: YoutubeSection,
  live: LiveSection,
  checkin: CheckinSection,
  votes: VotesSection,
  special: SpecialSection,
  formation: FormationSection,
  rewards: RewardsSection,
};

export default function AdminPage() {
  const [active, setActive] = useState<Section>("cool");
  const ActiveComponent = sectionComponents[active];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1100px] px-4 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
            <span className="text-xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">管理画面</h1>
            <p className="text-xs text-muted">Project P 運用管理</p>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-52 shrink-0">
            <div className="flex flex-col gap-0.5">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left ${
                    active === item.key
                      ? "bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] text-primary-dark font-bold shadow-sm"
                      : "text-muted hover:bg-white/60"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <ActiveComponent />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
