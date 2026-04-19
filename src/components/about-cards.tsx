import Link from "next/link";

const cards = [
  {
    icon: "📊",
    title: "何を競う？",
    desc: "バズ・配信・収支・主役の 4 つのポイントを積み上げて競う。",
    color: "from-primary/10 to-primary-blue/10",
    border: "border-primary/15",
  },
  {
    icon: "👑",
    title: "何を勝ち取る？",
    desc: "上位6名が、次の主役としてメインステージに立つ権利を得ます。",
    color: "from-[#fef3c6]/60 to-[#fef9c2]/60",
    border: "border-[#fde68a]/30",
  },
  {
    icon: "🎬",
    title: "月1で何が起きる？",
    desc: "全員集合の特番配信で、戦いの流れが大きく動きます。",
    color: "from-purple/10 to-[#c27aff]/10",
    border: "border-purple/15",
  },
  {
    icon: "⚡",
    title: "PLAYER / PITとは？",
    desc: "成績によって立場が分かれ、格差と逆転が生まれます。",
    color: "from-pit/10 to-pit-end/10",
    border: "border-pit/15",
  },
];

export function AboutCards() {
  return (
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
        <h2 className="font-[family-name:var(--font-outfit)] text-lg sm:text-xl font-extrabold text-primary-dark tracking-tight">
          ⚡ 30秒でわかる かけあがり
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl border bg-gradient-to-br ${card.color} ${card.border} p-4 sm:p-5`}
          >
            <p className="text-2xl mb-2">{card.icon}</p>
            <h3 className="text-sm font-bold text-foreground mb-1">{card.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/about"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-dark hover:text-primary transition-colors"
        >
          かけあがり のルールを詳しく見る →
        </Link>
      </div>
    </section>
  );
}
