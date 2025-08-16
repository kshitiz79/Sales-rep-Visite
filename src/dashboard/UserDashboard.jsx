
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VisitForm from "../components/VisitForm";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to be last (6)
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowVisitForm(true);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
    const today = new Date();
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dateToCheck < today.setHours(0, 0, 0, 0);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isWeekend = (firstDay + day - 1) % 7 >= 5;
      const todayDate = isToday(day);
      const pastDate = isPastDate(day);
      const isHovered = hoveredDate === day;

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-100 p-3 relative cursor-pointer transition-all duration-200 group ${
            todayDate
              ? 'bg-blue-50 border-blue-200 shadow-md'
              : isHovered
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg transform scale-105'
              : pastDate
              ? 'bg-gray-50 hover:bg-gray-100'
              : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:shadow-md'
          }`}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => setHoveredDate(day)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {/* Date Number */}
          <div className={`text-lg font-bold mb-2 transition-colors ${
            todayDate
              ? 'text-blue-600'
              : isWeekend
              ? pastDate
                ? 'text-red-300'
                : 'text-red-500'
              : pastDate
              ? 'text-gray-400'
              : 'text-gray-700 group-hover:text-blue-600'
          }`}>
            {day}
          </div>

          {/* Today Indicator */}
          {todayDate && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Action Text */}
          <div className={`text-xs transition-all duration-200 ${
            isHovered
              ? 'text-blue-600 font-medium transform translate-y-0 opacity-100'
              : pastDate
              ? 'text-gray-400 opacity-60'
              : 'text-gray-500 opacity-70 group-hover:text-blue-500 group-hover:font-medium'
          }`}>
            {pastDate ? (
              <div className="flex items-center space-x-1">
                <span>📋</span>
                <span>Past date</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>{isHovered ? '✨' : '+'}</span>
                <span>{isHovered ? 'Create visit' : 'Add visit'}</span>
              </div>
            )}
          </div>

          {/* Hover Effect Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-lg pointer-events-none"></div>
          )}

          {/* Weekend Indicator */}
          {isWeekend && !pastDate && (
            <div className="absolute bottom-2 right-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (showVisitForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-lg border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowVisitForm(false)}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span>←</span>
                <span>Back to Calendar</span>
              </button>
              {selectedDate && (
                <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Creating visit for</div>
                    <div className="text-lg font-semibold text-blue-800">
                      {selectedDate.toDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <VisitForm selectedDate={selectedDate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📅 Professional Calendar</h1>
            <p className="text-gray-600 text-lg">Schedule and manage your client visits</p>
          </div>
          
          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Welcome back,</div>
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-blue-600">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Calendar Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>
                <button
                  onClick={goToToday}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                >
                  <span>📍</span>
                  <span>Today</span>
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>

              {/* Month/Year Display */}
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <div className="text-blue-100 text-sm mt-1">
                  Click any date to schedule a visit
                </div>
              </div>

              {/* Stats/Info */}
              <div className="text-right">
                <div className="text-sm text-blue-100">Current Month</div>
                <div className="text-lg font-semibold">
                  {getDaysInMonth(currentDate)} Days
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="p-6">
            {/* Professional Day Headers */}
            <div className="grid grid-cols-7 mb-4">
              {dayNames.map((day, index) => (
                <div key={day} className={`text-center py-4 font-semibold text-sm ${
                  index >= 5 ? 'text-red-500 bg-red-50' : 'text-gray-700 bg-gray-50'
                } rounded-lg mx-1 border border-gray-200`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Enhanced Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 bg-gray-50 p-2 rounded-xl">
              {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded"></div>
                <span className="text-gray-600">Past Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-gray-600">Weekend</span>
              </div>
            </div>
          </div>

          {/* Professional Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>💡 Tip: Click on any date to create a new visit report</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <span className="font-semibold text-blue-600">Professional CRM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
