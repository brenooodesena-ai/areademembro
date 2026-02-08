import { useState, useEffect } from 'react';
import { Login } from './Login';
import { Dashboard, type Module, type BannerConfig } from './Dashboard';
import { AdminDashboard } from './AdminDashboard';
import { db } from './lib/db';
import { initialModules, initialBannerConfig } from './lib/initialData';
import './lib/seed'; // Expor seedDatabase no console
import { createAdminUser } from './seed';

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
      // Ensure admin user exists (background)
      createAdminUser();

      try {
        // Fetch modules and banner in parallel
        const [modules, banner] = await Promise.all([
          db.getModules(),
          db.getBannerConfig()
        ]);

        // MIGRATION CHECK: Detect legacy default data
        const isLegacyData = modules && modules.length === 8 && modules[0].title === 'Comece Por Aqui';

        if (modules && modules.length > 0 && !isLegacyData) {
          setAppModules(modules);
          console.log("✅ Módulos carregados do Firestore:", modules.length);
        } else {
          console.log("⚠️ Banco vazio ou dados antigos detectados. Usando curriculum padrão.");
          setAppModules(initialModules);
        }

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

  if (isLoading && view !== 'login') {
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
