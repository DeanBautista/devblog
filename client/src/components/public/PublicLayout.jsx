import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import TryAdminModal from './TryAdminModal';

const TRY_ADMIN_MODAL_DISMISSED_KEY = 'public-try-admin-modal-dismissed';

function isTryAdminModalDismissed() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(TRY_ADMIN_MODAL_DISMISSED_KEY) === 'true';
}

function dismissTryAdminModalPermanently() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TRY_ADMIN_MODAL_DISMISSED_KEY, 'true');
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isHomeRoute = pathname === '/';
  const [isTryAdminModalOpen, setIsTryAdminModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  useEffect(() => {
    if (user || isTryAdminModalDismissed()) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsTryAdminModalOpen(true);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user]);

  function handleTryAdminNow() {
    dismissTryAdminModalPermanently();
    setIsTryAdminModalOpen(false);
    navigate('/admin/login');
  }

  function handleDismissTryAdminModal() {
    dismissTryAdminModalPermanently();
    setIsTryAdminModalOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <TryAdminModal
        isOpen={isTryAdminModalOpen}
        onTryNow={handleTryAdminNow}
        onDismiss={handleDismissTryAdminModal}
      />
      {!isHomeRoute && <PublicFooter />}
    </div>
  );
}
