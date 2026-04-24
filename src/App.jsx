import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle2,
  X,
  Clock,
  FileEdit,
  Plane,
  ArrowRight,
  MapPin,
  Send,
  Menu,
  LogIn,
  LogOut,
  Loader2,
  Star,
  Bookmark,
  Info,
  Home
} from 'lucide-react';
import LeaveRequest from './LeaveRequest';
import SidebarMenu from './components/SidebarMenu';
import Login from './components/Login';



/**
 * MAIN APP COMPONENT
 */
const App = () => {
  const [currentView, setCurrentView] = useState('calendar');
  const [portalMode, setPortalMode] = useState('leave'); // 'leave' or 'outDuty'
  const [expandedDayIdx, setExpandedDayIdx] = useState(null);
  const [selectedDay, setSelectedDay] = useState(14);
  const [activeAction, setActiveAction] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDataChanging, setIsDataChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const [isSundaySelected, setIsSundaySelected] = useState(false);
  const [selectedHolidayName, setSelectedHolidayName] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const loaderIntervalRef = useRef(null);

  const [step, setStep] = useState('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [currentPunchData, setCurrentPunchData] = useState({ in: "09:00 AM", out: "06:00 PM" });

  // State for correction form
  const [punchIn, setPunchIn] = useState({ hour: "09", min: "00", period: "AM" });
  const [punchOut, setPunchOut] = useState({ hour: "06", min: "00", period: "PM" });
  const [pickingTimeFor, setPickingTimeFor] = useState(null);
  const [clockPhase, setClockPhase] = useState('hour');

  const monthName = "February";
  const displayYear = 2026;

  // Mock status assignments
  const statusData = {
    fullPunch: [2, 3, 4, 6, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20],
    partialPunch: [5, 12, 21, 24],
    noPunch: [23, 25],
    approvedLeave: [7],
    pendingLeave: [8, 22],
    holiday: [28]
  };

  const holidayNames = {
    28: "Maha Shivaratri"
  };

  const events = [
    { day: 1, title: 'All Day Event' },
    { day: 7, title: 'Long Event' },
    { day: 28, title: 'External Meeting' },
  ];

  const getPunchForDay = (day) => {
    if (!day) return { in: "--:-- --", out: "--:-- --" };
    const inTime = `09:${(day % 15).toString().padStart(2, '0')} AM`;
    const outTime = `06:${(day % 12).toString().padStart(2, '0')} PM`;
    return { in: inTime, out: outTime };
  };

  const calendarGrid = useMemo(() => {
    const grid = [];
    const prevDays = [26, 27, 28, 29, 30, 31];
    prevDays.forEach(d => grid.push({ day: d, currentMonth: false }));
    for (let i = 1; i <= 28; i++) grid.push({ day: i, currentMonth: true });
    const nextDays = [1, 2, 3, 4, 5, 6, 7, 8];
    nextDays.forEach(d => grid.push({ day: d, currentMonth: false }));
    return grid.slice(0, 42);
  }, []);

  const handleMobileSubmit = () => {
    if (mobileNumber.length > 0) {
      setIsLoginLoading(true);
      setTimeout(() => {
        setIsLoginLoading(false);
        // Check if mobileNumber is exactly 10 digits
        const isMobile = /^\d{10}$/.test(mobileNumber);
        if (isMobile) {
          setStep('otp');
        } else {
          setStep('password');
        }
      }, 600);
    }
  };

  const handlePasswordSubmit = () => {
    if (password.length > 0) {
      setIsLoginLoading(true);
      setTimeout(() => {
        setIsLoginLoading(false);
        setStep('home');
      }, 1000);
    }
  };

  const handleOtpChange = (index, value) => {
    const newVal = value.replace(/\D/g, '');
    if (!newVal && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = newVal.substring(newVal.length - 1);
    setOtp(newOtp);
    if (newVal && index < 3) {
      const inputs = document.querySelectorAll('input[type="tel"]');
      if (inputs[index + 1]) inputs[index + 1].focus();
    }
  };

  const handleVerifyOtp = () => {
    if (otp.every(v => v !== '')) {
      setIsLoginLoading(true);
      setTimeout(() => {
        setIsLoginLoading(false);
        setStep('home');
      }, 1000);
    }
  };

  const handleMenuNavigation = (label) => {
    const action = label.toLowerCase();
    if (action === 'apply leave') {
      setPortalMode('leave');
      setCurrentView('leaveRequest');
    } else if (action === 'apply outduty') {
      setPortalMode('outDuty');
      setCurrentView('leaveRequest');
    } else if (action === 'leave history') {
      // User requested leave history to open medical history
      setPortalMode('leave');
      setCurrentView('medicalHistory'); // We'll need to handle this view
    } else if (action === 'my attendance') {
      setCurrentView('calendar');
    }
    setIsMenuOpen(false);
  };

  const closeExpanded = () => {
    setExpandedDayIdx(null);
    setActiveAction(null);
    setIsSubmitted(false);
    setPickingTimeFor(null);
  };

  const startLoaderAndOpen = (idx, cell) => {
    if (!cell.currentMonth) return;
    setSelectedDay(cell.day);
    setCurrentPunchData(getPunchForDay(cell.day));
    setIsDataChanging(true);
    setTimeout(() => setIsDataChanging(false), 300);

    setIsLoading(true);
    setLoadingProgress(0);
    if (loaderIntervalRef.current) clearInterval(loaderIntervalRef.current);
    setIsSundaySelected(idx % 7 === 0);
    setSelectedHolidayName(cell.currentMonth && holidayNames[cell.day] ? holidayNames[cell.day] : null);
    const startTime = Date.now();
    loaderIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(loaderIntervalRef.current);
        setIsLoading(false);
        setExpandedDayIdx(idx);
      }
    }, 50);
  };

  const KPITile = ({ label, value, subLabel, onClick }) => (
    <div onClick={onClick} className="p-5 border-r border-b border-gray-100 flex flex-col justify-between active:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-[#D32F2F]" />
          <span className="text-[10px] font-black text-[#3C4043] uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-2xl font-bold text-[#1A1D21] leading-none">{value}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{subLabel}</span>
      </div>
    </div>
  );

  const VisualClockPicker = ({ currentVal, onSelect, onClose }) => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
    const items = clockPhase === 'hour' ? hours : minutes;
    const rotation = clockPhase === 'hour' ? (parseInt(currentVal.hour) % 12) * 30 : parseInt(currentVal.min) * 6;

    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="flex items-center bg-gray-50 rounded-2xl p-1 shadow-inner border border-gray-100">
            <button
              onClick={() => setClockPhase('hour')}
              className={`px-4 py-1.5 text-xl font-black rounded-xl transition-all ${clockPhase === 'hour' ? 'bg-white text-[#D32F2F] shadow-md' : 'text-gray-300'}`}
            >
              {currentVal.hour}
            </button>
            <span className="text-xl font-bold text-gray-200 mx-0.5">:</span>
            <button
              onClick={() => setClockPhase('minute')}
              className={`px-4 py-1.5 text-xl font-black rounded-xl transition-all ${clockPhase === 'minute' ? 'bg-white text-[#D32F2F] shadow-md' : 'text-gray-300'}`}
            >
              {currentVal.min}
            </button>
          </div>

          {/* AM / PM Toggles */}
          <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button
              onClick={() => onSelect({ ...currentVal, period: 'AM' })}
              className={`px-6 py-1.5 text-[10px] font-black rounded-lg transition-all ${currentVal.period === 'AM' ? 'bg-[#D32F2F] text-white shadow-sm' : 'text-gray-300'}`}
            >
              AM
            </button>
            <button
              onClick={() => onSelect({ ...currentVal, period: 'PM' })}
              className={`px-6 py-1.5 text-[10px] font-black rounded-lg transition-all ${currentVal.period === 'PM' ? 'bg-[#D32F2F] text-white shadow-sm' : 'text-gray-300'}`}
            >
              PM
            </button>
          </div>
        </div>

        <div className="relative w-40 h-40 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center shadow-inner mb-6">
          <div className="absolute w-2 h-2 bg-[#D32F2F] rounded-full z-30"></div>
          {items.map((item, i) => {
            const angle = (i * 30) - 90;
            const x = 60 * Math.cos((angle * Math.PI) / 180);
            const y = 60 * Math.sin((angle * Math.PI) / 180);
            const isMatch = clockPhase === 'hour' ? parseInt(currentVal.hour) === item : parseInt(currentVal.min) === parseInt(item);
            return (
              <div key={i} className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors cursor-pointer ${isMatch ? 'text-white bg-[#D32F2F]' : 'text-gray-400 hover:bg-gray-50'}`} style={{ transform: `translate(${x}px, ${y}px)` }} onClick={() => {
                if (clockPhase === 'hour') { onSelect({ ...currentVal, hour: item.toString().padStart(2, '0') }); setClockPhase('minute'); }
                else { onSelect({ ...currentVal, min: item.toString().padStart(2, '0') }); }
              }}>{item}</div>
            );
          })}
          <div className="absolute inset-0 z-10 pointer-events-none transition-transform duration-300" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className="absolute left-1/2 bottom-1/2 -translate-x-1/2 w-0.5 bg-[#D32F2F] h-[60px] origin-bottom rounded-full opacity-30"></div>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-[#3C4043] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Save Selection</button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#3C4043] flex flex-col max-w-md mx-auto relative border-x border-gray-100 overscroll-y-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .mobile-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: calc(100% - 32px); max-height: 85%; background: white; z-index: 2000; border-radius: 28px; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; }
        .mobile-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.45); z-index: 1999; backdrop-filter: blur(2px); }
        .cell-piano { position: relative; overflow: hidden; touch-action: manipulation; }
      `}</style>

      <Login
        step={step}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        setStep={setStep}
        password={password}
        setPassword={setPassword}
        otp={otp}
        handleOtpChange={handleOtpChange}
        handleMobileSubmit={handleMobileSubmit}
        handlePasswordSubmit={handlePasswordSubmit}
        handleVerifyOtp={handleVerifyOtp}
        isLoading={isLoginLoading}
      />

      {step === 'home' && (
        <div className="flex-1 flex flex-col w-full h-full animate-fade-in relative">
          {(currentView === 'leaveRequest' || currentView === 'medicalHistory') ? (
            <div className="flex-1 overflow-hidden h-full pb-28">
              <LeaveRequest
                onBack={() => setCurrentView('calendar')}
                mode={portalMode}
                onMenuClick={() => setIsMenuOpen(true)}
                initialViewMode={currentView === 'medicalHistory' ? 'medical' : 'calendar'}
              />
            </div>
          ) : (
            <>
              <header className="p-4 flex justify-between items-center flex-shrink-0">
                <h1 className="text-xl font-black tracking-tight text-[#1A1D21]">My Attendance</h1>
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 -mr-2 hover:bg-red-50 rounded-full transition-colors outline-none active:scale-90 bg-transparent border-none"
                >
                  <Menu size={24} className="text-[#D32F2F]" />
                </button>
              </header>

              <section className="mx-4 bg-white border border-gray-100 rounded-3xl grid grid-cols-2 overflow-hidden shadow-sm flex-shrink-0">
                <KPITile label="Working Days" value="14/20" subLabel="Progress" />
                <KPITile label="Holidays" value="02" subLabel="Scheduled" />
                <KPITile label="Corrections" value="04" subLabel="Pending" />
                <KPITile label="Leaves" value="12" subLabel="Available" onClick={() => { setPortalMode('leave'); setCurrentView('leaveRequest'); }} />
              </section>

              <div className="mx-4 mt-4 bg-[#D32F2F] rounded-3xl p-6 text-white flex flex-col shadow-lg shadow-red-100 flex-shrink-0 relative overflow-hidden transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-6xl font-extrabold tracking-tighter leading-none" key={`selected-${selectedDay}`}>{selectedDay}</span>
                    <div className="flex flex-col pt-1.5 uppercase font-black tracking-[0.1em] leading-none">
                      <span className="text-[12px] opacity-70">Feb</span>
                      <span className="text-[12px]">{displayYear}</span>
                    </div>
                  </div>
                  {isSundaySelected || selectedHolidayName ? (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black tracking-[0.1em] text-white/90 uppercase">
                        {isSundaySelected ? 'SUNDAY' : 'HOLIDAY'}
                      </span>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">
                        {isSundaySelected ? 'Weekly Off' : selectedHolidayName}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex flex-col items-end gap-1 transition-all duration-300 ${isDataChanging ? 'opacity-40 translate-x-2' : 'opacity-100'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black opacity-60 tracking-[0.2em]">IN</span>
                        <span className="text-[15px] font-bold tracking-tight">{currentPunchData.in}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black opacity-60 tracking-[0.2em]">OUT</span>
                        <span className="text-[15px] font-bold tracking-tight">{currentPunchData.out}</span>
                      </div>
                    </div>
                  )}
                </div>
                {isLoading && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10">
                    <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${loadingProgress}%` }} />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                <h2 className="text-base font-black text-[#1A1D21] tracking-tight">{monthName} {displayYear}</h2>
                <div className="flex bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                  <button className="p-2 text-[#D32F2F] border-r border-gray-100 active:bg-gray-100"><ChevronLeft size={16} /></button>
                  <button className="p-2 text-[#D32F2F] active:bg-gray-100"><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="flex-1 px-4 pb-28">
                <div className="bg-white border-t border-l border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-7 bg-white border-b border-gray-200">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <div key={idx} className={`py-2.5 text-center text-[9px] font-black uppercase tracking-widest border-r border-gray-200 ${idx === 0 ? 'text-red-500' : 'text-gray-400'}`}>{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarGrid.map((cell, idx) => {
                      const isFull = statusData.fullPunch.includes(cell.day) && cell.currentMonth;
                      const isPartial = statusData.partialPunch.includes(cell.day) && cell.currentMonth;
                      const isAbsent = statusData.noPunch.includes(cell.day) && cell.currentMonth;
                      const isApproved = statusData.approvedLeave.includes(cell.day) && cell.currentMonth;
                      const isPending = statusData.pendingLeave.includes(cell.day) && cell.currentMonth;
                      const isHoliday = statusData.holiday.includes(cell.day) && cell.currentMonth;
                      const isSelected = cell.currentMonth && cell.day === selectedDay;
                      const isSunday = idx % 7 === 0;

                      let badgeClass = "text-gray-400";
                      if (cell.currentMonth) {
                        if (isSunday) badgeClass = "text-red-700 font-black";
                        else if (isAbsent) badgeClass = "bg-red-500 text-white";
                        else if (isFull) badgeClass = "bg-emerald-500 text-white";
                        else if (isPartial) badgeClass = "bg-amber-400 text-white";
                        else if (isApproved || isHoliday || isPending) badgeClass = "text-gray-800 font-black";
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => startLoaderAndOpen(idx, cell)}
                          className={`relative h-16 border-r border-b border-gray-200 bg-white flex flex-col transition-colors ${!cell.currentMonth ? 'bg-white' : ''} ${isSelected ? 'bg-red-50/30' : 'active:bg-red-50'}`}
                        >
                          <div className="absolute top-1 left-1 flex gap-0.5">
                            {isHoliday && cell.currentMonth && <Star size={9} className="text-red-500 fill-current" />}
                            {(isApproved || isPending) && cell.currentMonth && <Bookmark size={9} className={`${isApproved ? 'text-emerald-500' : 'text-amber-400'} fill-current`} />}
                          </div>
                          <div className="flex justify-end p-1">
                            <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-md transition-all 
                          ${badgeClass}
                          ${isSelected ? 'ring-2 ring-[#D32F2F] ring-offset-0 scale-105 shadow-sm' : ''}
                          ${!cell.currentMonth ? 'opacity-20' : ''}`}>
                              {cell.day}
                            </span>
                          </div>
                          <div className="absolute bottom-1 flex w-full gap-0.5 justify-center">
                            {events.filter(e => e.day === cell.day && cell.currentMonth).map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-[#D32F2F] rounded-full" />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 px-4">
                  <button
                    onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                    className="flex items-center gap-3 active:opacity-70 transition-opacity outline-none"
                  >
                    <div className="flex -space-x-3 items-center">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-black">F</div>
                      <div className="w-7 h-7 rounded-lg bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-black">P</div>
                      <div className="w-7 h-7 rounded-lg bg-red-500 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-black">A</div>
                      <div className="w-7 h-7 rounded-lg bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center"><Star size={11} className="text-red-500 fill-current" /></div>
                      <div className="w-7 h-7 rounded-lg bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center"><Bookmark size={11} className="text-emerald-500 fill-current" /></div>
                    </div>
                    <ArrowRight size={18} className={`text-[#D32F2F] transition-transform duration-300 ${isLegendExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isLegendExpanded && (
                    <div className="mt-4 grid grid-cols-3 gap-y-3 gap-x-2 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Full Punch</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Partial</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Absent</span></div>
                      <div className="flex items-center gap-2"><Bookmark size={10} className="text-emerald-500 fill-current" /><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Leave</span></div>
                      <div className="flex items-center gap-2"><Bookmark size={10} className="text-amber-400 fill-current" /><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Pending</span></div>
                      <div className="flex items-center gap-2"><Star size={10} className="text-red-500 fill-current" /><span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Holiday</span></div>
                    </div>
                  )}
                </div>
                <div className="h-8" />
              </div>
            </>
          )}

          {expandedDayIdx !== null && (
            <>
              <div className="mobile-backdrop" onClick={closeExpanded} />
              <div className="mobile-modal animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {activeAction && (
                      <button onClick={() => { setActiveAction(null); setPickingTimeFor(null); }} className="p-1 hover:bg-gray-50 rounded-full active:scale-90 transition-transform">
                        <ArrowLeft size={20} className="text-gray-600" />
                      </button>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-[#1A1D21] leading-none">{selectedDay} {monthName}</span>
                      <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest leading-none mt-1.5">
                        {activeAction ? 'ADJUSTMENT' : 'QUICK ACTIONS'}
                      </span>
                    </div>
                  </div>
                  <button onClick={closeExpanded} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-300"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4">
                  {isSubmitted ? (
                    <div className="py-10 flex flex-col items-center text-center">
                      <CheckCircle2 size={56} className="text-emerald-500 mb-4" />
                      <p className="font-black text-gray-800">Done!</p>
                      <button onClick={closeExpanded} className="mt-6 px-10 py-3 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">Close</button>
                    </div>
                  ) : pickingTimeFor ? (
                    <VisualClockPicker
                      currentVal={pickingTimeFor === 'in' ? punchIn : punchOut}
                      onSelect={pickingTimeFor === 'in' ? setPunchIn : setPunchOut}
                      onClose={() => setPickingTimeFor(null)}
                    />
                  ) : activeAction === 'correction' ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">IN</label>
                          <button onClick={() => { setPickingTimeFor('in'); setClockPhase('hour'); }} className="w-full p-4 bg-gray-50/80 rounded-2xl font-bold text-base flex justify-between items-center outline-none">
                            <span className="text-[#3C4043]">{punchIn.hour}:{punchIn.min} <span className="text-[10px] opacity-60">{punchIn.period}</span></span>
                            <Clock size={16} className="text-[#D32F2F]" />
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">OUT</label>
                          <button onClick={() => { setPickingTimeFor('out'); setClockPhase('hour'); }} className="w-full p-4 bg-gray-50/80 rounded-2xl font-bold text-base flex justify-between items-center outline-none">
                            <span className="text-[#3C4043]">{punchOut.hour}:{punchOut.min} <span className="text-[10px] opacity-60">{punchOut.period}</span></span>
                            <Clock size={16} className="text-[#D32F2F]" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <textarea className="w-full p-4 bg-gray-50/80 border-none rounded-2xl text-[15px] font-medium h-24 resize-none focus:ring-1 focus:ring-[#D32F2F] outline-none placeholder:text-gray-300" placeholder="Briefly state reason..."></textarea>
                      </div>
                      <button onClick={() => setIsSubmitted(true)} className="w-full py-5 bg-[#D32F2F] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-red-100 active:scale-95 transition-all">Apply Update</button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in slide-in-from-bottom-2">
                      <div className="pb-2">
                        {events.filter(e => e.day === selectedDay).map((e, i) => (
                          <div key={`modal-ev-${i}`} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl mb-2">
                            <div className="w-1 h-3.5 bg-[#D32F2F] rounded-full" />
                            <span className="text-[13px] font-bold text-[#3C4043]">{e.title}</span>
                          </div>
                        ))}
                      </div>
                      {!isSundaySelected && !selectedHolidayName ? (
                        <div className="space-y-3">
                          <button onClick={() => setActiveAction('correction')} className="w-full flex items-center gap-4 p-4 bg-gray-50/50 rounded-[20px] active:bg-gray-100 transition-all">
                            <div className="w-12 h-12 bg-[#FFEBEE] rounded-[15px] flex items-center justify-center text-[#D32F2F]"><FileEdit size={22} /></div>
                            <p className="text-[15px] font-bold text-[#3C4043]">Time Correction</p>
                          </button>
                          <button onClick={() => { closeExpanded(); setPortalMode('leave'); setCurrentView('leaveRequest'); }} className="w-full flex items-center gap-4 p-4 bg-gray-50/50 rounded-[20px] active:bg-gray-100 transition-all">
                            <div className="w-12 h-12 bg-[#FFEBEE] rounded-[15px] flex items-center justify-center text-[#D32F2F]"><Plane size={22} /></div>
                            <p className="text-[15px] font-bold text-[#3C4043]">Apply Leave</p>
                          </button>
                          <button onClick={() => { closeExpanded(); setPortalMode('outDuty'); setCurrentView('leaveRequest'); }} className="w-full flex items-center gap-4 p-4 bg-gray-50/50 rounded-[20px] active:bg-gray-100 transition-all">
                            <div className="w-12 h-12 bg-[#FFEBEE] rounded-[15px] flex items-center justify-center text-[#D32F2F]"><MapPin size={22} /></div>
                            <p className="text-[15px] font-bold text-[#3C4043]">Apply Out Duty</p>
                          </button>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200">
                          <CalendarIcon size={32} className="text-gray-300 mb-2" />
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">
                            No actions available for {isSundaySelected ? 'Sunday' : (selectedHolidayName || 'Holiday')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-between pt-3 pb-5 px-6 z-[90] rounded-t-[32px] overflow-hidden shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.1)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#D32F2F]/30 to-transparent"></div>

            <button onClick={() => setCurrentView('calendar')} className="flex flex-col items-center gap-1.5 p-2 group transition-all outline-none">
              <div className={`p-2.5 rounded-2xl transition-all duration-300 pointer-events-none ${currentView === 'calendar' ? 'bg-red-50 text-[#D32F2F] scale-110 shadow-sm' : 'text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-50'}`}>
                <Home size={22} strokeWidth={currentView === 'calendar' ? 2.5 : 2} />
              </div>
            </button>

            <button onClick={() => { setPortalMode('leave'); setCurrentView('leaveRequest'); }} className="flex flex-col items-center gap-1.5 p-2 group transition-all outline-none">
              <div className={`p-2.5 rounded-2xl transition-all duration-300 pointer-events-none ${currentView === 'leaveRequest' && portalMode === 'leave' ? 'bg-red-50 text-[#D32F2F] scale-110 shadow-sm' : 'text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-50'}`}>
                <CalendarIcon size={22} strokeWidth={currentView === 'leaveRequest' && portalMode === 'leave' ? 2.5 : 2} />
              </div>
            </button>

            <button onClick={() => { setPortalMode('outDuty'); setCurrentView('leaveRequest'); }} className="flex flex-col items-center gap-1.5 p-2 group transition-all outline-none">
              <div className={`p-2.5 rounded-2xl transition-all duration-300 pointer-events-none ${currentView === 'leaveRequest' && portalMode === 'outDuty' ? 'bg-red-50 text-[#D32F2F] scale-110 shadow-sm' : 'text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-50'}`}>
                <Plane size={22} strokeWidth={currentView === 'leaveRequest' && portalMode === 'outDuty' ? 2.5 : 2} />
              </div>
            </button>

            <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1.5 p-2 group transition-all outline-none">
              <div className={`p-2.5 rounded-2xl transition-all duration-300 pointer-events-none text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-50`}>
                <Menu size={22} strokeWidth={2} />
              </div>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <SidebarMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onNavigate={handleMenuNavigation}
          />
        </div>
      )}
    </div>
  );
};

export default App;