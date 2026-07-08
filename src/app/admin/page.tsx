'use client';

import { useEffect, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminLogin from '@/components/admin/AdminLogin';
import SurveyResults from '@/components/admin/SurveyResults';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    getRedirectResult(auth).catch((e: unknown) => {
      console.error('Redirect login error:', e);
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code?: string }).code) : undefined;

      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'Firebase Authentication の承認済みドメインに現在の公開URLが追加されていません。'
        );
        return;
      }

      if (code === 'auth/operation-not-allowed') {
        setAuthError('Firebase Authentication で Google ログインが有効化されていません。');
        return;
      }

      setAuthError('ログイン処理に失敗しました。Firebase Authentication の設定を確認してください。');
    });

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthState(u ? 'authenticated' : 'unauthenticated');
      if (u) setAuthError('');
    });
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin error={authError} />;
  }

  return <AdminLayout user={user!} onLogout={() => signOut(auth)} />;
}

function AdminLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="font-bold text-accent text-sm">管理者ページ</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a
            href="#survey"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent"
          >
            <span>📊</span> 日程アンケート
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">日程アンケート集計</h1>
          <SurveyResults onUnauthorized={() => signOut(auth)} />
        </div>
      </main>
    </div>
  );
}
