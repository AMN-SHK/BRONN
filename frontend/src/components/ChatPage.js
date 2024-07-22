import React from 'react';
import avatar from '../imgs/avatar.png';
import PredictionChart from './PredictionChart';
import ReactMarkdown from 'react-markdown';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

function ChatPage({ chat, onTitleChange, isGenerating }) {
  const handleTitleChange = (e) => {
    onTitleChange(chat.id, e.target.value);
  };

  const renderMessage = (msg, index) => {
    if (msg.role === "assistant") {
      let content;
      try {
        content = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
      } catch (e) {
        content = msg.content;
      }

      if (content.general) {
        return (
          <div key={index} className="message assistant general-message">
            <div className="assistant-info">
              <img src={avatar} alt="assistant avatar" className="avatar" />
            </div>
            <div className="general-response">
              <p>{content.general}</p>
            </div>
          </div>
        );
      } else if (content.news) {
        return (
          <div key={index} className="message assistant news-message">
            <div className="assistant-info">
              <img src={avatar} alt="assistant avatar" className="avatar" />
            </div>
            <div className="news-response">
              <p className="news-intro">{content.news.intro}</p>
              <div className="news-articles">
                {content.news.articles.map((article, i) => {
                  const sourceName = article.source.split('.')[0].charAt(0).toUpperCase() + article.source.split('.')[0].slice(1);
                  const domain = article.source;
                  return (
                    <a href={article.link} target='_blank' rel="noopener noreferrer" key={i}>
                      <div className="news-card">
                        <div className="news-source">
                          {article.source && <img src={`https://cdn.brandfetch.io/${domain}`} alt="Company logo" className="source-logo" />}
                          <span className="source-name">{sourceName}</span>
                          <span className={`prediction-indicator ${article.prediction.toLowerCase()}`}>
                            {article.prediction === "UP" ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                          </span>
                        </div>
                        <h3 className="news-title">{article.title}</h3>
                        <p className="news-summary">{article.summary}</p>
                        <p className="news-time">{article.time_uploaded}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
              <p className="news-conclusion">{content.news.conclusion}</p>
            </div>
          </div>
        );
      } else if (content.prediction && content.report) {
        return (
          <div key={index} className="message assistant prediction-message">
            <div className="assistant-info">
              <img src={avatar} alt="assistant avatar" className="avatar" />
            </div>
            <div className="prediction-response">
              <p>{content.report.introduction}</p>
              <PredictionChart data={content.prediction} />
              <div className="prediction-report">
                <ReactMarkdown>{content.report.insights}</ReactMarkdown>
                <p>{content.report.conclusion}</p>
              </div>
            </div>
          </div>
        );
      }else if (content.suggested_stocks && content.report) {
        return (
          <div key={index} className="message assistant suggested-stocks-message">
            <div className="assistant-info">
              <img src={avatar} alt="assistant avatar" className="avatar" />
            </div>
            <div className="suggested-stocks-response">
              <p>{content.report.introduction}</p>
              <div className="suggested-stocks">
                {content.suggested_stocks.map((stock, i) => (
                  <div key={i} className="stock-card">
                    {stock.logo_url && <img src={stock.logo_url} alt={`${stock.company_name} logo`} className="stock-logo" />}
                    <h3 className="stock-name">{stock.company_name}</h3>
                    <p className="stock-ticker">{stock.ticker}</p>
                    <p className="stock-price">₹{stock.current_price.toFixed(2)}</p>
                    <p className={`stock-return ${stock.return_1mo >= 0 ? 'positive' : 'negative'}`}>
                      {stock.return_1mo.toFixed(2)}% (1 month)
                    </p>
                    <p className={`stock-daily-change ${stock.daily_change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.daily_change_percent.toFixed(2)}% today
                    </p>
                  </div>
                ))}
              </div>
              <p>{content.report.conclusion}</p>
            </div>
          </div>
        );
      }else if (content.error) {
        return (
          <div key={index} className="message assistant error-message">
            <div className="assistant-info">
              <img src={avatar} alt="assistant avatar" className="avatar" />
            </div>
            <div className="error-response">
              <p>I apologize, but I'm currently experiencing technical difficulties. Please try again later or contact support if the issue persists.</p>
            </div>
          </div>
        );
      }
    }

    return (
      <div key={index} className={`message ${msg.role}`}>
        <div className="message-content">
          {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-page">
      <input
        type="text"
        value={chat.title}
        onChange={handleTitleChange}
        placeholder="Chat Title"
      />
      <div className="messages">
        {chat.messages.map((msg, index) => renderMessage(msg, index))}
        {isGenerating && <Loader />}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>Generating response...</p>
    </div>
  );
}

export default ChatPage;