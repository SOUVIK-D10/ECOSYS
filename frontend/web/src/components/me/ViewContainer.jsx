import React from 'react'

import Homepage from '../pages/Homepage';
import ActiveTasks from '../pages/ActiveTasks';
import Projects from '../pages/Projects';
import Planning from '../pages/Planning';
import Teams from '../pages/Teams';
import Settings from '../pages/Settings';
import { TabProvider, useTab } from '../../context/useTab';

const ViewContainer = () => {
  const { currentTab } = useTab();

  const renderView = () => {
    switch (currentTab) {
      case 'HOME':
        return <Homepage />;
      case 'ACTIVE TASKS':
        return <ActiveTasks />;
      case 'PROJECTS':
        return <Projects />;
      case 'PLANNING':
        return <Planning />;
      case 'TEAMS':
        return <Teams />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Homepage />;
    }
  };

  return (
    <main className="flex-1 h-screen overflow-hidden bg-[#1a1a1a]">
      {renderView()}
    </main>
  );
}

export default ViewContainer
