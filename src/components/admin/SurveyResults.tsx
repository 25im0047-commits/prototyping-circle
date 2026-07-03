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

const WEEKDAYS: Day[] = ['月', '火', '水', '木', '金'];
const WEEKDAY_PERIODS: Period[] = [1, 2, 3, 4, 5, 6];
const WEEKEND_PERIODS: Period[] = [7, 8, 9, 10, 11];

const WEEKDAY_PERIOD_LABELS: Record<Period, string> = {
  1: '1限 9:00〜',  2: '2限 10:40〜', 3: '3限 13:00〜',
  4: '4限 14:40〜', 5: '5限 16:20〜', 6: '6限 18:00〜',
  7: '', 8: '', 9: '', 10: '', 11: '',
};
const WEEKEND_PERIOD_LABELS: Record<Period, string> = {
  1: '', 2: '', 3: '', 4: '', 5: '', 6: '',
  7: '10時以降', 8: '12時以降', 9: '13時以降', 10: '14時以降', 11: '15時以降',
};

function cellBg(count: number, total: number): string {
  if (total === 0 || count === 0) return 'bg-gray-50 text-gray-300';
  const ratio = count / total;
  if (ratio >= 0.8) return 'bg-accent text-white font-bold';
  if (ratio >= 0.6) return 'bg-accent/70 text-white font-semibold';
  if (ratio >= 0.4) return 'bg-accent/40 text-accent font-semibold';
  if (ratio >= 0.2) return 'bg-accent/20 text-accent';
  return 'bg-accent/10 text-accent/70';
}

// 個人の availability を曜日×時限のミニグリッドで表示
function PersonGrid({ availability }: { availability: Partial<Record<Day, Period[]>> }) {
  const activeDays = ['月', '火', '水', '木', '金', '土', '日'].filter(
    (d) => (availability[d as Day]?.length ?? 0) > 0
  ) as Day[];

  if (activeDays.length === 0) return <p className="text-xs text-gray-400">回答なし</p>;

  const weekdayActive = activeDays.filter((d) => !WEEKEND_DAYS.includes(d));
  const weekendActive = activeDays.filter((d) => WEEKEND_DAYS.includes(d));

  return (
    <div className="space-y-3">
      {weekdayActive.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-24 pr-2 text-gray-400 font-normal text-left"></th>
                {weekdayActive.map((d) => (
                  <th key={d} className="w-10 text-center text-gray-500 font-medium pb-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKDAY_PERIODS.map((p) => (
                <tr key={p}>
                  <td className="pr-2 text-gray-400 whitespace-nowrap py-0.5">
                    {WEEKDAY_PERIOD_LABELS[p]}
                  </td>
                  {weekdayActive.map((d) => {
                    const ok = availability[d]?.includes(p) ?? false;
                    return (
                      <td key={d} className="text-center py-0.5 px-1">
                        <span className={`inline-block w-7 h-5 rounded text-xs leading-5 ${ok ? 'bg-accent/80 text-white' : 'bg-gray-100 text-gray-300'}`}>
                          {ok ? '○' : ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {weekendActive.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-20 pr-2 text-gray-400 font-normal text-left"></th>
                {weekendActive.map((d) => (
                  <th key={d} className="w-10 text-center text-gray-500 font-medium pb-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKEND_PERIODS.map((p) => (
                <tr key={p}>
                  <td className="pr-2 text-gray-400 whitespace-nowrap py-0.5">
                    {WEEKEND_PERIOD_LABELS[p]}
                  </td>
                  {weekendActive.map((d) => {
                    const ok = availability[d]?.includes(p) ?? false;
                    return (
                      <td key={d} className="text-center py-0.5 px-1">
                        <span className={`inline-block w-7 h-5 rounded text-xs leading-5 ${ok ? 'bg-accent/80 text-white' : 'bg-gray-100 text-gray-300'}`}>
                          {ok ? '○' : ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SurveyResults({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [docs, setDocs] = useState<SurveyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'list'>('summary');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, 'surveyResponses'), orderBy('createdAt', 'desc')))
      .then((snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SurveyDoc, 'id'>) })));
      })
      .catch((e: { code?: string }) => {
        if (e.code === 'permission-denied') setUnauthorized(true);
        else setError(String(e));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>;
  if (unauthorized) {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <p className="text-gray-700 font-medium">このアカウントにはアクセス権限がありません</p>
        <button onClick={onUnauthorized} className="text-sm text-red-500 hover:underline">別のアカウントでログイン</button>
      </div>
    );
  }
  if (error) return <div className="text-red-500 text-sm py-8 text-center">{error}</div>;

  const total = docs.length;

  // 集計: 曜日×時限ごとの人数
  const counts: Partial<Record<Day, Partial<Record<Period, number>>>> = {};
  for (const doc of docs) {
    for (const [day, periods] of Object.entries(doc.availability) as [Day, Period[]][]) {
      if (!counts[day]) counts[day] = {};
      for (const p of periods) {
        counts[day]![p] = (counts[day]![p] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['summary', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'summary' ? '集計' : '個人の回答'}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-gray-400 pb-2">回答数: {total}件</span>
      </div>

      {/* 集計タブ: ヒートマップグリッド */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {total === 0 && <p className="text-gray-400 text-center py-8">まだ回答がありません</p>}

          {/* 平日グリッド */}
          {total > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">平日（月〜金）</h3>
              <div className="overflow-x-auto">
                <table className="border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-28 text-left text-xs text-gray-400 font-normal pr-3 pb-2"></th>
                      {WEEKDAYS.map((d) => (
                        <th key={d} className="w-16 text-center text-gray-600 font-semibold pb-2">{d}曜</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {WEEKDAY_PERIODS.map((p) => (
                      <tr key={p}>
                        <td className="pr-3 py-1 text-xs text-gray-500 whitespace-nowrap">
                          {WEEKDAY_PERIOD_LABELS[p]}
                        </td>
                        {WEEKDAYS.map((d) => {
                          const n = counts[d]?.[p] ?? 0;
                          return (
                            <td key={d} className="py-1 px-1 text-center">
                              <span className={`inline-flex items-center justify-center w-14 h-8 rounded-lg text-sm transition-colors ${cellBg(n, total)}`}>
                                {n > 0 ? `${n}人` : '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 土日グリッド */}
          {total > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">土日</h3>
              <div className="overflow-x-auto">
                <table className="border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-20 text-left text-xs text-gray-400 font-normal pr-3 pb-2"></th>
                      {WEEKEND_DAYS.map((d) => (
                        <th key={d} className="w-16 text-center text-gray-600 font-semibold pb-2">{d}曜</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKEND_PERIODS.map((p) => (
                      <tr key={p}>
                        <td className="pr-3 py-1 text-xs text-gray-500 whitespace-nowrap">
                          {WEEKEND_PERIOD_LABELS[p]}
                        </td>
                        {WEEKEND_DAYS.map((d) => {
                          const n = counts[d]?.[p] ?? 0;
                          return (
                            <td key={d} className="py-1 px-1 text-center">
                              <span className={`inline-flex items-center justify-center w-14 h-8 rounded-lg text-sm transition-colors ${cellBg(n, total)}`}>
                                {n > 0 ? `${n}人` : '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 凡例 */}
          {total > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>少ない</span>
              {[0.1, 0.3, 0.5, 0.7, 1.0].map((r) => (
                <span key={r} className={`inline-block w-6 h-4 rounded ${cellBg(r * total, total)}`} />
              ))}
              <span>多い</span>
            </div>
          )}
        </div>
      )}

      {/* 個人の回答タブ */}
      {activeTab === 'list' && (
        <div className="space-y-2">
          {docs.length === 0 && <p className="text-gray-400 text-center py-8">まだ回答がありません</p>}
          {docs.map((doc) => {
            const isOpen = expandedId === doc.id;
            return (
              <div key={doc.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : doc.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-medium text-gray-900">{doc.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{doc.studentId}</span>
                    </div>
                    <div className="flex gap-1">
                      {(['月','火','水','木','金','土','日'] as Day[])
                        .filter((d) => (doc.availability[d]?.length ?? 0) > 0)
                        .map((d) => (
                          <span key={d} className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">
                            {d}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {doc.createdAt
                        ? new Date(doc.createdAt.seconds * 1000).toLocaleString('ja-JP', {
                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })
                        : ''}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50">
                    <PersonGrid availability={doc.availability} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
