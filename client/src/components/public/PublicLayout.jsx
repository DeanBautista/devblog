import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
