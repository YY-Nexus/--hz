"use client"

import { useState, useEffect } from "react"
import {
  onYanYuSocketEvent,
  offYanYuSocketEvent,
  joinRoom,
  leaveRoom,
  getYanYuSocket,
  isYanYuSocketConnected,
} from "@/lib/socket"

export default function ChatRooms({ currentRoom = "general", onRoomChange = () => {}, userName = "访客用户" }) {
  const [rooms, setRooms] = useState([
    { id: "general", name: "公共聊天室", description: "所有人都可以加入的公共聊天区域", userCount: 0 },
    { id: "support", name: "技术支持", description: "获取YanYu Cloud³产品的技术支持", userCount: 0 },
    { id: "random", name: "随便聊聊", description: "轻松话题，休闲交流", userCount: 0 },
  ])
  const [newRoomName, setNewRoomName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expanded, setExpanded] = useState(true)

  // 监听房间相关事件
  useEffect(() => {
    // 更新房间用户数量
    const updateRoomUserCount = (roomId, delta) => {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, userCount: Math.max(0, (room.userCount || 0) + delta) } : room,
        ),
      )
    }

    // 用户加入房间
    const handleUserJoined = (data) => {
      if (data.room) {
        updateRoomUserCount(data.room, 1)
      }
    }

    // 用户离开房间
    const handleUserLeft = (data) => {
      if (data.room) {
        updateRoomUserCount(data.room, -1)
      }
    }

    // 新房间创建
    const handleRoomCreated = (data) => {
      if (data.room && !rooms.some((r) => r.id === data.room.id)) {
        setRooms((prev) => [
          ...prev,
          {
            id: data.room.id,
            name: data.room.name,
            description: data.room.description,
            userCount: 1,
            createdBy: data.room.createdBy,
          },
        ])
      }
    }

    // 注册事件监听
    onYanYuSocketEvent("room:user-joined", handleUserJoined)
    onYanYuSocketEvent("room:user-left", handleUserLeft)
    onYanYuSocketEvent("room:created", handleRoomCreated)

    // 初始加入当前房间
    if (isYanYuSocketConnected()) {
      joinRoom(currentRoom)
    }

    // 清理函数
    return () => {
      offYanYuSocketEvent("room:user-joined", handleUserJoined)
      offYanYuSocketEvent("room:user-left", handleUserLeft)
      offYanYuSocketEvent("room:created", handleRoomCreated)
    }
  }, [currentRoom, rooms])

  // 切换房间
  const handleRoomChange = (roomId) => {
    if (roomId === currentRoom) return

    // 离开当前房间
    if (isYanYuSocketConnected()) {
      leaveRoom(currentRoom)
    }

    // 通知父组件
    onRoomChange(roomId)

    // 加入新房间
    if (isYanYuSocketConnected()) {
      joinRoom(roomId)

      // 发送系统消息通知加入
      const socket = getYanYuSocket()
      socket.emit("chat:message", {
        id: `system_${Date.now()}`,
        text: `${userName} 加入了聊天室`,
        type: "system",
        timestamp: new Date().toISOString(),
        room: roomId,
      })
    }
  }

  // 创建新房间
  const handleCreateRoom = (e) => {
    e.preventDefault()

    if (!newRoomName.trim() || !isYanYuSocketConnected()) return

    // 生成房间ID
    const roomId = newRoomName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // 检查房间ID是否已存在
    if (rooms.some((r) => r.id === roomId)) {
      alert("房间已存在，请使用其他名称")
      return
    }

    // 创建新房间
    const newRoom = {
      id: roomId,
      name: newRoomName,
      description: `由 ${userName} 创建的聊天室`,
      userCount: 0,
      createdBy: userName,
    }

    // 更新本地房间列表
    setRooms((prev) => [...prev, newRoom])

    // 通知服务器创建房间
    const socket = getYanYuSocket()
    socket.emit("room:create", {
      room: newRoom,
    })

    // 切换到新房间
    handleRoomChange(roomId)

    // 重置表单
    setNewRoomName("")
    setShowCreateForm(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* 标题栏 */}
      <div
        className="bg-gray-100 p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium">聊天室列表</h3>
        <button className="text-gray-500">{expanded ? "▲" : "▼"}</button>
      </div>

      {/* 房间列表 */}
      {expanded && (
        <div className="p-3">
          <ul className="space-y-2 mb-4">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => handleRoomChange(room.id)}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    room.id === currentRoom ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{room.name}</span>
                    {room.userCount > 0 && (
                      <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{room.userCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{room.description}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* 创建房间按钮 */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-2 px-3 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              + 创建新聊天室
            </button>
          ) : (
            <form onSubmit={handleCreateRoom} className="space-y-2">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="输入聊天室名称"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
