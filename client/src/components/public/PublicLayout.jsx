import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isHomeRoute = pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHomeRoute && <PublicFooter />}
    </div>
  );
}
