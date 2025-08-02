import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Layout } from '@/components/Layout';
import { TenderDashboard } from '@/components/TenderDashboard';
import { CreateTender } from '@/components/CreateTender';
import { ProposalDashboard } from '@/components/ProposalDashboard';
import { CreateProposal } from '@/components/CreateProposal';
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
        return (
          <ProposalDashboard
            onCreateProposal={() => handleNavigate('create-proposal')}
            onViewProposal={(id) => console.log('View proposal:', id)}
          />
        );
      case 'create-proposal':
        return <CreateProposal onBack={() => handleNavigate('proposals')} />;
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
