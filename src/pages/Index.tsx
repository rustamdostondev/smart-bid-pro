import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Layout } from '@/components/Layout';
import { TenderDashboard } from '@/components/TenderDashboard';
import { CreateTender } from '@/components/CreateTender';
import { getCurrentUser } from '@/lib/mockData';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
    if (!user) {
      setCurrentPage('login');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'login') {
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <TenderDashboard
            onCreateTender={() => handleNavigate('create-tender')}
            onViewTender={(id) => console.log('View tender:', id)}
          />
        );
      case 'create-tender':
        return <CreateTender onBack={() => handleNavigate('dashboard')} />;
      case 'proposals':
        return <div>Proposals page coming soon...</div>;
      case 'analysis':
        return <div>Analysis page coming soon...</div>;
      default:
        return (
          <TenderDashboard
            onCreateTender={() => handleNavigate('create-tender')}
            onViewTender={(id) => console.log('View tender:', id)}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
