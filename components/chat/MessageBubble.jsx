"use client"

import { useState } from "react"
import UserAvatar from "./UserAvatar"

export default function MessageBubble({
  message,
  isCurrentUser = false,
  showAvatar = true,
  status = "delivered",
  timestamp,
  onReply,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false)

  // 格式化时间戳
  const formatTime = (timestamp) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // 状态图标
  const statusIcon = {
    sending: "⏳",
    delivered: "✓",
    read: "✓✓",
    failed: "⚠️",
  }

  // 检测是否为系统消息
  const isSystemMessage = message.type === "system"

  // 检测是否包含链接
  const hasLinks = message.text && message.text.match(/https?:\/\/[^\s]+/)

  // 渲染消息文本，处理链接
  const renderMessageText = (text) => {
    if (!text) return ""

    // 简单的链接检测和渲染
    if (hasLinks) {
      const parts = text.split(/\b(https?:\/\/[^\s]+)\b/)
      return parts.map((part, index) => {
        if (part.match(/^https?:\/\//)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {part}
            </a>
          )
        }
        return part
      })
    }

    return text
  }

  // 系统消息样式
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-xs py-1 px-3 rounded-full">{message.text}</div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-start gap-2 mb-4 group ${isCurrentUser ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 头像 */}
      {showAvatar ? (
        <UserAvatar
          username={message.user}
          status={isCurrentUser ? undefined : message.userStatus || "offline"}
          size="sm"
        />
      ) : (
        <div className="w-8"></div>
      )}

      {/* 消息内容 */}
      <div className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
        {/* 用户名 */}
        {!isCurrentUser && showAvatar && <div className="text-xs text-gray-500 mb-1 ml-1">{message.user}</div>}

        {/* 消息气泡 */}
        <div
          className={`relative px-3 py-2 rounded-lg ${
            isCurrentUser ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
          }`}
        >
          {renderMessageText(message.text)}

          {/* 时间和状态 */}
          <div className={`text-xs mt-1 flex items-center gap-1 ${isCurrentUser ? "text-blue-200" : "text-gray-500"}`}>
            <span>{formatTime(timestamp || message.timestamp)}</span>
            {isCurrentUser && <span>{statusIcon[status]}</span>}
          </div>
        </div>

        {/* 消息操作按钮 */}
        {showActions && (
          <div className={`flex gap-2 mt-1 text-xs text-gray-500 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            {onReply && (
              <button onClick={() => onReply(message)} className="hover:text-blue-600">
                回复
              </button>
            )}
            {isCurrentUser && onDelete && (
              <button onClick={() => onDelete(message)} className="hover:text-red-600">
                删除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
