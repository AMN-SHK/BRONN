import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import FeatureCard from './components/FeatureCard';
import ChatPage from './components/ChatPage';
import RecentChats from './components/RecentChats';
import feature1 from './imgs/feature1.png';
import feature2 from './imgs/feature2.png';
import feature3 from './imgs/feature3.png';
import avatar from './imgs/avatar.png';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa6";
import { NextUIProvider, ScrollShadow } from "@nextui-org/react";


function App() {
  const [recentChats, setRecentChats] = useState([]);
  const [isInChatView, setIsInChatView] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [message, setMessage] = useState('');
  const carouselRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const promptSuggestions = [
    "Get fresh perspectives on tricky problems",
    "Predict the stock price of AAPL for next week",
    "What are the latest news affecting TSLA?",
    "Analyze my portfolio and suggest improvements"
  ];

  const featurePrompts = {
    "Stock Predictions": "Predict the stock price of [STOCK] for next week",
    "Realtime News": "What are the latest news affecting [STOCK]?",
    "Portfolio Analysis": "Analyze my portfolio consisting of [STOCKS]"
  };

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
  };

  const handleCtaClick = (featureTitle) => {
    const prompt = featurePrompts[featureTitle];
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

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
    setIsInChatView(true);
    setCurrentChatId(null);
  };

  const openExistingChat = (chatId) => {
    setIsInChatView(true);
    setCurrentChatId(chatId);
  };

  const goBack = () => {
    setIsInChatView(false);
    setCurrentChatId(null);
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
    <NextUIProvider>
    <div className="app">
      <header>
        <div className="header-left">
          {isInChatView && (
            <button className="back-btn" onClick={goBack}>
              <IoChevronBack />
            </button>
          )}
          <h1 className='quattrocento-bold'>BRONN</h1>
        </div>
        <div className="user-avatar">M</div>
      </header>
      
      {!isInChatView ? (
        <div className="landing-page">
          <div className="gradient-orb"></div>
          
          <div className="welcome-section">
            <h2 className="greeting">{getGreeting()}, Milovan</h2>
            <h1 className="main-heading">Can I help you with anything?</h1>
            <p className="subtitle">Choose a prompt below or write your own to start chatting with BRONN</p>
          </div>

          <div className="prompt-suggestions">
            {promptSuggestions.map((prompt, index) => (
              <button 
                key={index} 
                className="prompt-pill"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <ScrollShadow className="content-scroll" hideScrollBar>
            <section className="features">
              <h2 className='quattrocento-bold'>Features</h2>
              <div className="feature-carousel-container">
                <button className="carousel-btn prev-btn" onClick={() => scrollCarousel('left')}><IoChevronBack /></button>
                <div className="feature-carousel" ref={carouselRef}>
                <FeatureCard 
                  title="Stock Predictions" 
                  content="Predict your favorite stocks with a prompt" 
                  imageUrl={feature1}
                  ctaText="Predict Now"
                  onCtaClick={handleCtaClick}
                />
                <FeatureCard 
                  title="Realtime News" 
                  content="Get Realtime updates on your stocks 24/7" 
                  imageUrl={feature2}
                  ctaText="View News"
                  onCtaClick={handleCtaClick}
                />
                <FeatureCard 
                  title="Portfolio Analysis" 
                  content="Get insights on your investment portfolio" 
                  imageUrl={feature3}
                  ctaText="Analyze Now"
                  onCtaClick={handleCtaClick}
                />
                </div>
                <button className="carousel-btn next-btn" onClick={() => scrollCarousel('right')}><IoChevronForward /></button>
              </div>
            </section>
            
            <RecentChats 
              chats={recentChats} 
              onChatClick={openExistingChat}
            />
          </ScrollShadow>
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
            placeholder="How can BRONN help you today?"
          />
          <button type="submit" disabled={!message.trim()}><FaPaperPlane /></button>
        </form>
      </footer>
    </div>
    </NextUIProvider>
  );
}

export default App;
