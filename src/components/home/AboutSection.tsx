const stats = [
  { value: '20+', label: 'メンバー' },
  { value: '月2回', label: '活動頻度' },
  { value: '3年', label: '活動歴' },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-gray-50 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              私たちはものづくりを通じて、アイデアを実現するスキルと仲間を育てるサークルです。
              3Dプリンタ、マイコン、Webアプリ、回路設計など、幅広いジャンルに挑戦しています。
            </p>
            <p className="text-gray-600 leading-relaxed">
              技術的なバックグラウンドは問いません。「作りたい！」という気持ちがあれば誰でも歓迎です。
              メンバー同士で教え合いながら、個人・チームでプロジェクトを進めます。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-extrabold text-accent mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
