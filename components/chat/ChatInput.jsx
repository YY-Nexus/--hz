"use client"

import { useState, useRef, useEffect } from "react"

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "输入消息...",
  replyTo = null,
  onCancelReply = () => {},
  onTypingStart = () => {},
  onTypingEnd = () => {},
}) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // 常用表情列表
  const commonEmojis = ["😊", "👍", "❤️", "🎉", "🔥", "😂", "🤔", "👏", "🙏", "✅"]

  // 处理发送消息
  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!message.trim() || disabled) return

    onSendMessage(message.trim())
    setMessage("")
    inputRef.current?.focus()

    // 发送消息后结束输入状态
    handleTypingEnd()
  }

  // 处理输入状态
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true)
      onTypingStart()
    }

    // 清除之前的超时
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // 设置新的超时
    typingTimeoutRef.current = setTimeout(handleTypingEnd, 2000)
  }

  const handleTypingEnd = () => {
    if (isTyping) {
      setIsTyping(false)
      onTypingEnd()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  // 处理输入变化
  const handleInputChange = (e) => {
    setMessage(e.target.value)
    handleTypingStart()
  }

  // 处理表情选择
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // 处理键盘快捷键
  const handleKeyDown = (e) => {
    // Ctrl+Enter 发送消息
    if (e.ctrlKey && e.key === "Enter") {
      handleSendMessage(e)
    }
  }

  // 组件卸载时清除超时
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="border-t bg-white p-3">
      {/* 回复提示 */}
      {replyTo && (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md mb-2 text-sm">
          <div className="flex items-center">
            <div className="w-1 h-10 bg-blue-500 rounded-full mr-2"></div>
            <div>
              <div className="text-xs text-gray-500">回复 {replyTo.user}</div>
              <div className="text-gray-700 truncate">{replyTo.text}</div>
            </div>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      )}

      {/* 输入表单 */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        {/* 表情按钮 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            😊
          </button>

          {/* 表情选择器 */}
          {showEmojiPicker && (
            <div className="absolute bottom-10 left-0 bg-white shadow-lg rounded-lg p-2 z-10 grid grid-cols-5 gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-xl hover:bg-gray-100 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 文本输入区 */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "连接中..." : placeholder}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <div className="absolute right-2 bottom-1 text-xs text-gray-400">{isTyping && "正在输入..."}</div>
        </div>

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
        >
          发送
        </button>
      </form>

      {/* 快捷键提示 */}
      <div className="text-xs text-gray-400 mt-1 text-right">按 Ctrl+Enter 发送</div>
    </div>
  )
}
