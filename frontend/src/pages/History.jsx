import React, { useContext, useEffect, useState, useMemo } from 'react'
import { FaHistory, FaSearch, FaTrash, FaDownload, FaFilter, FaCalendar, FaUser, FaRobot, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../ContextApi/UserDataContext';
import Header from '../components/Header'
import Footer from '../components/Footer'

function History() {
  const navigate = useNavigate();
  const { userData, serverUrl } = useContext(userDataContext);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData?.history) {
      // Transform history into conversation format
      const conversationData = userData.history.map((command, index) => ({
        id: index + 1,
        userMessage: command,
        assistantResponse: '', // We don't store responses in history currently
        timestamp: new Date().toISOString(), // Placeholder timestamp
        type: 'command'
      }));
      setConversations(conversationData);
      setFilteredConversations(conversationData);
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    let filtered = conversations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.userMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(conv => conv.type === filterType);
    }

    setFilteredConversations(filtered);
  }, [searchTerm, filterType, conversations]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      // This would need backend integration to actually clear history
      setConversations([]);
      setFilteredConversations([]);
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredConversations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `syra-history-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
        <Header />
        <div className='flex-1 flex justify-center items-center flex-col p-[20px] pt-24'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400'></div>
          <p className='text-white mt-4'>Loading conversation history...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative'>
      <Header />

      <div className='flex-1 flex justify-center items-center flex-col p-[20px] sm:p-[40px] pt-24'>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>

        <div className='w-full max-w-6xl relative z-20'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-6'>
              <div className='bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 p-6 rounded-2xl shadow-2xl'>
                <FaHistory className='text-white text-5xl' />
              </div>
            </div>
            <h1 className='text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4'>
              Conversation History
            </h1>
            <p className='text-white/90 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed'>
              Review your past interactions with SYRA AI assistant
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8'>
            <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center'>
              <div className='text-3xl font-bold text-blue-400 mb-2'>{conversations.length}</div>
              <div className='text-white/80 text-sm'>Total Conversations</div>
            </div>
            <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center'>
              <div className='text-3xl font-bold text-green-400 mb-2'>
                {new Set(conversations.map(c => c.userMessage.split(' ')[0])).size}
              </div>
              <div className='text-white/80 text-sm'>Unique Commands</div>
            </div>
            <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center'>
              <div className='text-3xl font-bold text-purple-400 mb-2'>
                {Math.round(conversations.reduce((acc, c) => acc + c.userMessage.length, 0) / Math.max(conversations.length, 1))}
              </div>
              <div className='text-white/80 text-sm'>Avg. Message Length</div>
            </div>
          </div>

          {/* Controls */}
          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8'>
            <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
              {/* Search */}
              <div className='relative flex-1 max-w-md'>
                <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60' />
                <input
                  type='text'
                  placeholder='Search conversations...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400'
                />
              </div>

              {/* Filter */}
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <FaFilter className='text-white/60' />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50'
                  >
                    <option value='all'>All Types</option>
                    <option value='command'>Commands</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={exportHistory}
                  className='flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
                >
                  <FaDownload />
                  Export
                </button>

                <button
                  onClick={clearHistory}
                  className='flex items-center gap-2 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
                >
                  <FaTrash />
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Conversation List */}
          <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden'>
            {filteredConversations.length === 0 ? (
              <div className='p-12 text-center'>
                <FaHistory className='text-white/40 text-6xl mx-auto mb-4' />
                <h3 className='text-white/80 text-xl font-semibold mb-2'>No conversations found</h3>
                <p className='text-white/60'>
                  {searchTerm || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start a conversation with SYRA AI to see your history here'
                  }
                </p>
              </div>
            ) : (
              <div className='max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent'>
                {filteredConversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className='p-4 border-b border-white/10 last:border-b-0'
                  >
                    <div className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-400/20'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-blue-500/20 p-2 rounded-lg'>
                            <FaUser className='text-blue-400 text-sm' />
                          </div>
                          <div>
                            <div className='text-white font-semibold'>You</div>
                            <div className='text-white/60 text-sm flex items-center gap-2'>
                              <FaCalendar className='text-xs' />
                              {formatDate(conversation.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className='text-white/40 text-sm'>#{conversation.id}</div>
                      </div>

                      <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
                        <p className='text-white/90 leading-relaxed'>{conversation.userMessage}</p>
                      </div>

                      {conversation.assistantResponse && (
                        <div className='mt-4'>
                          <div className='flex items-center gap-3 mb-2'>
                            <div className='bg-purple-500/20 p-2 rounded-lg'>
                              <FaRobot className='text-purple-400 text-sm' />
                            </div>
                            <div className='text-white font-semibold'>SYRA AI</div>
                          </div>
                          <div className='bg-purple-500/10 rounded-lg p-4 border border-purple-500/20'>
                            <p className='text-white/90 leading-relaxed'>{conversation.assistantResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default History