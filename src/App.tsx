import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentListView } from './components/students/StudentListView';
import { TeacherListView } from './components/teachers/TeacherListView';
import { TalentExplorationView } from './components/talents/TalentExplorationView';
import { AmbassadorListView } from './components/ambassadors/AmbassadorListView';
import { ExtracurricularListView } from './components/extracurriculars/ExtracurricularListView';
import { ActivitiesView } from './components/activities/ActivitiesView';
import { PortfoliosView } from './components/portfolios/PortfoliosView';
import { ReportsView } from './components/reports/ReportsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { SettingsView } from './components/settings/SettingsView';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'students':
        return <StudentListView />;
      case 'teachers':
        return <TeacherListView />;
      case 'talents':
        return <TalentExplorationView />;
      case 'ambassadors':
        return <AmbassadorListView />;
      case 'extracurriculars':
        return <ExtracurricularListView />;
      case 'activities':
        return <ActivitiesView />;
      case 'portfolios':
        return <PortfoliosView />;
      case 'reports':
        return <ReportsView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={activeTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
