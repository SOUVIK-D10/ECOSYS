import React, { useEffect, useRef } from 'react';
import Navbar from './components/me/Navbar';
import ViewContainer from './components/me/ViewContainer';
import { TabProvider} from './context/useTab';


export default function App() {

  return (
    <TabProvider initialTab="HOME">
      <div className="flex h-screen w-screen overflow-hidden bg-[#121212]">
        <Navbar />
        <ViewContainer />
      </div>
    </TabProvider>
  );

}