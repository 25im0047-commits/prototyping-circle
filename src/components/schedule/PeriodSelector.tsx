import type { Day, Period } from "@/types/survey";
import { WEEKEND_DAYS } from "@/types/survey";

const WEEKDAY_PERIODS: { value: Period; label: string }[] = [
  { value: 1, label: "1限 (9:00〜10:30)" },
  { value: 2, label: "2限 (10:40〜12:10)" },
  { value: 3, label: "3限 (13:00〜14:30)" },
  { value: 4, label: "4限 (14:40〜16:10)" },
  { value: 5, label: "5限 (16:20〜17:50)" },
  { value: 6, label: "6限 (18:00〜19:30)" },
];

const WEEKEND_PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: "10時以降" },
  { value: 8, label: "12時以降" },
  { value: 9, label: "13時以降" },
  { value: 10, label: "14時以降" },
  { value: 11, label: "15時以降" },
];

interface Props {
  day: Day;
  selectedPeriods: Period[];
  onChange: (day: Day, periods: Period[]) => void;
}

export default function PeriodSelector({
  day,
  selectedPeriods,
  onChange,
}: Props) {
  const isWeekend = WEEKEND_DAYS.includes(day);
  const slots = isWeekend ? WEEKEND_PERIODS : WEEKDAY_PERIODS;

  const toggle = (period: Period) => {
    if (selectedPeriods.includes(period)) {
      onChange(
        day,
        selectedPeriods.filter((p) => p !== period),
      );
    } else {
      onChange(
        day,
        [...selectedPeriods, period].sort((a, b) => a - b),
      );
    }
  };

  return (
    <div className="mt-3 pl-4 border-l-2 border-accent/30">
      <p className="text-sm font-medium text-gray-600 mb-2">
        {day}曜日の集まれる時間帯
      </p>
      <p className="text-xs text-gray-400 mb-2">
        ※ 何も選択しない場合は全て選択したのと同じことになります。
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map(({ value, label }) => {
          const checked = selectedPeriods.includes(value);
          return (
            <label
              key={value}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer text-sm transition-colors ${
                checked
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-gray-700 border-gray-300 hover:border-accent"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(value)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
