export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p className="font-medium text-gray-600">プロトタイピングサークル</p>
        <p>© {new Date().getFullYear()} Prototyping Circle. All rights reserved.</p>
      </div>
    </footer>
  );
}
