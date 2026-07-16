import { useState, useCallback, lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Header } from '@/components/layout/Header';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { CommandPalette } from '@/components/CommandPalette';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationPermissionBanner } from '@/components/NotificationPermissionBanner';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import SplashScreen from '@/pages/SplashScreen';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy-loaded pages
const GlobePage  = lazy(() => import('@/pages/EarthGlobePage'));
const MapPage = lazy(() => import('@/pages/WorldMapPage'));
const ProjectHubPage = lazy(() => import('@/pages/ProjectHubPage'));
const InvestPage = lazy(() => import('@/pages/InvestFlowPage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const ObjectDetailPage = lazy(() => import('@/pages/ObjectDetailPage'));
const SubjectDetailPage = lazy(() => import('@/pages/SubjectDetailPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const RDPage = lazy(() => import('@/pages/RDPage'));
const RDDetailPage = lazy(() => import('@/pages/RDDetailPage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const CatalogDetailPage = lazy(() => import('@/pages/CatalogDetailPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const StakeholderDetailPage = lazy(() => import('@/pages/StakeholderDetailPage'));
const OrganizationDetailPage = lazy(() => import('@/pages/OrganizationDetailPage'));
const WorkspacePage = lazy(() => import('@/pages/WorkspacePage'));
const AdminInvitePage = lazy(() => import('@/pages/AdminInvitePage'));
const ActivatePage = lazy(() => import('@/pages/ActivatePage'));
const ObjectsPage = lazy(() => import('@/pages/ObjectsPage'));
const SubjectsPage = lazy(() => import('@/pages/SubjectsPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const PresentationPage = lazy(() => import('@/pages/PresentationPage'));
const WhitepaperPage = lazy(() => import('@/pages/WhitepaperPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const TokenSalePage = lazy(() => import('@/pages/TokenSalePage'));
const InvestApplyPage = lazy(() => import('@/pages/InvestApplicationPage'));
const TIIFConferencePage = lazy(() => import('@/pages/TIIFConferencePage'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const RegulatoryPage = lazy(() => import('@/pages/RegulatoryPage'));
const BlockchainPage = lazy(() => import('@/pages/BlockchainPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const QRSharePage = lazy(() => import('@/pages/QRSharePage'));
const TechMarketplacePage = lazy(() => import('@/pages/TechMarketplacePage'));
const EcosystemPage = lazy(() => import('@/pages/EcosystemPage'));
const IoTPage = lazy(() => import('@/pages/IoTPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const UpdatesPage = lazy(() => import('@/pages/UpdatesPage'));
const AralNexusPage = lazy(() => import('@/pages/AralNexusPage'));
const AralWhitepaperPage = lazy(() => import('@/pages/AralWhitepaperPage'));
const ConstructorPage = lazy(() => import('@/pages/ConstructorPage'));
const DAOPage = lazy(() => import('@/pages/DAOPage'));
const DirectionsPage = lazy(() => import('@/pages/DirectionsPage'));
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage'));
const GenesisPage = lazy(() => import('@/pages/GenesisPage'));

// UX/UI style prototypes (linked from /updates)
const ObjectTwinHUD = lazy(() => import('@/pages/prototypes/ObjectTwinHUD'));
const ProjectGlass = lazy(() => import('@/pages/prototypes/ProjectGlass'));
const SubjectBI = lazy(() => import('@/pages/prototypes/SubjectBI'));
const MonitorHeatmap = lazy(() => import('@/pages/prototypes/MonitorHeatmap'));
const RDBento = lazy(() => import('@/pages/prototypes/RDBento'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-white/30 text-sm">
        <div className="w-4 h-4 border-2 border-cyan-400/40 border-t-transparent rounded-full animate-spin" />
        Загрузка...
      </div>
    </div>
  );
}

export default function App() {
  // Show splash only on very first visit
  const [showSplash, setShowSplash] = useState(() => {
    const seen = localStorage.getItem('arkheosium-splash-seen');
    return !seen;
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    localStorage.setItem('arkheosium-splash-seen', '1');
  }, []);

  const { requestPermission } = useAlertNotifications(true);
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Splash screen (first visit only) */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main app */}
      {!showSplash && (
        <>
          <Header />
          <CommandPalette />
          <PWAInstallBanner />

          <ErrorBoundary resetKey={location}>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/">
                <GlobePage />
              </Route>
              <Route path="/map">
                <MapPage />
              </Route>
              <Route path="/whitepaper">
                <ExplorePage />
              </Route>
              <Route path="/hub">
                <ProjectHubPage />
              </Route>
              <Route path="/hub/objects">
                <ObjectsPage />
              </Route>
              <Route path="/hub/subjects">
                <SubjectsPage />
              </Route>
              <Route path="/hub/projects">
                <ProjectsPage />
              </Route>
              <Route path="/hub/object/:id">
                {(params) => <ObjectDetailPage id={params.id} />}
              </Route>
              <Route path="/hub/subject/:id">
                {(params) => <SubjectDetailPage id={params.id} />}
              </Route>
              <Route path="/hub/project/:id">
                {(params) => <ProjectDetailPage id={params.id} />}
              </Route>
              <Route path="/rd">
                <RDPage />
              </Route>
              <Route path="/rd/:id">
                {(params) => <RDDetailPage id={params.id} />}
              </Route>
              <Route path="/catalog">
                <CatalogPage />
              </Route>
              <Route path="/catalog/technology/:id">
                {(params) => <CatalogDetailPage type="technology" id={params.id} />}
              </Route>
              <Route path="/catalog/equipment/:id">
                {(params) => <CatalogDetailPage type="equipment" id={params.id} />}
              </Route>
              <Route path="/community">
                <CommunityPage />
              </Route>
              <Route path="/dashboard">
                <DashboardPage />
              </Route>
              <Route path="/invest">
                <InvestPage />
              </Route>
              <Route path="/contacts">
                <ContactsPage />
              </Route>
              <Route path="/contacts/stakeholder/:id">
                {() => <StakeholderDetailPage />}
              </Route>
              <Route path="/contacts/organization/:id">
                {() => <OrganizationDetailPage />}
              </Route>
              <Route path="/settings">
                <SettingsPage />
              </Route>
              <Route path="/profile">
                <ProfilePage />
              </Route>
              <Route path="/messages">
                <MessagesPage />
              </Route>
              <Route path="/workspace">
                <WorkspacePage />
              </Route>
              <Route path="/activate/:id">
                {(params) => <ActivatePage id={params.id} />}
              </Route>
              <Route path="/admin/invites">
                <AdminInvitePage />
              </Route>
              <Route path="/account">
                <AuthPage />
              </Route>
              <Route path="/presentation">
                <PresentationPage />
              </Route>
              <Route path="/vod-whitepaper">
                <WhitepaperPage />
              </Route>
              <Route path="/welcome">
                <LandingPage />
              </Route>
              <Route path="/token-sale">
                <TokenSalePage />
              </Route>
              <Route path="/invest/apply">
                <InvestApplyPage />
              </Route>
              <Route path="/conference/tiif-2026">
                <TIIFConferencePage />
              </Route>
              <Route path="/hub/object/:id/twin">
                <DigitalTwinPage />
              </Route>
              <Route path="/analytics">
                <AnalyticsPage />
              </Route>
              <Route path="/regulatory">
                <RegulatoryPage />
              </Route>
              <Route path="/blockchain">
                <BlockchainPage />
              </Route>
              <Route path="/onboard">
                <OnboardingPage />
              </Route>
              <Route path="/activate">
                <OnboardingPage />
              </Route>
              <Route path="/qr/:role">
                <QRSharePage />
              </Route>
              <Route path="/tech-marketplace">
                <TechMarketplacePage />
              </Route>
              <Route path="/ecosystem">
                <EcosystemPage />
              </Route>
              <Route path="/iot">
                <IoTPage />
              </Route>
              <Route path="/alerts">
                <AlertsPage />
              </Route>
              <Route path="/documents">
                <DocumentsPage />
              </Route>
              <Route path="/updates">
                <UpdatesPage />
              </Route>
              <Route path="/aral-nexus">
                <AralNexusPage />
              </Route>
              <Route path="/constructor">
                <ConstructorPage />
              </Route>
              <Route path="/dao">
                <DAOPage />
              </Route>
              <Route path="/directions">
                <DirectionsPage />
              </Route>
              <Route path="/simulator">
                <SimulatorPage />
              </Route>
              <Route path="/genesis">
                <GenesisPage />
              </Route>
              <Route path="/aral-whitepaper">
                <AralWhitepaperPage />
              </Route>
              <Route path="/proto/object-hud">
                <ObjectTwinHUD />
              </Route>
              <Route path="/proto/project-glass">
                <ProjectGlass />
              </Route>
              <Route path="/proto/subject-bi">
                <SubjectBI />
              </Route>
              <Route path="/proto/monitor-heatmap">
                <MonitorHeatmap />
              </Route>
              <Route path="/proto/rd-bento">
                <RDBento />
              </Route>
              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          </Suspense>
          </ErrorBoundary>
          <NotificationPermissionBanner onRequest={requestPermission} />
          <MobileTabBar />
        </>
      )}
    </QueryClientProvider>
  );
}
