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

function App() {
  const [recentChats, setRecentChats] = useState([]);
  const [isInChatView, setIsInChatView] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const carouselRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const featurePrompts = {
    "Stock Predictions": "Predict the stock price of [STOCK] for next week",
    "Realtime News": "What are the latest news affecting [STOCK]?",
    "Portfolio Analysis": "Analyze my portfolio consisting of [STOCKS]"
  };

  const handleCtaClick = (featureTitle) => {
    const prompt = featurePrompts[featureTitle];
    setMessage(prompt);
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
      const response = await fetch('http://localhost:8000/bronn', {
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

  const handlePopState = () => {
    if (isInChatView) {
      goBack();
    }
  };

  useEffect(() => {
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
      <header>
        <h1 className='quattrocento-bold'>BRONN</h1>
        {!isInChatView && <p>Your Own Master of Coin</p>}
        {isInChatView && <button onClick={goBack}>{<IoChevronBack />}</button>}
        {/* <p>{isInChatView ? (recentChats.find(chat => chat.id === currentChatId)?.title || "New Chat") : "Your Own Master of Coin"}</p> */}
      </header>
      
      {!isInChatView ? (
        <>
          <section className="features">
            <h2 className='quattrocento-bold'>Features</h2>
            <div className="feature-carousel-container">
              <button className="carousel-btn prev-btn" onClick={() => scrollCarousel('left')}>{<IoChevronBack />}</button>
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
              <button className="carousel-btn next-btn" onClick={() => scrollCarousel('right')}>{<IoChevronForward />}</button>
            </div>
          </section>
          
          <RecentChats 
            chats={recentChats} 
            onChatClick={openExistingChat}
          />
        </>
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
            placeholder="Type your message..."
          />
          <button type="submit">{<FaPaperPlane />}</button>
        </form>
      </footer>
    </div>
  );
}

export default App;
