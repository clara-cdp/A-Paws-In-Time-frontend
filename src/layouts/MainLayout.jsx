import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

import bgImg from '../assets/assets/images/bg_img.png';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-['Press_Start_2P'] selection:bg-teal-500 selection:text-black">
      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        <img src={bgImg} alt="Background" className="w-full h-full object-cover opacity-60" style={{ imageRendering: 'pixelated' }} />
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-80"></div>
      </div>

      {/* Foreground Content */}
      <div className="z-10 w-full flex flex-col min-h-screen">
        <div className="w-full">
          <Navbar />
        </div>
        
        {/* Content container spans remaining height */}
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
