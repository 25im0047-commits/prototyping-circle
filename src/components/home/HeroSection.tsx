import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* グリッドパターン背景 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative max-w-5xl mx-auto px-6 py-28 sm:py-36">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-accent border border-accent/30 rounded-full mb-6 uppercase">
            Prototyping Circle
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            アイデアを、<br />
            <span className="text-accent">かたちにしよう。</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            プロトタイピングサークルは、ものづくりが好きな学生が集まるサークルです。
            ハードウェアからソフトウェアまで、アイデアを素早く形にする楽しさを共有します。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#about"
              className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              サークルについて
            </Link>
            <Link
              href="/schedule"
              className="px-6 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent/5 transition-colors"
            >
              日程アンケートに回答する →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
