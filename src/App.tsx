/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthScreen } from './components/Auth/AuthScreen';
import { ActiveCallModal } from './components/Calls/ActiveCallModal';
import { ChatArea } from './components/Chat/ChatArea';
import { DirectMessagesSidebar } from './components/Chat/DirectMessagesSidebar';
import { FriendsView } from './components/Friends/FriendsView';
import { AppHeader } from './components/Navigation/AppHeader';
import { NotificationToasts } from './components/Notifications/NotificationToasts';
import { OwnerControlPanel } from './components/Owner/OwnerControlPanel';
import { ProfileEditorModal } from './components/Profile/ProfileEditorModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ShopModal } from './components/Shop/ShopModal';
import { VoiceRoomsGallery } from './components/Voice/VoiceRoomsGallery';
import { AppProvider, useApp } from './context/AppContext';

const ModernMainLayout: React.FC = () => {
  const { activeView, isAuthenticated } = useApp();

  // If not authenticated, require registration/login first
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0c12] text-[#d6dae5] font-sans antialiased overflow-hidden select-none">
      {/* 1. Sleek Modern Top Navigation */}
      <AppHeader />

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Voice Lounges View */}
        {activeView === 'channels' && <VoiceRoomsGallery />}

        {/* Direct Messages & Calls View */}
        {activeView === 'dm' && (
          <div className="flex-1 flex overflow-hidden">
            <DirectMessagesSidebar />
            <ChatArea />
          </div>
        )}

        {/* Friends System View */}
        {activeView === 'friends' && <FriendsView />}
      </div>

      {/* 3. Interactive Modals */}
      <ActiveCallModal />
      <ProfileEditorModal />
      <SettingsModal />
      <ShopModal />
      <OwnerControlPanel />
      <NotificationToasts />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ModernMainLayout />
    </AppProvider>
  );
}
