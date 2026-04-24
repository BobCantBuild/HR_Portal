import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  X,
  FileText,
  Eye,
  Share2,
  Plane,
  Star,
  ArrowRight,
  CalendarRange,
  ArrowRightCircle,
  Paperclip,
  UserCheck,
  Menu,
  CheckCircle2
} from 'lucide-react';

// Theme Constants
const GOOGLE_RED = '#D32F2F';
const TEXT_MAIN = '#3C4043';
const THEME_TEAL = '#00C292';

const LeaveRequest = ({ onBack, onMenuClick, mode = 'leave', initialViewMode = 'calendar' }) => {
  const [viewMode, setViewMode] = useState(initialViewMode); // 'calendar', 'medical', 'casual', 'earned'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(mode === 'outDuty' ? 'outduty' : 'casual');
  const [leaveDayType, setLeaveDayType] = useState('full'); // 'full' or 'half'

  // Month Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Default to Feb 2026

  const [viewingItem, setViewingItem] = useState(null);

  // Selection state
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoveredRangeDate, setHoveredRangeDate] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if ((isApplying || rangeEnd) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isApplying, rangeEnd]);

  const displayYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const leaveKPIs = [
    { id: 'l1', type: 'medical', label: 'Medical leaves', mainValue: '05', subText: 'Remaining' },
    { id: 'l2', type: 'casual', label: 'Casual leaves', mainValue: '08', subText: 'Remaining' },
    { id: 'l3', type: 'earned', label: 'Earned leaves', mainValue: '15', subText: 'Balance' },
    { id: 'l4', type: 'expiring', label: 'Expiring leaves', mainValue: '02', subText: 'Urgent' },
  ];

  const historyData = {
    medical: [
      { id: 1, range: "12 Jan — 14 Jan 2026", start: 12, end: 14, date: "Monday, 12 January 2026", duration: "3 Days", reason: "Suffering from viral fever and required complete bed rest as per physician's advice.", approver: "Vikram Singh" },
      { id: 2, range: "05 Nov — 05 Nov 2025", start: 5, end: 5, date: "Wednesday, 05 November 2025", duration: "1 Day", reason: "Emergency dental procedure for root canal treatment.", approver: "Vikram Singh" },
    ],
    casual: [
      { id: 4, range: "20 Feb — 21 Feb 2026", start: 20, end: 21, date: "Friday, 20 February 2026", duration: "2 Days", reason: "Attending family function out of station.", approver: "Vikram Singh" },
      { id: 5, range: "10 Dec — 10 Dec 2025", start: 10, end: 10, date: "Wednesday, 10 December 2025", duration: "1 Day", reason: "Personal work at government office.", approver: "Vikram Singh" },
    ],
    earned: [
      { id: 7, range: "01 Jan — 10 Jan 2026", start: 1, end: 10, date: "Thursday, 01 January 2026", duration: "10 Days", reason: "Annual year-end vacation with family.", approver: "Vikram Singh" },
    ]
  };

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const grid = [];
    for (let i = firstDay - 1; i >= 0; i--) grid.push({ day: prevMonthDays - i, currentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, currentMonth: true });
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) grid.push({ day: i, currentMonth: false });
    return grid;
  }, [year, month]);

  const handleDateClick = (day) => {
    if (isApplying || isSubmitted) return;
    const clickedDate = new Date(year, month, day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
      setIsSubmitted(false);
    } else if (clickedDate > rangeStart) {
      setRangeEnd(clickedDate);
    } else {
      setRangeStart(clickedDate);
      setRangeEnd(null);
    }
  };

  const isDateInRange = (day, start, end) => {
    const dateToCheck = new Date(year, month, day);
    if (!start) return false;
    const startCompare = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const dateCompare = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
    if (end) {
      const endCompare = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return dateCompare >= startCompare && dateCompare <= endCompare;
    }
    return dateCompare.getTime() === startCompare.getTime();
  };

  const closeWorkspace = () => {
    setIsSubmitted(false);
    setRangeEnd(null);
    setIsApplying(false);
    setRangeStart(null);
  }

  const selectionDuration = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 1;
    const diffTime = Math.abs(rangeEnd - rangeStart);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [rangeStart, rangeEnd]);

  const HistoryCard = ({ item, type }) => {
    const badgeConfig = {
      medical: { label: "Medical Leave", icon: <Plus size={12} strokeWidth={4} /> },
      casual: { label: "Casual Leave", icon: <Plane size={12} strokeWidth={3} /> },
      earned: { label: "Earned Leave", icon: <Star size={12} strokeWidth={3} /> }
    };
    const config = badgeConfig[type];

    return (
      <div className="record-card rounded-2xl p-5 flex flex-col shadow-sm border border-[#DADCE0] bg-white mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-xl shadow-sm">
            <span style={{ color: GOOGLE_RED }}>{config.icon}</span>
            <span className="text-[11px] font-bold text-[#3C4043]">{config.label}</span>
          </div>
          <FileText size={18} className="text-gray-300" />
        </div>
        <div className="flex-1 mb-6">
          <h3 className="text-[14px] font-extrabold text-[#1A1D21] mb-1 leading-tight">{item.range}</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarIcon size={12} />
            <span className="text-[11px] font-medium">{item.date}</span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-6 pt-4 border-t border-gray-50">
          <button onClick={() => setViewingItem({ ...item, type })} className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: GOOGLE_RED }}>
            <Eye size={14} /> View
          </button>
          <button className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: GOOGLE_RED }}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-[#FAFAFA] flex flex-col items-center select-none overflow-x-hidden pb-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; color: ${TEXT_MAIN}; }
        .calendar-container { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #DADCE0; background: white; position: relative; }
        .cell-piano { transition: all 0.2s ease; border-right: 1px solid #F1F3F4; border-bottom: 1px solid #F1F3F4; min-height: 54px; }
        .feature-sidebar { background-color: ${GOOGLE_RED}; padding: 24px 20px; color: white !important; display: flex; flex-direction: column; width: 100%; border-radius: 0 0 24px 24px; transition: all 0.3s ease; }
        .feature-sidebar *:not(button):not(button *) { color: white !important; }
        .sidebar-btn { background-color: white !important; color: ${GOOGLE_RED} !important; border-radius: 12px; transition: all 0.2s ease; }
        .sidebar-btn:active { transform: scale(0.98); }
        .sidebar-date-display .day-num { font-size: 3rem; font-weight: 800; line-height: 1; color: white; }
        .leave-type-card { padding: 10px 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); text-align: center; cursor: pointer; transition: all 0.2s; }
        .leave-type-card.active { background: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .leave-type-card.active span { color: ${GOOGLE_RED} !important; }
        .selection-range { border-radius: 999px; background-color: ${GOOGLE_RED} !important; color: white !important; z-index: 5; box-shadow: 0 4px 10px rgba(230, 124, 115, 0.3); }
        .in-view-range { background-color: rgba(230, 124, 115, 0.1) !important; }
        .cap-view-range { background-color: ${GOOGLE_RED} !important; color: white !important; }
        .menu-btn-icon { color: ${GOOGLE_RED} !important; }
      `}</style>

      <div className="w-full max-w-[500px] px-4 pt-6 h-full flex flex-col">
        {viewMode === 'calendar' && !viewingItem && (
          <>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={22} style={{ color: GOOGLE_RED }} />
                  </button>
                )}
                <h1 className="text-xl font-bold text-[#1A1D21] tracking-wide">
                  My {mode === 'outDuty' ? 'Out Duty' : 'Leave'} application
                </h1>
              </div>
              <button onClick={onMenuClick} className="p-2 -mr-2 hover:bg-red-50 rounded-full transition-colors outline-none active:scale-90 bg-transparent border-none">
                <Menu size={24} style={{ color: GOOGLE_RED }} />
              </button>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl grid grid-cols-2 overflow-hidden shadow-sm mb-6 flex-shrink-0">
              {leaveKPIs.map((kpi, idx) => (
                <div
                  key={kpi.id}
                  onClick={() => kpi.type !== 'expiring' && setViewMode(kpi.type)}
                  className={`p-5 min-w-0 border-r border-b border-gray-100 flex flex-col justify-between active:bg-gray-50 transition-colors cursor-pointer ${idx % 2 !== 0 ? 'border-r-0' : ''} ${idx >= 2 ? 'border-b-0' : ''} ${viewMode === kpi.type ? 'bg-red-50/50' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-4 shrink-0 rounded-full bg-[#D32F2F]" />
                      <span className="text-[10px] font-black text-[#3C4043] uppercase tracking-widest truncate">{kpi.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1A1D21] leading-none shrink-0">{kpi.mainValue}</span>
                  </div>
                  <div className="flex items-center justify-between min-w-0 mt-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{kpi.subText}</span>
                    <ArrowRight size={12} className="text-[#D32F2F] shrink-0 opacity-70" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col w-full mb-6 flex-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              {(viewMode !== 'calendar' || viewingItem) && (
                <button onClick={() => { setViewMode('calendar'); setViewingItem(null); }} className="p-2 bg-gray-100 rounded-full">
                  <ArrowLeft size={18} strokeWidth={3} />
                </button>
              )}
              <h2 className="text-lg font-bold text-[#1A1D21] capitalize">
                {viewingItem ? 'Document Summary' : viewMode === 'calendar' ? `${monthName} ${displayYear}` : `${viewMode} History`}
              </h2>
            </div>
            {viewMode === 'calendar' && !viewingItem && (
              <div className="flex bg-[#D32F2F] rounded-lg text-white shadow-sm">
                <button onClick={handlePrevMonth} className="p-2 border-r border-white/20 active:bg-black/10 transition-colors"><ChevronLeft size={16} /></button>
                <button onClick={handleNextMonth} className="p-2 active:bg-black/10 transition-colors"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#DADCE0] rounded-3xl overflow-hidden shadow-sm flex flex-col flex-1">
            {viewMode === 'calendar' && !viewingItem ? (
              <>
                <div className="grid grid-cols-7 border-b bg-gray-50/50">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={`${day}-${idx}`} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarGrid.map((cell, idx) => {
                    const active = cell.currentMonth && isDateInRange(cell.day, rangeStart, rangeEnd);
                    return (
                      <div key={idx} onClick={() => cell.currentMonth && handleDateClick(cell.day)} className="cell-piano flex items-center justify-center p-2 relative cursor-pointer">
                        <div className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${active ? 'selection-range scale-110' : ''} ${!cell.currentMonth ? 'opacity-10' : ''}`}>
                          <span className="text-[12px] font-bold" style={{ color: active ? 'white' : '#70757a' }}>{cell.day}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <aside ref={formRef} className={`feature-sidebar ${isApplying && !isSubmitted ? 'min-h-[400px]' : ''}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 sidebar-date-display">
                      <span className="day-num">
                        {rangeEnd ? selectionDuration : (rangeStart ? rangeStart.getDate() : 13)}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold">
                          {rangeEnd ? 'Days' : (rangeStart ? rangeStart.toLocaleString('default', { month: 'short' }) : monthName.substring(0, 3))}
                        </span>
                        <span className="font-bold opacity-70">
                          {rangeEnd ? 'Selected' : (rangeStart ? rangeStart.getFullYear() : displayYear)}
                        </span>
                      </div>
                    </div>
                    {(rangeEnd || isApplying || isSubmitted) && <button onClick={closeWorkspace} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>}
                  </div>

                  {isApplying && !isSubmitted ? (
                    <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-500">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <label className="text-[9px] uppercase font-bold opacity-60 mb-3 block">Selection of {mode === 'outDuty' ? 'out duty' : 'leave'}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {mode === 'outDuty' ? (
                            <div className="leave-type-card active col-span-3">
                              <span className="text-[9px] font-bold uppercase">Out duty</span>
                            </div>
                          ) : (
                            ['Medical', 'Casual', 'Earned'].map(t => (
                              <div key={t} onClick={() => setSelectedLeaveType(t.toLowerCase())} className={`leave-type-card ${selectedLeaveType === t.toLowerCase() ? 'active' : ''}`}>
                                <span className="text-[9px] font-bold uppercase">{t}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <label className="text-[9px] uppercase font-bold opacity-60 mb-3 block">{mode === 'outDuty' ? 'Out Duty' : 'Leave'} Type</label>
                        <div className="flex bg-white/5 rounded-lg p-1">
                          <button onClick={() => setLeaveDayType('full')} className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${leaveDayType === 'full' ? 'bg-white text-[#D32F2F]' : 'text-white'}`}>Full Day</button>
                          <button onClick={() => setLeaveDayType('half')} className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${leaveDayType === 'half' ? 'bg-white text-[#D32F2F]' : 'text-white'}`}>Half Day</button>
                        </div>
                      </div>

                      <div className="relative group">
                        <textarea className="w-full bg-white/10 border border-white/20 rounded-xl p-3 h-24 text-sm text-white placeholder:text-white/40 outline-none resize-none pr-10 focus:border-white/50 transition-colors" placeholder={`Reason for ${mode === 'outDuty' ? 'out duty' : 'leave'}...`}></textarea>
                        <div className="absolute right-3 bottom-3 p-1.5 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                          <Paperclip size={14} className="text-white opacity-60" />
                        </div>
                      </div>

                      <button onClick={() => setIsSubmitted(true)} className="sidebar-btn w-full py-4 font-black text-[11px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">Submit application</button>
                    </div>
                  ) : rangeEnd && !isSubmitted ? (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-6 bg-white/10 p-4 rounded-xl border border-white/10">
                        <CalendarRange size={20} className="text-white" />
                        <span className="text-sm font-bold text-white">
                          {rangeStart.getDate()} {rangeStart.toLocaleString('default', { month: 'short' })} — {rangeEnd.getDate()} {rangeEnd.toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsApplying(true)}
                        className="sidebar-btn w-full py-4 font-black text-[11px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-white"
                      >
                        Apply for {mode === 'outDuty' ? 'Out Duty' : 'Leave'}
                      </button>
                    </div>
                  ) : isSubmitted ? (
                    <div className="text-center py-6 flex flex-col items-center animate-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} className="text-white" />
                      </div>
                      <p className="font-bold text-white mb-2">Request Submitted</p>
                      <button onClick={closeWorkspace} className="mt-4 px-6 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Close</button>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold opacity-40 uppercase text-center mt-4 text-white">Tap start and end dates</p>
                  )}
                </aside>
              </>
            ) : viewingItem ? (
              /* SUMMARY VIEW WITH CALENDAR HIGHLIGHT */
              <div className="animate-in slide-in-from-bottom-4 flex flex-col flex-1 overflow-y-auto custom-scroll">
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <FileText style={{ color: GOOGLE_RED }} size={20} />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-[#1A1D21]">{viewingItem.type} Leave Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">period :</span>
                      <span className="text-xs font-black text-[#1A1D21]">{viewingItem.range}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">duration :</span>
                      <span className="text-xs font-black text-[#1A1D21]">{viewingItem.duration}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">reason :</span>
                      <p className="text-xs font-semibold text-[#3C4043] leading-relaxed">{viewingItem.reason}</p>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">approver :</span>
                      <div className="flex items-center gap-2">
                        <UserCheck size={12} className="text-gray-400" />
                        <span className="text-xs font-black text-[#1A1D21]">{viewingItem.approver}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1D21]">Monthly Schedule</h3>
                    <span className="text-[10px] font-bold text-gray-400">{monthName} {displayYear}</span>
                  </div>

                  <div className="border border-[#F1F3F4] rounded-2xl overflow-hidden flex flex-col">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-[#F1F3F4]">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="py-2 text-center text-[9px] font-black text-gray-400">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {calendarGrid.map((cell, idx) => {
                        const isStart = cell.day === viewingItem.start && cell.currentMonth;
                        const isEnd = cell.day === viewingItem.end && cell.currentMonth;
                        const isMid = cell.currentMonth && cell.day > viewingItem.start && cell.day < viewingItem.end;

                        return (
                          <div key={idx} className={`h-11 border-r border-b border-[#F1F3F4] last:border-r-0 flex items-center justify-center relative 
                            ${isMid ? 'in-view-range' : ''} 
                            ${isStart || isEnd ? 'cap-view-range' : ''}`}>
                            <span className={`text-[10px] font-bold ${isStart || isEnd ? 'text-white' : cell.currentMonth ? 'text-[#3C4043]' : 'opacity-10'}`}>
                              {cell.day}
                            </span>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
              <div className="p-4 bg-gray-50/50 flex-1 overflow-y-auto custom-scroll">
                {historyData[viewMode]?.length > 0 ? (
                  historyData[viewMode].map(item => <HistoryCard key={item.id} item={item} type={viewMode} />)
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <CalendarIcon size={32} className="mb-2 opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No history found</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Also adding the CheckCircle2 icon to the imports which was missing in the original snippet but used in my enhancement
export default LeaveRequest;