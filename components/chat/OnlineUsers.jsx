"use client"

import { useState, useEffect } from "react"
import UserAvatar from "./UserAvatar"
import { onYanYuSocketEvent, offYanYuSocketEvent } from "@/lib/socket"

export default function OnlineUsers({ roomId = "general", currentUserId = null }) {
  const [users, setUsers] = useState({})
  const [expanded, setExpanded] = useState(true)

  // 监听用户状态变化
  useEffect(() => {
    // 用户状态处理
    const handleUserStatus = (data) => {
      if (data.userId && data.status) {
        setUsers((prev) => ({
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            status: data.status,
            lastActive: new Date().toISOString(),
          },
        }))
      }
    }

    // 消息处理（从消息中提取用户信息）
    const handleChatMessage = (message) => {
      // 只处理当前房间的消息
      if (message.room && message.room !== roomId) return

      // 如果是用户消息，更新用户列表
      if (message.user && message.clientId && message.type !== "system") {
        setUsers((prev) => ({
          ...prev,
          [message.clientId]: {
            name: message.user,
            status: "online",
            lastActive: new Date().toISOString(),
          },
        }))
      }
    }

    // 用户加入房间
    const handleUserJoined = (data) => {
      if (data.room === roomId && data.userId) {
        setUsers((prev) => ({
          ...prev,
          [data.userId]: {
            name: data.userName || "新用户",
            status: "online",
            lastActive: new Date().toISOString(),
          },
        }))
      }
    }

    // 用户离开房间
    const handleUserLeft = (data) => {
      if (data.room === roomId && data.userId) {
        setUsers((prev) => ({
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            status: "offline",
            lastActive: new Date().toISOString(),
          },
        }))
      }
    }

    // 用户输入状态
    const handleUserTyping = (data) => {
      if (data.userId && data.room === roomId) {
        setUsers((prev) => ({
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            status: data.isTyping ? "typing" : "online",
            lastActive: new Date().toISOString(),
          },
        }))
      }
    }

    // 注册事件监听
    onYanYuSocketEvent("user:status", handleUserStatus)
    onYanYuSocketEvent("chat:message", handleChatMessage)
    onYanYuSocketEvent("room:user-joined", handleUserJoined)
    onYanYuSocketEvent("room:user-left", handleUserLeft)
    onYanYuSocketEvent("user:typing", handleUserTyping)

    // 清理函数
    return () => {
      offYanYuSocketEvent("user:status", handleUserStatus)
      offYanYuSocketEvent("chat:message", handleChatMessage)
      offYanYuSocketEvent("room:user-joined", handleUserJoined)
      offYanYuSocketEvent("room:user-left", handleUserLeft)
      offYanYuSocketEvent("user:typing", handleUserTyping)
    }
  }, [roomId])

  // 过滤和排序用户列表
  const sortedUsers = Object.entries(users)
    .filter(([id, user]) => {
      // 过滤掉长时间不活跃的用户（超过30分钟）
      if (user.lastActive) {
        const lastActive = new Date(user.lastActive)
        const now = new Date()
        const diffMinutes = (now - lastActive) / (1000 * 60)
        return diffMinutes < 30 || user.status === "online" || user.status === "typing"
      }
      return true
    })
    .sort((a, b) => {
      // 在线用户优先
      const statusOrder = {
        typing: 0,
        online: 1,
        away: 2,
        busy: 3,
        offline: 4,
      }

      // 按状态排序，相同状态按最后活跃时间排序
      if (statusOrder[a[1].status] !== statusOrder[b[1].status]) {
        return statusOrder[a[1].status] - statusOrder[b[1].status]
      }

      // 最后活跃时间降序
      if (a[1].lastActive && b[1].lastActive) {
        return new Date(b[1].lastActive) - new Date(a[1].lastActive)
      }

      return 0
    })

  // 计算在线用户数量
  const onlineCount = sortedUsers.filter(
    ([_, user]) => user.status === "online" || user.status === "typing" || user.status === "away",
  ).length

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* 标题栏 */}
      <div
        className="bg-gray-100 p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-medium">在线用户</h3>
          <div className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{onlineCount}</div>
        </div>
        <button className="text-gray-500">{expanded ? "▲" : "▼"}</button>
      </div>

      {/* 用户列表 */}
      {expanded && (
        <div className="p-3 max-h-[300px] overflow-y-auto">
          {sortedUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">暂无在线用户</div>
          ) : (
            <ul className="space-y-3">
              {sortedUsers.map(([id, user]) => (
                <li
                  key={id}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    id === currentUserId ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <UserAvatar username={user.name} status={user.status} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">
                        {user.name} {id === currentUserId && "(您)"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.lastActive && formatLastActive(user.lastActive)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{getStatusText(user.status)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// 格式化最后活跃时间
function formatLastActive(timestamp) {
  const now = new Date()
  const lastActive = new Date(timestamp)
  const diffMinutes = Math.floor((now - lastActive) / (1000 * 60))

  if (diffMinutes < 1) return "刚刚"
  if (diffMinutes < 60) return `${diffMinutes}分钟前`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}天前`
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case "online":
      return "在线"
    case "offline":
      return "离线"
    case "away":
      return "离开"
    case "busy":
      return "忙碌"
    case "typing":
      return "正在输入..."
    default:
      return ""
  }
}
