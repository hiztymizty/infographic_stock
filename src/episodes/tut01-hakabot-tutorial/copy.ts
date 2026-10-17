// tut01 on-screen strings shared across chapters (Bahasa): intro, chapter titles, end card. Each chapter's own
// highlight labels live at the top of its beats/<chapter>.ts, so chapters can be built in parallel.
// Nothing here is a market figure; footage numbers stay in the footage.

export const COPY = {
  intro: {
    kicker: 'TUTORIAL LENGKAP',
    title: 'Tutorial Hakabot',
    sub: 'Cara pakai dari Dashboard sampai halaman Akun',
    disclaimer: 'Semua saham di video ini cuma contoh · Bukan rekomendasi investasi',
    whatTitle: ['Tools buat analisa', 'saham Indonesia sendiri'],
    /** Each appears when the voice names it (`word` in line intro-1-what). */
    tools: [
      {label: 'Chart', word: 'chart'},
      {label: 'Gerak bandar', word: 'bandar'},
      {label: 'Fundamental', word: 'fundamental'},
    ],
    signalKicker: 'OPSIONAL',
    signalTitle: 'Paket Signal',
    signalArrow: 'sinyal siap pakai di',
    signalDest: 'HB Center',
    chaptersKicker: 'YANG KITA BAHAS',
  },
  /** Chapter titles in order (BAB 01…08); `word` = where intro-1-chapters names it. */
  chapters: [
    {title: 'Dashboard', word: 'Dashboard'},
    {title: 'Watchlist', word: 'Watchlist'},
    {title: 'Stock', word: 'Stock'},
    {title: 'Index', word: 'Index'},
    {title: 'Composition', word: 'Composition'},
    {title: 'Screener', word: 'Screener'},
    {title: 'HB Center', word: 'HB'},
    {title: 'Akun', word: 'Akun'},
  ],
  end: {
    line1: 'Baca saham sendiri.',
    line2: 'Keputusannya tetap di tangan kamu.',
    url: 'hakabot.com',
    community: 'Tanya-tanya di komunitas',
    telegram: 'Telegram',
    discord: 'Discord',
    disclaimer: 'Bukan rekomendasi investasi · Hasil masa lalu nggak menjamin hasil ke depan',
    source: 'Sumber: rekaman layar aplikasi Hakabot, 15 Okt 2026',
  },
} as const;
