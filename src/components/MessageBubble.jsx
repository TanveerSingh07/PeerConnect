export default function MessageBubble({ message, isOwn }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}