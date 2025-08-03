import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { LandingPage } from '@/components/LandingPage';
import { Layout } from '@/components/Layout';
import { AllTenders } from '@/components/AllTenders';
import { MyTenders } from '@/components/MyTenders';
import { TenderDetail } from '@/components/TenderDetail';
import { CreateTender } from '@/components/CreateTender';
import { MyProposals } from '@/components/MyProposals';
import { ProposalDetail } from '@/components/ProposalDetail';
import { ProposalDetailView } from '@/components/ProposalDetailView';
import { CreateProposal } from '@/components/CreateProposal';
import TenderAnalytics from '@/components/TenderAnalytics';
import AnalyticsPage from '@/components/AnalyticsPage';
import { authService, startTokenRefresh, stopTokenRefresh } from '@/lib/auth';
import { setCurrentUser, mockTenders, mockProposals } from '@/lib/mockData';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [previousPage, setPreviousPage] = useState('landing');
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [matchingProposalId, setMatchingProposalId] = useState<string | null>(null);
  const [matchingTenderId, setMatchingTenderId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUserState] = useState<any>(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const user = authService.validateToken();
      if (user) {
        setCurrentUserState(user);
        setCurrentUser(user); // Update mock data
        setIsAuthenticated(true);
        startTokenRefresh();
        
        // If user is authenticated and on landing page, redirect to dashboard
        if (currentPage === 'landing') {
          setCurrentPage('all-tenders');
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUserState(null);
        setCurrentUser(null);
        stopTokenRefresh();
        
        // If user is not authenticated and not on public pages, redirect to landing
        if (currentPage !== 'landing' && currentPage !== 'login') {
          setCurrentPage('landing');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle browser refresh - restore page state from URL or localStorage if needed
  useEffect(() => {
    // You could implement URL-based routing here if needed
    // For now, we'll just ensure proper authentication state
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    startTokenRefresh();
    setCurrentPage('all-tenders');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentUserState(null);
    setIsAuthenticated(false);
    stopTokenRefresh();
    setCurrentPage('landing');
    // Clear all selected states
    setSelectedTenderId(null);
    setSelectedProposalId(null);
    setMatchingProposalId(null);
    setMatchingTenderId(null);
  };

  const handleGetStarted = () => {
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setCurrentPage(page);
    setSelectedTenderId(null); // Clear selected tender when navigating
    setSelectedProposalId(null); // Clear selected proposal when navigating
    setMatchingProposalId(null); // Clear matching proposal when navigating
    setMatchingTenderId(null); // Clear matching tender when navigating
    if (page === 'login') {
      // Don't automatically set isAuthenticated to false here
      // Let the actual logout handler do that
    }
  };

  const handleViewTender = (tenderId: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setSelectedTenderId(tenderId);
    setCurrentPage('tender-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedTenderId(null);
    setSelectedProposalId(null);
    setMatchingProposalId(null);
    setMatchingTenderId(null);
    setCurrentPage(previousPage); // Go back to the previous page
  };

  const handleViewProposal = (proposalId: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setSelectedProposalId(proposalId);
    setCurrentPage('proposal-detail');
  };

  const handleViewProposalDetail = (proposalId: string) => {
    setPreviousPage(currentPage); // Store the current page as previous
    setSelectedProposalId(proposalId);
    setCurrentPage('proposal-detail-view');
  };

  const handleBackFromProposalDetail = () => {
    setSelectedProposalId(null);
    setCurrentPage('tender-detail'); // Go back specifically to tender detail
  };

  const handleOpenAnalytics = (tenderId: string) => {
    setPreviousPage(currentPage);
    setSelectedTenderId(tenderId);
    setCurrentPage('tender-analytics');
  };

  const handleBackFromAnalytics = () => {
    // Keep the selectedTenderId when navigating back to tender-detail
    // This ensures we return to the correct tender detail page
    setCurrentPage(previousPage); // Go back to the previous page (usually tender-detail)
  };


  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form when on login page
  if (currentPage === 'login') {
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
            showOwnerView={previousPage === 'my-tenders'}
            onEdit={(id) => {
              setSelectedTenderId(id);
              setCurrentPage('edit-tender');
            }}
            onDelete={(id) => {
              // Handle delete logic here
              console.log('Delete tender:', id);
              handleBackToDashboard();
            }}
            onViewProposalDetail={handleViewProposalDetail}
            onOpenAnalytics={handleOpenAnalytics}
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
          <MyProposals
            onCreateProposal={() => handleNavigate('create-proposal')}
            onViewProposal={handleViewProposal}
          />
        );
      case 'create-proposal':
        return <CreateProposal onBack={() => handleNavigate('proposals')} />;
      case 'proposal-detail':
        return selectedProposalId ? (
          <ProposalDetail
            proposalId={selectedProposalId}
            onBack={handleBackToDashboard}
            onEdit={(id) => {
              setSelectedProposalId(id);
              setCurrentPage('edit-proposal');
            }}
            onDelete={(id) => {
              // Handle delete logic here
              console.log('Delete proposal:', id);
              handleBackToDashboard();
            }}

          />
        ) : (
          <MyProposals
            onCreateProposal={() => handleNavigate('create-proposal')}
            onViewProposal={handleViewProposal}

          />
        );
      case 'proposal-detail-view':
        return selectedProposalId ? (
          <ProposalDetailView
            proposalId={selectedProposalId}
            onBack={handleBackFromProposalDetail}
          />
        ) : (
          <AllTenders
            onViewTender={handleViewTender}
          />
        );
      case 'tender-analytics':
        return selectedTenderId ? (() => {
          const tender = mockTenders.find(t => t.id === selectedTenderId);
          const relatedProposals = mockProposals.filter(p => p.tenderIds === selectedTenderId);
          return tender ? (
            <TenderAnalytics
              tender={tender}
              proposals={relatedProposals}
              onBack={handleBackFromAnalytics}
            />
          ) : (
            <AllTenders onViewTender={handleViewTender} />
          );
        })() : (
          <AllTenders onViewTender={handleViewTender} />
        );
      case 'analysis':
        return (
          <AnalyticsPage
            onOpenTenderAnalytics={handleOpenAnalytics}
          />
        );
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
  if (isAuthenticated) {
    return (
      <Layout currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
        {renderPage()}
      </Layout>
    );
  }

  // For non-authenticated users, show landing page
  return renderPage();
};

export default Index;
