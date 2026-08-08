import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, Loader2 } from 'lucide-react';
import { createStompClient } from '../../services/stompClient';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Client } from '@stomp/stompjs';

interface ChatDrawerProps {
  applicationId: number;
  isOpen: boolean;
  onClose: () => void;
  otherPartyName: string;
}

export default function ChatDrawer({ applicationId, isOpen, onClose, otherPartyName }: ChatDrawerProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/chat/${applicationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['applicationUnreadCounts'] });
    }
  });

  // Fetch initial history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['chatHistory', applicationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/chat/${applicationId}/history?size=50`);
      return data.content.reverse(); // Spring Boot returns newest first due to OrderByCreatedAtDesc
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (historyData) {
      setMessages(historyData);
      markAsReadMutation.mutate();
    }
  }, [historyData]);

  // Connect STOMP on open
  useEffect(() => {
    if (isOpen && user) {
      const client = createStompClient();
      
      client.onConnect = () => {
        console.log('Connected to STOMP');
        client.subscribe('/user/queue/messages', (message) => {
          const newMsg = JSON.parse(message.body);
          if (newMsg.applicationId === applicationId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        });
      };

      client.activate();
      setStompClient(client);

      return () => {
        client.deactivate();
      };
    }
  }, [isOpen, user, applicationId]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !stompClient || !stompClient.connected) return;

    const payload = {
      applicationId,
      // For a robust system we'd determine receiverId, but the backend ChatService handles it if receiverId is not strictly needed for group/topic 
      // Actually, ChatRequestDto requires receiverId in some designs, or the backend derives it.
      // Let's pass 0, the backend ChatService typically derives the other party from the application.
      receiverId: 0, 
      content: inputValue,
    };

    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });

    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">Chat</h3>
            <p className="text-sm text-slate-500">{otherPartyName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                  <p>No messages yet.</p>
                  <p className="text-sm">Send a message to start the conversation.</p>
                </div>
              )}
              {messages.map((msg: any, i: number) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={i} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none py-3 px-4 outline-none resize-none min-h-[44px] max-h-[120px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim() || !stompClient?.connected}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
