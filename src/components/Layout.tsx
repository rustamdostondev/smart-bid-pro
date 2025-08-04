import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";
import { setCurrentUser } from "@/lib/mockData";
import {
  FileText,
  Users,
  BarChart3,
  LogOut,
  Plus,
  Globe,
  FolderOpen,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Layout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}: LayoutProps) {
  const user = authService.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    if (onLogout) {
      onLogout();
    } else {
      onNavigate("login");
    }
  };

  if (!user) {
    return <div>{children}</div>;
  }

  const navigationItems = [
    {
      id: "all-tenders",
      name: "All Tenders",
      icon: Globe,
      description: "Browse available tenders",
      roles: ["admin", "user"],
    },
    {
      id: "my-tenders",
      name: "My Tenders",
      icon: FolderOpen,
      description: "Manage your tenders",
      roles: ["admin"],
    },
    {
      id: "proposals",
      name: "Proposals",
      icon: Briefcase,
      description: "View and manage proposals",
      roles: ["user"],
    },
    {
      id: "analysis",
      name: "Analysis",
      icon: BarChart3,
      description: "Analytics and insights",
      roles: ["admin"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-lg">TenderPlatform</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                const isAllowed = item.roles.includes(user.role);
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      if (!isAllowed) {
                        return;
                      }
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full justify-start h-12 px-4 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />

                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </Button>
                );
              })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.company}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-700 h-10"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header for Mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:bg-gray-100 h-10 w-10 p-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              TenderPlatform
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
