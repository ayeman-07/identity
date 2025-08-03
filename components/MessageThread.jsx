'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function MessageThread({ caseId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [caseInfo, setCaseInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (caseId) {
      fetchMessages();
    }
  }, [caseId]);

  useEffect(() => {
    // Auto-scroll to latest message
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cases/${caseId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCaseInfo(data.caseInfo);
      } else if (response.status === 403) {
        toast.error('Access denied to view messages');
      } else if (response.status === 404) {
        toast.error('Case not found');
      } else {
        toast.error('Error loading messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (newMessage.length > 1000) {
      toast.error('Message must be 1000 characters or less');
      return;
    }

    setSending(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cases/${caseId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        toast.success('Message sent');
      } else if (response.status === 400) {
        const data = await response.json();
        toast.error(data.error || 'Invalid message');
      } else if (response.status === 403) {
        toast.error('Access denied');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getRoleDisplay = (role) => {
    return role === 'CLINIC' ? 'Clinic' : 'Lab';
  };

  const isMyMessage = (senderId) => {
    return senderId === currentUser?.id;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Case Communication</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  // Check if messaging is available
  if (caseInfo && !caseInfo.lab) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Case Communication</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Messaging Not Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Case communication is only available after a lab has been assigned to this case.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if case is still in NEW status (not yet accepted)
  if (caseInfo && caseInfo.status === 'NEW') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Case Communication</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Case Under Review
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Communication will be available once a lab accepts this case and work begins.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Case Communication</h3>
        {caseInfo && (
          <p className="text-sm text-gray-500 mt-1">
            Between {caseInfo.clinic} and {caseInfo.lab}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="px-6 py-4">
        <div className="h-96 overflow-y-auto space-y-4 mb-4 bg-gray-50 rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage(message.senderId)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      isMyMessage(message.senderId) ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {isMyMessage(message.senderId) ? 'You' : `${message.sender.name} (${getRoleDisplay(message.sender.role)})`}
                    </span>
                    <span className={`text-xs ${
                      isMyMessage(message.senderId) ? 'text-indigo-200' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              maxLength={1000}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={sending}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {newMessage.length}/1000 characters
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed h-fit"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
