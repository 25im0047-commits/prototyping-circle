const activities = [
  {
    icon: '⚙️',
    title: 'ハードウェア制作',
    description: '3Dプリンタやレーザーカッターを使ったプロトタイプ制作。アイデアを物理的な形にします。',
  },
  {
    icon: '💻',
    title: 'ソフトウェア開発',
    description: 'Webアプリやスマホアプリのプロトタイプをチームやソロで開発します。',
  },
  {
    icon: '🔌',
    title: '電子工作',
    description: 'Arduino・Raspberry Piを使ったIoTデバイスや自動化ツールを作ります。',
  },
  {
    icon: '🎨',
    title: 'デザイン',
    description: 'UIデザインからプロダクトデザインまで、見た目と使いやすさを考えます。',
  },
];

export default function ActivitiesSection() {
  return (
    <section id="activities" className="bg-white py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Activities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map(({ icon, title, description }) => (
            <div
              key={title}
              className="p-6 border border-gray-100 rounded-xl hover:border-accent/30 hover:shadow-md transition-all"
            >
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
