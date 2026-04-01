/**
 * ChatInput — Reusable chat input bar with:
 *   - Text with emoji (via emoji-picker-react)
 *   - Image attachment with local preview + Cloudinary upload
 *   - Send on Enter / button click
 *
 * Props:
 *   value          – controlled text value
 *   onChange       – text change handler
 *   onSend         – async fn(text, imageFile) called on submit
 *   placeholder    – input placeholder
 *   disabled       – disables the whole bar
 *   accentClass    – Tailwind bg class for Send button (default orange)
 */

import { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Send, Smile, ImagePlus, X } from 'lucide-react';

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message…',
  disabled = false,
  accentClass = 'bg-sliit-orange hover:bg-orange-700',
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [imageFile, setImageFile] = useState(null);    // raw File object
  const [imagePreview, setImagePreview] = useState(''); // local object URL

  const fileInputRef = useRef();
  const inputRef = useRef();

  // Image selection 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowEmoji(false);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const cancelImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
  };

  // Emoji 
  const onEmojiClick = (emojiData) => {
    // Inject emoji at cursor position
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newVal = value.slice(0, start) + emojiData.emoji + value.slice(end);
    // Synthesise a change event so parent state updates
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeInputValueSetter.call(input, newVal);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // Move cursor after the emoji
    requestAnimationFrame(() => {
      input.selectionStart = start + emojiData.emoji.length;
      input.selectionEnd = start + emojiData.emoji.length;
      input.focus();
    });
  };

  // Submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!value.trim() && !imageFile) return;

    setShowEmoji(false);
    await onSend(value, imageFile);
    cancelImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="relative">
      {/* ── Emoji Picker (floats above) ── */}
      {showEmoji && (
        <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-xl overflow-hidden">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            lazyLoadEmojis
            searchDisabled={false}
            skinTonesDisabled
            height={380}
            width={320}
          />
        </div>
      )}

      {/* Image preview strip */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="preview"
            className="max-h-28 max-w-[200px] rounded-lg border border-gray-200 object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={cancelImage}
            className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-gray-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-4xl mx-auto"
      >
        {/* Emoji toggle */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowEmoji((v) => !v)}
          className={`shrink-0 p-2 rounded-full transition-colors ${
            showEmoji
              ? 'bg-yellow-100 text-yellow-500'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          } disabled:opacity-40`}
          title="Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Image picker */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => { setShowEmoji(false); fileInputRef.current?.click(); }}
          className="shrink-0 p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40"
          title="Attach image"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          onClick={() => setShowEmoji(false)}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-sliit-orange text-[15px] shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
        />

        {/* Send */}
        <button
          type="submit"
          disabled={disabled || (!value.trim() && !imageFile)}
          className={`shrink-0 p-3 ${accentClass} disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-sm`}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
