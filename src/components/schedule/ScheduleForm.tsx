"use client";

import { useState } from "react";
import type { Day, Period, SurveyFormState } from "@/types/survey";
import DaySelector from "./DaySelector";
import PeriodSelector from "./PeriodSelector";
import { submitSurvey } from "@/actions/submitSurvey";

const DAYS_ORDER: Day[] = ["月", "火", "水", "木", "金", "土", "日"];

export default function ScheduleForm() {
  const [form, setForm] = useState<SurveyFormState>({
    studentId: "",
    name: "",
    selectedDays: [],
    availability: {},
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDaysChange = (days: Day[]) => {
    setForm((prev) => {
      const newAvailability = { ...prev.availability };
      // 外された曜日のデータを削除
      for (const day of prev.selectedDays) {
        if (!days.includes(day)) {
          delete newAvailability[day];
        }
      }
      return { ...prev, selectedDays: days, availability: newAvailability };
    });
  };

  const handlePeriodsChange = (day: Day, periods: Period[]) => {
    setForm((prev) => ({
      ...prev,
      availability: { ...prev.availability, [day]: periods },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const result = await submitSurvey(form);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "送信に失敗しました。");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">送信完了！</h2>
        <p className="text-gray-500">回答ありがとうございました。</p>
      </div>
    );
  }

  // 選択された曜日を元の順序に並べ直す
  const orderedSelectedDays = DAYS_ORDER.filter((d) =>
    form.selectedDays.includes(d),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本情報 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          基本情報
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学籍番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.studentId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, studentId: e.target.value }))
            }
            placeholder="例: xxIMxxxx"
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="例: 山田太郎"
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
          />
        </div>
      </section>

      {/* 曜日選択 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          集まりやすい曜日 <span className="text-red-500">*</span>
          <span className="text-sm font-normal text-gray-500 ml-2">
            （複数選択可）
          </span>
        </h2>
        <DaySelector
          selectedDays={form.selectedDays}
          onChange={handleDaysChange}
        />
      </section>

      {/* 時限選択（曜日ごと） */}
      {orderedSelectedDays.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            集まりやすい時間帯
            <span className="text-sm font-normal text-gray-500 ml-2">
              （曜日ごとに複数選択可）
            </span>
          </h2>
          <div className="space-y-5">
            {orderedSelectedDays.map((day) => (
              <PeriodSelector
                key={day}
                day={day}
                selectedPeriods={form.availability[day] ?? []}
                onChange={handlePeriodsChange}
              />
            ))}
          </div>
        </section>
      )}

      {/* エラーメッセージ */}
      {status === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "submitting" ? "送信中..." : "回答を送信する"}
      </button>
    </form>
  );
}
