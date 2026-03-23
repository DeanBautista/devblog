import useAuthStore from '../../stores/authStore';

export default function Dashboard() {
  const { logout } = useAuthStore();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-background)] sm:bg-[var(--color-background)]">
      <h1 className="text-3xl font-bold text-[var(--color-on-background)]">Dashboard</h1>
      <button 
        className="ml-4 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg hover:bg-[var(--color-primary-container)] transition-colors"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  )
}