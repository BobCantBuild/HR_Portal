import React from 'react';
import { 
  X, 
  Home, 
  CalendarDays, 
  MapPin, 
  FileText, 
  Plane, 
  AlertCircle, 
  History, 
  FileEdit, 
  Undo2 
} from 'lucide-react';

const GOOGLE_RED = '#D32F2F';

const SidebarMenu = ({ isOpen, onClose, onNavigate }) => {
  const menuItems = [
    { label: 'my attendance', icon: <Home size={20} /> },
    { label: 'apply leave', icon: <CalendarDays size={20} /> },
    { label: 'apply outduty', icon: <MapPin size={20} /> },
    { label: 'leave request', icon: <FileText size={20} /> },
    { label: 'outduty request', icon: <Plane size={20} /> },
    { label: 'unrecognized punches', icon: <AlertCircle size={20} /> },
    { label: 'leave history', icon: <History size={20} /> },
    { label: 'attendance correction requests', icon: <FileEdit size={20} /> },
    { label: 'my lop reversal', icon: <Undo2 size={20} /> },
  ];

  return (
    <>
      <style>{`
        .menu-overlay { 
          background: rgba(0,0,0,0.4); 
          backdrop-filter: blur(4px); 
          transition: opacity 0.3s ease; 
        }
        .menu-content { 
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
          background: white; 
          width: 100%; 
        }
        .menu-hidden { transform: translateX(100%); }
        .menu-visible { transform: translateX(0); }
      `}</style>

      <div className={`absolute inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} overflow-hidden`}>
        {/* Dark Backdrop Overlay */}
        <div 
          className={`menu-overlay absolute inset-0 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={onClose}
        ></div>

        {/* Sliding Menu Panel */}
        <div className={`menu-content absolute right-0 top-0 h-full shadow-2xl flex flex-col ${isOpen ? 'menu-visible' : 'menu-hidden'}`}>
          
          {/* Close Button Header */}
          <div className="p-4 flex justify-end">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-transparent border-none outline-none">
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          
          {/* Centered Profile Section */}
          <div className="flex flex-col items-center pb-8 pt-2">
            <div className="w-24 h-24 bg-[#F8FAFC] border border-gray-100 rounded-full flex items-center justify-center shadow-sm mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={GOOGLE_RED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight capitalize text-[#1A1D21]">kota harshith</h2>
          </div>
          
          {/* Navigation List */}
          <div className="flex-1 px-6 pb-12 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => onNavigate(item.label)}>
                  <div className="flex items-center gap-4 py-3.5 px-2 rounded-xl group-hover:bg-gray-50 transition-all">
                    <span className="text-gray-400 group-hover:text-[#D32F2F] transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-bold text-[#4A5568] capitalize tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  {i !== menuItems.length - 1 && (
                    <div className="h-[1px] bg-gray-50 w-full ml-12 opacity-50"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
