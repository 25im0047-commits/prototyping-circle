'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { SurveyFormState, Period } from '@/types/survey';
import { WEEKEND_DAYS } from '@/types/survey';

const ALL_WEEKDAY_PERIODS: Period[] = [1, 2, 3, 4, 5, 6];
const ALL_WEEKEND_PERIODS: Period[] = [7, 8, 9, 10, 11];

export async function submitSurvey(
  form: SurveyFormState
): Promise<{ success: boolean; error?: string }> {
  if (!form.studentId.trim()) {
    return { success: false, error: '学籍番号を入力してください。' };
  }
  if (!form.name.trim()) {
    return { success: false, error: '名前を入力してください。' };
  }
  if (form.selectedDays.length === 0) {
    return { success: false, error: '集まりやすい曜日を少なくとも1つ選んでください。' };
  }

  // 時間未選択の曜日はその曜日の全スロットを選択したとみなす
  const availability: Partial<SurveyFormState['availability']> = {};
  for (const day of form.selectedDays) {
    const periods = form.availability[day];
    if (periods && periods.length > 0) {
      availability[day] = periods;
    } else {
      availability[day] = WEEKEND_DAYS.includes(day)
        ? ALL_WEEKEND_PERIODS
        : ALL_WEEKDAY_PERIODS;
    }
  }

  try {
    await addDoc(collection(db, 'surveyResponses'), {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      availability,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e) {
    console.error('Firestore write error:', e);
    return { success: false, error: '送信に失敗しました。もう一度お試しください。' };
  }
}
