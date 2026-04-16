export type Role = "PLAYER" | "PIT";

export interface MemberStats {
  buzz: number;
  concurrent: number;
  revenue: number;
}

export interface Activity {
  time: string;
  text: string;
}

export interface MemberDetail {
  positionForecast: string;
  positionMargin: string;
  supportRate: number;
  buzzStatus: string;
  streamingStatus: string;
  stats: MemberStats;
  activities: Activity[];
  monthlyPoints: number[];
}

export interface Member {
  id: number;
  rank: number;
  name: string;
  slug: string;
  role: Role;
  points: number;
  avatarUrl: string;
  isLive?: boolean;
  isTrending?: boolean;
  boatColor?: 1 | 2 | 3 | 4 | 5 | 6 | null;
  detail: MemberDetail;
}

export const members: Member[] = [
  {
    id: 1, rank: 1, name: "塩見きら", slug: "shiomi-kira", role: "PLAYER", points: 2008, avatarUrl: "/members/shiomi-kira.jpg", isLive: true,
    detail: {
      stats: { buzz: 806, concurrent: 455, revenue: 347 },
      positionForecast: "PLAYER圏内", positionMargin: "6位余裕", supportRate: 30,
      buzzStatus: "通常", streamingStatus: "配信中！",
      activities: [
        { time: "3時間前", text: "YouTube配信を開始 🎬" },
        { time: "昨日", text: "TikTok動画が10万再生を突破 🔥" },
        { time: "2日前", text: "コラボ配信で同接1,200人を記録 📈" },
        { time: "5日前", text: "グッズ売上が目標を達成 🎉" },
      ],
      monthlyPoints: [320, 380, 450, 480, 520, 508],
    },
  },
  {
    id: 2, rank: 2, name: "ねこみ。", slug: "nekomi", role: "PLAYER", points: 1884, avatarUrl: "/members/nekomi.jpg",
    detail: {
      stats: { buzz: 720, concurrent: 410, revenue: 354 },
      positionForecast: "PLAYER圏内", positionMargin: "安定", supportRate: 25,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "5時間前", text: "新曲カバー動画を投稿 🎵" },
        { time: "昨日", text: "ファンイベントの告知を発表 📢" },
        { time: "3日前", text: "Instagramフォロワーが5万人突破 ✨" },
        { time: "1週間前", text: "雑誌インタビューが公開 📖" },
      ],
      monthlyPoints: [300, 350, 400, 420, 460, 454],
    },
  },
  {
    id: 3, rank: 3, name: "阿久津真央", slug: "akutsu-mao", role: "PLAYER", points: 1833, avatarUrl: "/members/akutsu-mao.jpg", isTrending: true,
    detail: {
      stats: { buzz: 690, concurrent: 380, revenue: 363 },
      positionForecast: "PLAYER圏内", positionMargin: "安定", supportRate: 22,
      buzzStatus: "急上昇", streamingStatus: "オフライン",
      activities: [
        { time: "2時間前", text: "TikTokでバズ動画が50万再生 🚀" },
        { time: "昨日", text: "X(Twitter)でトレンド入り 🔥" },
        { time: "3日前", text: "YouTube登録者が3万人突破 🎉" },
        { time: "5日前", text: "新グッズの先行販売を開始 🛍️" },
      ],
      monthlyPoints: [250, 310, 380, 410, 460, 473],
    },
  },
  {
    id: 4, rank: 4, name: "カガミルイ", slug: "kagami-rui", role: "PLAYER", points: 1720, avatarUrl: "/members/kagami-rui.jpg",
    detail: {
      stats: { buzz: 580, concurrent: 420, revenue: 320 },
      positionForecast: "PLAYER圏内", positionMargin: "やや安心", supportRate: 18,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "コラボ配信を実施 🤝" },
        { time: "2日前", text: "新企画の告知動画を公開 📹" },
        { time: "4日前", text: "ファンレター企画を開始 💌" },
        { time: "1週間前", text: "月間MVPにノミネート 🏆" },
      ],
      monthlyPoints: [280, 320, 360, 390, 420, 430],
    },
  },
  {
    id: 5, rank: 5, name: "栗田みほ", slug: "kurita-miho", role: "PLAYER", points: 1655, avatarUrl: "/members/kurita-miho.jpg", isLive: true,
    detail: {
      stats: { buzz: 520, concurrent: 390, revenue: 345 },
      positionForecast: "PLAYER圏内", positionMargin: "ギリギリ", supportRate: 15,
      buzzStatus: "通常", streamingStatus: "配信中！",
      activities: [
        { time: "1時間前", text: "ゲーム実況配信をスタート 🎮" },
        { time: "昨日", text: "誕生日記念配信で盛り上がり 🎂" },
        { time: "3日前", text: "ファンアート紹介配信 🎨" },
        { time: "5日前", text: "新メンバーとのコラボ動画 📹" },
      ],
      monthlyPoints: [260, 300, 340, 370, 400, 385],
    },
  },
  {
    id: 6, rank: 11, name: "Coming Soon", slug: "saito-riko", role: "PLAYER", points: 0, avatarUrl: "/members/coming-soon.svg",
    detail: {
      stats: { buzz: 480, concurrent: 360, revenue: 350 },
      positionForecast: "PLAYER圏内", positionMargin: "ボーダー付近", supportRate: 12,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "ASMR配信が好評 🎧" },
        { time: "2日前", text: "コスプレ写真が話題に 📸" },
        { time: "4日前", text: "ファンミーティング開催 🤗" },
        { time: "6日前", text: "オリジナル楽曲を発表 🎤" },
      ],
      monthlyPoints: [240, 280, 320, 350, 380, 370],
    },
  },
  {
    id: 7, rank: 7, name: "セナモモカ", slug: "sena-momoka", role: "PIT", points: 1283, avatarUrl: "/members/sena-momoka.jpg",
    detail: {
      stats: { buzz: 420, concurrent: 280, revenue: 283 },
      positionForecast: "PIT圏内", positionMargin: "ボーダー付近", supportRate: 10,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "雑談配信で同接記録更新 📈" },
        { time: "3日前", text: "ダンス動画がバズり中 💃" },
        { time: "5日前", text: "新衣装お披露目 👗" },
        { time: "1週間前", text: "料理配信が人気 🍳" },
      ],
      monthlyPoints: [200, 230, 260, 290, 310, 323],
    },
  },
  {
    id: 8, rank: 8, name: "清宮みゆ", slug: "kiyomiya-miyu", role: "PIT", points: 1120, avatarUrl: "/members/kiyomiya-miyu.jpg", isTrending: true,
    detail: {
      stats: { buzz: 380, concurrent: 250, revenue: 240 },
      positionForecast: "PIT圏内", positionMargin: "上昇中", supportRate: 8,
      buzzStatus: "急上昇", streamingStatus: "オフライン",
      activities: [
        { time: "3時間前", text: "バズ動画で急上昇中 🚀" },
        { time: "昨日", text: "初のソロライブ告知 🎤" },
        { time: "4日前", text: "ファン感謝配信を実施 💕" },
        { time: "1週間前", text: "コラボグッズが完売 🎁" },
      ],
      monthlyPoints: [150, 180, 220, 250, 280, 310],
    },
  },
  {
    id: 9, rank: 9, name: "城乃せん", slug: "jono-sen", role: "PIT", points: 1058, avatarUrl: "/members/jono-sen.jpg", isLive: true,
    detail: {
      stats: { buzz: 350, concurrent: 230, revenue: 228 },
      positionForecast: "PIT圏内", positionMargin: "維持", supportRate: 7,
      buzzStatus: "通常", streamingStatus: "配信中！",
      activities: [
        { time: "30分前", text: "歌枠配信スタート 🎵" },
        { time: "昨日", text: "YouTube動画が5万再生 📺" },
        { time: "3日前", text: "お絵描き配信が好評 🎨" },
        { time: "5日前", text: "新企画を発表 📋" },
      ],
      monthlyPoints: [180, 200, 230, 250, 270, 258],
    },
  },
  {
    id: 10, rank: 10, name: "さくらぎみずき", slug: "sakuragi-mizuki", role: "PIT", points: 980, avatarUrl: "/members/sakuragi-mizuki.jpg",
    detail: {
      stats: { buzz: 310, concurrent: 220, revenue: 200 },
      positionForecast: "PIT圏内", positionMargin: "維持", supportRate: 5,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "ペットとの日常動画を投稿 🐶" },
        { time: "3日前", text: "新シリーズ企画を開始 🎬" },
        { time: "5日前", text: "リスナー参加型ゲーム配信 🎮" },
        { time: "1週間前", text: "月間まとめ動画を公開 📊" },
      ],
      monthlyPoints: [160, 180, 200, 220, 240, 230],
    },
  },
  {
    id: 11, rank: 11, name: "ありよりのあみ", slug: "ariyorino-ami", role: "PIT", points: 890, avatarUrl: "/members/ariyorino-ami.jpg",
    detail: {
      stats: { buzz: 280, concurrent: 190, revenue: 220 },
      positionForecast: "PIT圏内", positionMargin: "維持", supportRate: 4,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "朝活配信をスタート ☀️" },
        { time: "2日前", text: "コラボ企画が決定 🤝" },
        { time: "4日前", text: "ファンアート募集企画 🎨" },
        { time: "1週間前", text: "チャレンジ動画が好評 💪" },
      ],
      monthlyPoints: [140, 160, 180, 200, 220, 210],
    },
  },
  {
    id: 12, rank: 12, name: "Coming Soon", slug: "maeda-sumika", role: "PIT", points: 0, avatarUrl: "/members/coming-soon.svg",
    detail: {
      stats: { buzz: 240, concurrent: 170, revenue: 150 },
      positionForecast: "PIT圏内", positionMargin: "下位", supportRate: 3,
      buzzStatus: "通常", streamingStatus: "オフライン",
      activities: [
        { time: "昨日", text: "初心者向けゲーム配信 🎮" },
        { time: "3日前", text: "自己紹介動画をリニューアル 📹" },
        { time: "5日前", text: "ファンレターに返信配信 💌" },
        { time: "1週間前", text: "目標宣言動画を投稿 🎯" },
      ],
      monthlyPoints: [100, 120, 140, 160, 180, 160],
    },
  },
];
