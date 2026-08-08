import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User, MessageCircle, ShieldCheck } from 'lucide-react';

interface ApplicationCardProps {
  application: any;
  index: number;
  onOpenChat: () => void;
  onViewDetails?: () => void;
  onViewProfile?: () => void;
  unreadCount?: number;
}

export default function ApplicationCard({ application, index, onOpenChat, onViewDetails, onViewProfile, unreadCount = 0 }: ApplicationCardProps) {
  
  // Determine color coding for AI score
  let scoreColor = 'bg-slate-100 text-slate-700 border-slate-200';
  if (application.aiMatchScore) {
    if (application.aiMatchScore >= 85) scoreColor = 'bg-green-50 text-green-700 border-green-200';
    else if (application.aiMatchScore >= 70) scoreColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    else scoreColor = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <Draggable draggableId={application.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 cursor-grab hover:shadow-md transition-shadow
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-90' : ''}`}
          onClick={() => onViewDetails && onViewDetails()}
        >
          <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <h4 className="font-medium text-slate-900 text-sm truncate flex items-center">
                  {application.candidateName}
                  {application.candidateVerificationStatus === 'VERIFIED' && (
                    <ShieldCheck className="w-4 h-4 text-green-500 ml-1" title="Verified Candidate" />
                  )}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {onViewProfile && (
                <button
                  onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                  className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                  title="View Candidate Profile"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
                className="relative p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                title="Open Chat"
              >
                <MessageCircle className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {application.aiMatchScore != null && (
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${scoreColor}`}>
                ⭐ {application.aiMatchScore}% Match
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <Calendar className="w-3 h-3" />
            <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
