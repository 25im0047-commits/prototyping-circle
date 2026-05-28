import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-accent text-lg tracking-tight">
          <span className="inline-block w-6 h-6 border-2 border-accent rotate-12" />
          プロトタイピングサークル
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/#about" className="hover:text-accent transition-colors">About</Link>
          <Link href="/#activities" className="hover:text-accent transition-colors">Activities</Link>
          <Link
            href="/schedule"
            className="px-4 py-1.5 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
          >
            日程アンケート
          </Link>
        </nav>
      </div>
    </header>
  );
}
