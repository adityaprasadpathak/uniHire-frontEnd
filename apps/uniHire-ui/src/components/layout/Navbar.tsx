import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Briefcase, LayoutDashboard, Send, Search, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { createStompClient } from '../../services/stompClient';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const queryClient = useQueryClient();

  // Fetch initial unread count
  const { data: unreadData } = useQuery({
    queryKey: ['globalUnreadCount'],
    queryFn: async () => {
      if (!isAuthenticated) return { totalUnread: 0 };
      const { data } = await apiClient.get('/chat/unread-count');
      return data;
    },
    enabled: isAuthenticated,
  });

  // Fetch detailed unread counts
  const { data: unreadDetailed } = useQuery({
    queryKey: ['applicationUnreadCounts'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const { data } = await apiClient.get('/chat/unread-by-application');
      return data;
    },
    enabled: isAuthenticated,
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for WebSocket unread count changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const client = createStompClient();
      client.onConnect = () => {
        client.subscribe('/user/queue/notifications', (message) => {
          const event = JSON.parse(message.body);
          if (event.type === 'UNREAD_COUNT_CHANGED') {
            // Invalidate both global and per-application queries
            queryClient.invalidateQueries({ queryKey: ['globalUnreadCount'] });
            queryClient.invalidateQueries({ queryKey: ['applicationUnreadCounts'] });
          }
        });
      };
      client.activate();
      return () => {
        client.deactivate();
      };
    }
  }, [isAuthenticated, user, queryClient]);

  const totalUnread = unreadData?.totalUnread || 0;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">UniHire</span>
            </Link>
            
            <div className="hidden md:flex ml-10 items-center space-x-1">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                Find Jobs
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
                  Log in
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {user?.role === 'EMPLOYER' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link 
                      to="/dashboard/jobs" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/jobs') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Briefcase className="w-4 h-4" /> My Jobs
                    </Link>
                    <Link 
                      to="/dashboard/search" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/search') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Search className="w-4 h-4" /> Search Candidates
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </>
                )}

                {user?.role === 'CANDIDATE' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link 
                      to="/profile/applications" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile/applications') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Send className="w-4 h-4" /> Applications
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link 
                      to="/profile/resume-builder" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile/resume-builder') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Briefcase className="w-4 h-4" /> Resume Builder
                    </Link>
                  </>
                )}

                {user?.role === 'ADMIN' && (
                  <>
                    <Link 
                      to="/admin" 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                  </>
                )}

                <div className="relative mx-2 flex items-center justify-center" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <Bell className="w-5 h-5 text-slate-500" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {!unreadDetailed || unreadDetailed.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            No new notifications
                          </div>
                        ) : (
                          unreadDetailed.map((item: any) => (
                            <Link 
                              key={item.applicationId}
                              to={user?.role === 'EMPLOYER' ? `/dashboard/jobs/${item.jobId}/board` : '/profile/applications'}
                              onClick={() => setShowNotifications(false)}
                              className="block p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-slate-900 truncate pr-2">
                                  {user?.role === 'EMPLOYER' ? item.candidateName : item.companyName}
                                </span>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {item.unread} new
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {item.jobTitle}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-2"></div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
