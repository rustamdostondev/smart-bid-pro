import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logoutUser } from '@/lib/mockData';
import { FileText, Users, BarChart3, LogOut, Plus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    onNavigate('login');
  };

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary-foreground">TenderPlatform</h1>
              <nav className="hidden md:flex space-x-4">
                <Button
                  variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('dashboard')}
                  className="text-primary-foreground hover:bg-white/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Tenders
                </Button>
                <Button
                  variant={currentPage === 'proposals' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('proposals')}
                  className="text-primary-foreground hover:bg-white/10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Proposals
                </Button>
                <Button
                  variant={currentPage === 'analysis' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('analysis')}
                  className="text-primary-foreground hover:bg-white/10"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analysis
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onNavigate('create-tender')}
                className="bg-white/10 text-primary-foreground hover:bg-white/20 border border-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tender
              </Button>
              <div className="text-primary-foreground text-sm">
                {user.name} ({user.company})
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}