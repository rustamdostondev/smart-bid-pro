import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { LandingPage } from '@/components/LandingPage';
import { Layout } from '@/components/Layout';
import { AllTenders } from '@/components/AllTenders';
import { MyTenders } from '@/components/MyTenders';
import { TenderDetail } from '@/components/TenderDetail';
import { CreateTender } from '@/components/CreateTender';
import { ProposalDashboard } from '@/components/ProposalDashboard';
import { CreateProposal } from '@/components/CreateProposal';
import { getCurrentUser } from '@/lib/mockData';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [previousPage, setPreviousPage] = useState('landing');
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
    if (user && currentPage === 'landing') {
      setCurrentPage('all-tenders');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('all-tenders');
  };

  const handleGetStarted = () => {
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setCurrentPage(page);
    setSelectedTenderId(null); // Clear selected tender when navigating
    if (page === 'login') {
      setIsAuthenticated(false);
    }
  };

  const handleViewTender = (tenderId: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setSelectedTenderId(tenderId);
    setCurrentPage('tender-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedTenderId(null);
    setCurrentPage(previousPage); // Go back to the previous page
  };

  if (!isAuthenticated && currentPage === 'login') {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onLogin={() => setCurrentPage('login')}
          />
        );
      case 'all-tenders':
        return (
          <AllTenders
            onViewTender={handleViewTender}
          />
        );
      case 'my-tenders':
        return (
          <MyTenders
            onCreateTender={() => handleNavigate('create-tender')}
            onViewTender={handleViewTender}
            onEditTender={(id) => {
              setSelectedTenderId(id);
              setCurrentPage('edit-tender');
            }}
            onDeleteTender={(id) => {
              // Handle delete logic here
              console.log('Delete tender:', id);
            }}
          />
        );
      case 'tender-detail':
        return selectedTenderId ? (
          <TenderDetail
            tenderId={selectedTenderId}
            onBack={handleBackToDashboard}
            previousPage={previousPage}
            onEdit={(id) => {
              setSelectedTenderId(id);
              setCurrentPage('edit-tender');
            }}
            onDelete={(id) => {
              // Handle delete logic here
              console.log('Delete tender:', id);
              handleBackToDashboard();
            }}
          />
        ) : (
          <AllTenders
            onViewTender={handleViewTender}
          />
        );
      case 'create-tender':
        return <CreateTender onBack={() => handleNavigate('my-tenders')} />;
      case 'edit-tender':
        return selectedTenderId ? (
          <CreateTender 
            onBack={handleBackToDashboard} 
            editTenderId={selectedTenderId}
          />
        ) : (
          <CreateTender onBack={() => handleNavigate('my-tenders')} />
        );
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
          <AllTenders
            onViewTender={handleViewTender}
          />
        );
    }
  };

  // For landing page and login, don't wrap with Layout
  if (currentPage === 'landing' || currentPage === 'login') {
    return renderPage();
  }

  // For authenticated pages, wrap with Layout
  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
