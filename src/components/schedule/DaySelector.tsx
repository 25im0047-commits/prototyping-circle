import type { Day } from '@/types/survey';

const DAYS: Day[] = ['月', '火', '水', '木', '金', '土', '日'];

interface Props {
  selectedDays: Day[];
  onChange: (days: Day[]) => void;
}

export default function DaySelector({ selectedDays, onChange }: Props) {
  const toggle = (day: Day) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const checked = selectedDays.includes(day);
        const isWeekend = day === '土' || day === '日';
        return (
          <label
            key={day}
            className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 cursor-pointer font-bold text-lg transition-colors ${
              checked
                ? 'bg-accent text-white border-accent'
                : isWeekend
                ? 'bg-white text-red-400 border-gray-200 hover:border-accent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-accent'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(day)}
            />
            {day}
          </label>
        );
      })}
    </div>
  );
}
