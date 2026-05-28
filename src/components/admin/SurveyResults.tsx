'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Day, Period } from '@/types/survey';
import { WEEKEND_DAYS } from '@/types/survey';

interface SurveyDoc {
  id: string;
  studentId: string;
  name: string;
  availability: Partial<Record<Day, Period[]>>;
  createdAt: { seconds: number } | null;
}

const ALL_DAYS: Day[] = ['月', '火', '水', '木', '金', '土', '日'];

const WEEKDAY_PERIOD_LABELS: Record<number, string> = {
  1: '1限', 2: '2限', 3: '3限', 4: '4限', 5: '5限', 6: '6限',
};
const WEEKEND_PERIOD_LABELS: Record<number, string> = {
  7: '10時〜', 8: '12時〜', 9: '13時〜', 10: '14時〜', 11: '15時〜',
};

function periodLabel(day: Day, period: Period): string {
  return WEEKEND_DAYS.includes(day)
    ? WEEKEND_PERIOD_LABELS[period] ?? `${period}`
    : WEEKDAY_PERIOD_LABELS[period] ?? `${period}限`;
}

function allPeriodsForDay(day: Day): Period[] {
  return WEEKEND_DAYS.includes(day)
    ? [7, 8, 9, 10, 11]
    : [1, 2, 3, 4, 5, 6];
}

export default function SurveyResults({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [docs, setDocs] = useState<SurveyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'list'>('summary');

  useEffect(() => {
    getDocs(query(collection(db, 'surveyResponses'), orderBy('createdAt', 'desc')))
      .then((snap) => {
        setDocs(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SurveyDoc, 'id'>),
          }))
        );
      })
      .catch((e: { code?: string }) => {
        if (e.code === 'permission-denied') {
          setUnauthorized(true);
        } else {
          setError(String(e));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>;
  }
  if (unauthorized) {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <p className="text-gray-700 font-medium">このアカウントにはアクセス権限がありません</p>
        <button onClick={onUnauthorized} className="text-sm text-red-500 hover:underline">
          別のアカウントでログイン
        </button>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-sm py-8 text-center">{error}</div>;
  }

  // 曜日×時限ごとの回答人数を集計
  const dayCounts: Record<Day, number> = {} as Record<Day, number>;
  const periodCounts: Partial<Record<Day, Record<Period, number>>> = {};

  for (const day of ALL_DAYS) {
    dayCounts[day] = 0;
    periodCounts[day] = {} as Record<Period, number>;
    for (const p of allPeriodsForDay(day)) {
      periodCounts[day]![p as Period] = 0;
    }
  }

  for (const doc of docs) {
    for (const day of ALL_DAYS) {
      const periods = doc.availability[day];
      if (periods && periods.length > 0) {
        dayCounts[day]++;
        for (const p of periods) {
          periodCounts[day]![p] = (periodCounts[day]![p] ?? 0) + 1;
        }
      }
    }
  }

  const total = docs.length;

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['summary', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'summary' ? '集計' : '回答一覧'}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-gray-400 pb-2">
          回答数: {total}件
        </span>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6">
          {ALL_DAYS.map((day) => {
            const count = dayCounts[day];
            const periods = allPeriodsForDay(day);
            const pCounts = periodCounts[day]!;
            const maxPeriodCount = Math.max(...periods.map((p) => pCounts[p as Period] ?? 0), 1);

            return (
              <div key={day} className="border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">
                    {day}曜日
                  </h3>
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-accent">{count}</span> / {total} 人
                  </span>
                </div>
                {count === 0 ? (
                  <p className="text-xs text-gray-400">回答なし</p>
                ) : (
                  <div className="space-y-2">
                    {periods.map((p) => {
                      const n = pCounts[p as Period] ?? 0;
                      const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                      return (
                        <div key={p} className="flex items-center gap-3 text-sm">
                          <span className="w-16 text-gray-500 shrink-0">
                            {periodLabel(day, p as Period)}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${(n / maxPeriodCount) * 100}%` }}
                            />
                          </div>
                          <span className="w-14 text-right text-gray-600 shrink-0">
                            {n}人 ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">学籍番号</th>
                <th className="pb-2 pr-4 font-medium">名前</th>
                <th className="pb-2 pr-4 font-medium">曜日</th>
                <th className="pb-2 font-medium">回答日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <tr key={doc.id} className="align-top">
                  <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{doc.studentId}</td>
                  <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{doc.name}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {ALL_DAYS.filter((d) => (doc.availability[d]?.length ?? 0) > 0).map((d) => (
                        <span
                          key={d}
                          className="inline-block px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 whitespace-nowrap">
                    {doc.createdAt
                      ? new Date(doc.createdAt.seconds * 1000).toLocaleString('ja-JP', {
                          month: 'numeric', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {docs.length === 0 && (
            <p className="text-gray-400 text-center py-8">まだ回答がありません</p>
          )}
        </div>
      )}
    </div>
  );
}
