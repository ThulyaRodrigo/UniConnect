/**
 * MessageBubble — renders a single chat message.
 * Handles both 'text' and 'image' messageType.
 *
 * Props:
 *   msg    – message document { senderType, messageType, text, imageUrl, createdAt }
 *   isMe   – boolean (true = right-aligned green bubble, false = left-aligned white)
 */
import { useState } from 'react';

export default function MessageBubble({ msg, isMe }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const bubbleBase = `max-w-[75%] px-3 py-2 text-[15px] shadow-sm relative`;
  const meBubble   = `bg-[#d9fdd3] text-[#111b21] rounded-lg rounded-tr-sm`;
  const themBubble = `bg-white border border-gray-100 text-[#111b21] rounded-lg rounded-tl-sm`;

  const timeStamp = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`${bubbleBase} ${isMe ? meBubble : themBubble}`}>
          {msg.messageType === 'image' ? (
            /* Image message */
            <div className="pb-5">
              <img
                src={msg.imageUrl}
                alt="shared image"
                onClick={() => setLightboxOpen(true)}
                className="max-w-[240px] max-h-[240px] rounded-md object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              />
            </div>
          ) : (
            /* Text message */
            <p className={`mb-3 pr-2 whitespace-pre-wrap ${isMe ? 'pl-7' : 'pr-7'}`}>{msg.text}</p>
          )}

          {/* Timestamp */}
          <span className={`text-[10px] text-gray-500 absolute bottom-1 right-2`}>
            {timeStamp}
          </span>
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={msg.imageUrl}
            alt="full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
