import ScheduleForm from '@/components/schedule/ScheduleForm';

export const metadata = {
  title: '日程アンケート | プロトタイピングサークル',
  description: '集まりやすい曜日・時間帯をお知らせください',
};

export default function SchedulePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">日程アンケート</h1>
        <p className="text-gray-500 leading-relaxed">
          サークルの活動日程を決めるためのアンケートです。
          集まりやすい曜日と時間帯を教えてください。
        </p>
      </div>
      <ScheduleForm />
    </div>
  );
}
