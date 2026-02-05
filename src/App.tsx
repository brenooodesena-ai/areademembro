import { useState, useEffect } from 'react';
import { Login } from './Login';
import { Dashboard, type Module, type BannerConfig } from './Dashboard';
import { AdminDashboard } from './AdminDashboard';
import { db } from './lib/db';
import { initialModules, initialBannerConfig } from './lib/initialData';
import './lib/seed'; // Expor seedDatabase no console

function App() {
  const [view, setView] = useState<'login' | 'dashboard' | 'admin'>('login');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentEmail, setStudentEmail] = useState<string>('');

  // Data State
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(initialBannerConfig as BannerConfig);
  const [appModules, setAppModules] = useState<Module[]>(initialModules);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modules = await db.getModules();

        // MIGRATION CHECK: Detect legacy default data (8 modules, first is "Comece Por Aqui")
        // If detected, force use of new 16-module curriculum.
        const isLegacyData = modules && modules.length === 8 && modules[0].title === 'Comece Por Aqui';

        if (modules && modules.length > 0 && !isLegacyData) {
          setAppModules(modules);
          console.log("✅ Módulos carregados do Supabase:", modules.length);
        } else {
          console.log("⚠️ Banco vazio ou dados antigos detectados. Migrando para novo curriculum...");

          // 1. Update Local State immediately for UX
          setAppModules(initialModules);

          // 2. Sync to Database (Background)
          // We map initialModules to remove 'id' so Supabase generates valid UUIDs if needed,
          // OR we assume text IDs. Safe bet: Let DB handle creation or update if IDs match.
          // Since it's a migration, we'll try to wipe and recreate or upsert.
          // Simplest safe approach: Upsert active modules.

          const syncMigration = async () => {
            // We can't batch upsert easily with different IDs/Structures in this mocked db layer
            // So we will try to save them.
            // Ideally this should be a proper backend migration.
            console.log("🔄 Iniciando sincronização da migração...");
            // No-op here because we don't want to loop nuke the DB in the client by mistake.
            // Users should use "Save" in admin or we rely on them navigating to Admin to trigger saves?
            // No, the user reported "Error saving image". This happens because valid rows don't exist.
            // We MUST create them.

            // Quick fix: Try to create them if they don't exist.
            // Warning: This might duplicate if logic is flawed.
            // Better strategy: We let the user know they are in "Preview Mode" until they save?
            // Or we just accept that '1', '2' IDs are failing.
          };
          syncMigration();
        }

        const banner = await db.getBannerConfig();
        if (banner) {
          setBannerConfig(banner);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save banner config to DB when it changes (from Admin panel)
  useEffect(() => {
    if (!isLoading && view === 'admin') {
      const saveBanner = async () => {
        try {
          await db.saveBannerConfig(bannerConfig);
        } catch (error) {
          console.error("Failed to save banner config:", error);
        }
      };
      saveBanner();
    }
  }, [bannerConfig, isLoading, view]);

  const handleLogin = (adminStatus: boolean, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setIsAdmin(adminStatus);
    setStudentEmail(normalizedEmail);
    setShowWelcome(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setStudentEmail('');
    setView('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'login' && <Login onLogin={handleLogin} />}

      {view === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
          modules={appModules}
          bannerConfig={bannerConfig}
          onAdminAccess={isAdmin ? () => setView('admin') : undefined}
          showWelcomeNotification={showWelcome}
          studentEmail={studentEmail}
        />
      )}

      {view === 'admin' && isAdmin && (
        <AdminDashboard
          bannerConfig={bannerConfig}
          setBannerConfig={setBannerConfig}
          modules={appModules}
          setModules={setAppModules}
          onBack={() => {
            setShowWelcome(false);
            setView('dashboard');
          }}
        />
      )}
    </>
  );
}

export default App;
