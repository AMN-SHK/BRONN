import React from 'react';

function RecentChats({ chats, onChatClick }) {
  return (
    <section className="recent-chats">
      <h2 className='quattrocento-bold'>Recent Chats</h2>
      {chats.length > 0 ? (
        <ul>
          {chats.map((chat) => (
            <li key={chat.id} onClick={() => onChatClick(chat.id)}>
              {chat.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No chats yet</p>
      )}
    </section>
  );
}

export default RecentChats;