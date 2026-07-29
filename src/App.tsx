import { useState, useCallback, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Switch, useLocation } from 'wouter';
import PlatformOnboarding from '@/components/onboarding/PlatformOnboarding';
import { usePlatformOnboarding } from '@/components/onboarding/usePlatformOnboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Header } from '@/components/layout/Header';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { CommandPalette } from '@/components/CommandPalette';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lazyRoute } from '@/lib/lazyRoute';
import NetworkMeshBackground from '@/components/NetworkMeshBackground';
import { NotificationPermissionBanner } from '@/components/NotificationPermissionBanner';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import SplashScreen from '@/pages/SplashScreen';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy-loaded pages
const GlobePage  = lazyRoute(() => import('@/pages/EarthGlobePage'));
const MapPage = lazyRoute(() => import('@/pages/WorldMapPage'));
const ProjectHubPage = lazyRoute(() => import('@/pages/ProjectHubPage'));
const InvestPage = lazyRoute(() => import('@/pages/InvestFlowPage'));
const ContactsPage = lazyRoute(() => import('@/pages/ContactsPage'));
const SettingsPage = lazyRoute(() => import('@/pages/SettingsPage'));
const AuthPage = lazyRoute(() => import('@/pages/AuthPage'));
const ObjectDetailPage = lazyRoute(() => import('@/pages/ObjectDetailPage'));
const SubjectDetailPage = lazyRoute(() => import('@/pages/SubjectDetailPage'));
const ProjectDetailPage = lazyRoute(() => import('@/pages/ProjectDetailPage'));
const RDPage = lazyRoute(() => import('@/pages/RDPage'));
const RDDetailPage = lazyRoute(() => import('@/pages/RDDetailPage'));
const CatalogPage = lazyRoute(() => import('@/pages/CatalogPage'));
const CatalogDetailPage = lazyRoute(() => import('@/pages/CatalogDetailPage'));
const ExplorePage = lazyRoute(() => import('@/pages/ExplorePage'));
const DashboardPage = lazyRoute(() => import('@/pages/DashboardPage'));
const CommunityPage = lazyRoute(() => import('@/pages/CommunityPage'));
const ProfilePage = lazyRoute(() => import('@/pages/ProfilePage'));
const MessagesPage = lazyRoute(() => import('@/pages/MessagesPage'));
const StakeholderDetailPage = lazyRoute(() => import('@/pages/StakeholderDetailPage'));
const OrganizationDetailPage = lazyRoute(() => import('@/pages/OrganizationDetailPage'));
const WorkspacePage = lazyRoute(() => import('@/pages/WorkspacePage'));
const AdminInvitePage = lazyRoute(() => import('@/pages/AdminInvitePage'));
const ActivatePage = lazyRoute(() => import('@/pages/ActivatePage'));
const ObjectsPage = lazyRoute(() => import('@/pages/ObjectsPage'));
const SubjectsPage = lazyRoute(() => import('@/pages/SubjectsPage'));
const ProjectsPage = lazyRoute(() => import('@/pages/ProjectsPage'));
const PresentationPage = lazyRoute(() => import('@/pages/PresentationPage'));
const WhitepaperPage = lazyRoute(() => import('@/pages/WhitepaperPage'));
const WhitepaperFullPage = lazyRoute(() => import('@/pages/WhitepaperFullPage'));
const LandingPage = lazyRoute(() => import('@/pages/LandingPage'));
const TokenSalePage = lazyRoute(() => import('@/pages/TokenSalePage'));
const InvestApplyPage = lazyRoute(() => import('@/pages/InvestApplicationPage'));
const TIIFConferencePage = lazyRoute(() => import('@/pages/TIIFConferencePage'));
const DigitalTwinPage = lazyRoute(() => import('@/pages/DigitalTwinPage'));
const AnalyticsPage = lazyRoute(() => import('@/pages/AnalyticsPage'));
const RegulatoryPage = lazyRoute(() => import('@/pages/RegulatoryPage'));
const BlockchainPage = lazyRoute(() => import('@/pages/BlockchainPage'));
const OnboardingPage = lazyRoute(() => import('@/pages/OnboardingPage'));
const QRSharePage = lazyRoute(() => import('@/pages/QRSharePage'));
const TechMarketplacePage = lazyRoute(() => import('@/pages/TechMarketplacePage'));
const EcosystemPage = lazyRoute(() => import('@/pages/EcosystemPage'));
const IoTPage = lazyRoute(() => import('@/pages/IoTPage'));
const AlertsPage = lazyRoute(() => import('@/pages/AlertsPage'));
const DocumentsPage = lazyRoute(() => import('@/pages/DocumentsPage'));
const UpdatesPage = lazyRoute(() => import('@/pages/UpdatesPage'));
const AralNexusPage = lazyRoute(() => import('@/pages/AralNexusPage'));
const AralWhitepaperPage = lazyRoute(() => import('@/pages/AralWhitepaperPage'));
const ConstructorPage = lazyRoute(() => import('@/pages/ConstructorPage'));
const DAOPage = lazyRoute(() => import('@/pages/DAOPage'));
const DirectionsPage = lazyRoute(() => import('@/pages/DirectionsPage'));
const SimulatorPage = lazyRoute(() => import('@/pages/SimulatorPage'));
const GenesisPage = lazyRoute(() => import('@/pages/GenesisPage'));
const ProjectLabPage = lazyRoute(() => import('@/pages/ProjectLabPage'));
const SitePage = lazyRoute(() => import('@/pages/SitePage'));
const LandingPromoPage = lazyRoute(() => import('@/pages/LandingPromoPage'));
const AralSeaProjectPage = lazyRoute(() => import('@/pages/AralSeaProjectPage'));
const InnovationsPage = lazyRoute(() => import('@/pages/InnovationsPage'));
const TokenomicsPage = lazyRoute(() => import('@/pages/TokenomicsPage'));
const NewsFeedPage = lazyRoute(() => import('@/pages/NewsFeedPage'));
const RoadmapPage = lazyRoute(() => import('@/pages/RoadmapPage'));
const SatellitePage = lazyRoute(() => import('@/pages/SatellitePage'));
const SensorsPage = lazyRoute(() => import('@/pages/SensorsPage'));
const WaterRecoveryPage = lazyRoute(() => import('@/pages/WaterRecoveryPage'));
const ClimatePage = lazyRoute(() => import('@/pages/ClimatePage'));
const RoboticsPage = lazyRoute(() => import('@/pages/RoboticsPage'));
const OpenSciencePage = lazyRoute(() => import('@/pages/OpenSciencePage'));
const EnergyPage = lazyRoute(() => import('@/pages/EnergyPage'));
const TransportPage = lazyRoute(() => import('@/pages/TransportPage'));
const AgritechPage = lazyRoute(() => import('@/pages/AgritechPage'));
const CityPage = lazyRoute(() => import('@/pages/CityPage'));
const CircularPage = lazyRoute(() => import('@/pages/CircularPage'));
const ObservatoryPage = lazyRoute(() => import('@/pages/ObservatoryPage'));
const EcoJourneyPage = lazyRoute(() => import('@/pages/EcoJourneyPage'));

// UX/UI style prototypes (linked from /updates)
const ObjectTwinHUD = lazyRoute(() => import('@/pages/prototypes/ObjectTwinHUD'));
const ProjectGlass = lazyRoute(() => import('@/pages/prototypes/ProjectGlass'));
const SubjectBI = lazyRoute(() => import('@/pages/prototypes/SubjectBI'));
const MonitorHeatmap = lazyRoute(() => import('@/pages/prototypes/MonitorHeatmap'));
const RDBento = lazyRoute(() => import('@/pages/prototypes/RDBento'));

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
  const [location, setLocation] = useLocation();

  // Platform-wide first-visit onboarding gate (shown once the splash clears).
  const { showOnboarding, completeOnboarding } = usePlatformOnboarding();
  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    // Route the user into the app (default target).
    if (location !== '/') setLocation('/');
  }, [completeOnboarding, location, setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Splash screen (first visit only) */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Platform-wide first-visit onboarding (after splash, before app use) */}
      <AnimatePresence>
        {!showSplash && showOnboarding && (
          <PlatformOnboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Animated network-mesh background (behind all content) */}
      {!showSplash && <NetworkMeshBackground />}

      {/* Main app */}
      {!showSplash && (
        <div className="relative z-10">
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
              <Route path="/whitepaper-full">
                <WhitepaperFullPage />
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
              <Route path="/auth">
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
              <Route path="/lab">
                <ProjectLabPage />
              </Route>
              <Route path="/site">
                <SitePage />
              </Route>
              <Route path="/landing">
                <LandingPromoPage />
              </Route>
              <Route path="/aral">
                <AralSeaProjectPage />
              </Route>
              <Route path="/innovations">
                <InnovationsPage />
              </Route>
              <Route path="/tokenomics">
                <TokenomicsPage />
              </Route>
              <Route path="/news">
                <NewsFeedPage />
              </Route>
              <Route path="/roadmap">
                <RoadmapPage />
              </Route>
              <Route path="/satellite">
                <SatellitePage />
              </Route>
              <Route path="/sensors">
                <SensorsPage />
              </Route>
              <Route path="/water-recovery">
                <WaterRecoveryPage />
              </Route>
              <Route path="/climate">
                <ClimatePage />
              </Route>
              <Route path="/robotics">
                <RoboticsPage />
              </Route>
              <Route path="/open-science">
                <OpenSciencePage />
              </Route>
              <Route path="/energy">
                <EnergyPage />
              </Route>
              <Route path="/transport">
                <TransportPage />
              </Route>
              <Route path="/agritech">
                <AgritechPage />
              </Route>
              <Route path="/city">
                <CityPage />
              </Route>
              <Route path="/circular">
                <CircularPage />
              </Route>
              <Route path="/observatory">
                <ObservatoryPage />
              </Route>
              <Route path="/journey">
                <EcoJourneyPage />
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
        </div>
      )}
    </QueryClientProvider>
  );
}
