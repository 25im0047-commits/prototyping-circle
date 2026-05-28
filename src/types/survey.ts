export type Day = '月' | '火' | '水' | '木' | '金' | '土' | '日';
// 1〜6: 平日の1限〜6限
// 7〜11: 土日の時間帯 (10時〜 / 12時〜 / 14時〜 / 17時〜 / 19時〜)
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const WEEKEND_DAYS: Day[] = ['土', '日'];

export interface SurveyFormState {
  studentId: string;
  name: string;
  selectedDays: Day[];
  availability: Partial<Record<Day, Period[]>>;
}
