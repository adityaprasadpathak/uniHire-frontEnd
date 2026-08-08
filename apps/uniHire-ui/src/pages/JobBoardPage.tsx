import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import ApplicationCard from '../components/employer/ApplicationCard';
import ChatDrawer from '../components/chat/ChatDrawer';
import ApplicationDetailsModal from '../components/employer/ApplicationDetailsModal';
import CandidateProfileModal from '../components/employer/CandidateProfileModal';

const COLUMNS = [
  { id: 'APPLIED', title: 'Applied' },
  { id: 'SHORTLISTED', title: 'Shortlisted' },
  { id: 'INTERVIEW_SCHEDULED', title: 'Interviewing' },
  { id: 'OFFERED', title: 'Offered' },
  { id: 'HIRED', title: 'Hired' },
  { id: 'REJECTED', title: 'Rejected' },
];

export default function JobBoardPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  
  // Chat Drawer State
  const [chatAppId, setChatAppId] = useState<number | null>(null);
  const [chatPartyName, setChatPartyName] = useState('');
  
  // Application Details State & Profile Modal State
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['jobApplications', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/employer/jobs/${id}/applications`);
      return data;
    },
  });

  useEffect(() => {
    if (applications) {
      const grouped: Record<string, any[]> = {};
      COLUMNS.forEach((col) => {
        grouped[col.id] = applications
          .filter((app: any) => app.status === col.id)
          .sort((a: any, b: any) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0)); // Sort by AI Score
      });
      setColumns(grouped);
    }
  }, [applications]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      await apiClient.put(`/employer/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications', id] });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    const [movedItem] = sourceColumn.splice(source.index, 1);

    // Optimistically update status
    movedItem.status = destination.droppableId;
    destColumn.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    updateStatusMutation.mutate({
      applicationId: parseInt(draggableId),
      status: destination.droppableId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <Link to="/dashboard/jobs" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Application Pipeline</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="max-w-[1600px] mx-auto h-full grid grid-cols-6 gap-4 pb-6 min-w-[1000px]">
          <DragDropContext onDragEnd={onDragEnd}>
            {COLUMNS.map((column) => (
              <div key={column.id} className="bg-slate-100/50 rounded-xl flex flex-col h-full border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white/50">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{column.title}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                    {columns[column.id]?.length || 0}
                  </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {columns[column.id]?.map((app, index) => (
                        <ApplicationCard 
                          key={app.id} 
                          application={app} 
                          index={index} 
                          onOpenChat={() => {
                            setChatAppId(app.id);
                            setChatPartyName(app.candidateName);
                          }}
                          onViewDetails={() => setSelectedAppId(app.id)}
                          onViewProfile={() => setSelectedCandidateId(app.candidateId)}
                          unreadCount={app.unreadMessageCount || 0}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>
      
      {chatAppId && (
        <ChatDrawer 
          applicationId={chatAppId} 
          isOpen={true} 
          onClose={() => setChatAppId(null)} 
          otherPartyName={chatPartyName}
        />
      )}

      {selectedAppId && (
        <ApplicationDetailsModal 
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}

      {selectedCandidateId && (
        <CandidateProfileModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  );
}
