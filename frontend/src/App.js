import React, { useState, useEffect } from 'react';
import './App.css';
import ChatPage from './components/ChatPage';
import avatar from './imgs/avatar.png';
import { 
  IoChevronBack, 
  IoMenuOutline, 
  IoCloseOutline,
  IoAddOutline,
  IoChatbubbleEllipsesOutline,
  IoTrashOutline
} from "react-icons/io5";
import { 
  FaPaperPlane, 
  FaChartLine, 
  FaNewspaper, 
  FaBriefcase, 
  FaLightbulb,
  FaRobot
} from "react-icons/fa6";


function App() {
  const [recentChats, setRecentChats] = useState([]);
  const [isInChatView, setIsInChatView] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const promptSuggestions = [
    { 
      text: "Get fresh perspectives on tricky problems", 
      icon: <FaLightbulb /> 
    },
    { 
      text: "Predict the stock price of AAPL for next week", 
      icon: <FaChartLine /> 
    },
    { 
      text: "What are the latest news affecting TSLA?", 
      icon: <FaNewspaper /> 
    },
    { 
      text: "Analyze my portfolio and suggest improvements", 
      icon: <FaBriefcase /> 
    }
  ];

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const img = new Image();
    img.src = avatar;
    img.onload = () => console.log("Avatar preloaded");
  }, []);
  

  useEffect(() => {
    const storedChats = localStorage.getItem('recentChats');
    if (storedChats) {
      setRecentChats(JSON.parse(storedChats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentChats', JSON.stringify(recentChats));
  }, [recentChats]);

  const handleSendMessage = async (message) => {
    const newMessage = { role: 'user', content: message };
    let newChat;
  
    if (currentChatId) {
      setRecentChats(chats => chats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ));
    } else {
      newChat = {
        id: Date.now(),
        title: `Untitled ${recentChats.length + 1}`,
        messages: [newMessage]
      };
      setRecentChats(chats => [newChat, ...chats]);
      setCurrentChatId(newChat.id);
    }
  
    setMessage('');
    setIsGenerating(true);
  
    try {
      const response = await fetch('https://yameenv--bronn-fintech-app-fastapi-app.modal.run/bronn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ query: message })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      const botMessage = { role: 'assistant', content: data };
      
      setRecentChats(chats => chats.map(chat =>
        chat.id === (currentChatId || newChat.id)
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      ));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: { 
          error: "I apologize, but I'm currently experiencing technical difficulties. Please try again later or contact support if the issue persists."
        }
      };
      setRecentChats(chats => chats.map(chat =>
        chat.id === (currentChatId || newChat.id)
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ));
    } finally {
      setIsGenerating(false);
    }
  };
  const startNewChat = () => {
    setIsInChatView(false);
    setCurrentChatId(null);
    setIsSidebarOpen(false);
  };

  const openExistingChat = (chatId) => {
    setIsInChatView(true);
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const goBack = () => {
    setIsInChatView(false);
    setCurrentChatId(null);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setRecentChats(chats => chats.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      goBack();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isInChatView) {
        goBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isInChatView]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      handleSendMessage(message);
      if (!isInChatView) {
        setIsInChatView(true);
      }
    }
  };

  const handleTitleChange = (chatId, newTitle) => {
    setRecentChats(chats => chats.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewChat}>
            <IoAddOutline />
            <span>New Chat</span>
          </button>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <IoCloseOutline />
          </button>
        </div>
        
        <div className="sidebar-content">
          <h3 className="sidebar-title">Recent Chats</h3>
          {recentChats.length === 0 ? (
            <div className="empty-chats">
              <IoChatbubbleEllipsesOutline />
              <p>No chats yet</p>
            </div>
          ) : (
            <div className="chats-list">
              {recentChats.map(chat => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => openExistingChat(chat.id)}
                >
                  <div className="chat-item-content">
                    <IoChatbubbleEllipsesOutline className="chat-icon" />
                    <span className="chat-title">{chat.title}</span>
                  </div>
                  <button 
                    className="delete-chat-btn"
                    onClick={(e) => deleteChat(chat.id, e)}
                    title="Delete chat"
                  >
                    <IoTrashOutline />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <header>
          <div className="header-left">
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
              <IoMenuOutline />
            </button>
            {isInChatView && (
              <button className="back-btn" onClick={goBack}>
                <IoChevronBack />
              </button>
            )}
            <div className="brand">
              <FaRobot className="brand-icon" />
              <h1 className='quattrocento-bold'>BRONN</h1>
            </div>
          </div>
        </header>
        
        {!isInChatView ? (
          <div className="landing-page">
            <div className="gradient-orb"></div>
            
            <div className="welcome-section">
              <h2 className="greeting">{getGreeting()}, Traveller</h2>
              <h1 className="main-heading">Can I help you with anything?</h1>
              <p className="subtitle">Choose a prompt below or write your own to start chatting with BRONN</p>
            </div>

            <div className="prompt-suggestions">
              {promptSuggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="prompt-chip"
                  onClick={() => handlePromptClick(suggestion.text)}
                >
                  <span className="chip-icon">{suggestion.icon}</span>
                  <span className="chip-text">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatPage 
            chat={recentChats.find(chat => chat.id === currentChatId) || { messages: [], title: '' }} 
            onTitleChange={handleTitleChange}
            isGenerating={isGenerating}
          />
        )}
        
        <footer>
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask BRONN anything..."
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={!message.trim() || isGenerating}
              className="send-btn"
            >
              <FaPaperPlane />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default App;
