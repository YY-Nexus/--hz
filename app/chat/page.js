"use client"

import { useState, useEffect } from "react"
import ChatInterface from "@/components/chat/ChatInterface"
import OnlineUsers from "@/components/chat/OnlineUsers"
import ChatRooms from "@/components/chat/ChatRooms"
import { initYanYuSocket } from "@/lib/socket"

export default function ChatPage() {
  const [userName, setUserName] = useState("")
  const [currentRoom, setCurrentRoom] = useState("general")
  const [isConnected, setIsConnected] = useState(false)
  const [userId] = useState(() => `user_${Math.random().toString(36).substring(2, 9)}`)
  const [showSettings, setShowSettings] = useState(false)

  // 初始化Socket连接
  useEffect(() => {
    const setupSocket = async () => {
      try {
        await initYanYuSocket()
      } catch (error) {
        console.error("聊天页面初始化失败:", error)
      }
    }

    setupSocket()
  }, [])

  // 从本地存储加载用户名
  useEffect(() => {
    const savedUserName = localStorage.getItem("yanyu-chat-username")
    if (savedUserName) {
      setUserName(savedUserName)
    } else {
      setShowSettings(true)
    }
  }, [])

  // 保存用户名到本地存储
  const handleSaveUserName = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem("yanyu-chat-username", userName)
      setShowSettings(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">YanYu Cloud³</h1>
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">聊天室</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-600">{isConnected ? "已连接" : "未连接"}</span>
              </div>
              <button onClick={() => setShowSettings(!showSettings)} className="text-gray-600 hover:text-blue-600">
                设置
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">用户设置</h2>
            <form onSubmit={handleSaveUserName} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  您的昵称
                </label>
                <input
                  type="text"
                  id="username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="请输入您的昵称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                保存
              </button>
            </form>
          </div>
        )}

        {/* 聊天区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="lg:col-span-1 space-y-6">
            <ChatRooms currentRoom={currentRoom} onRoomChange={setCurrentRoom} userName={userName || "访客用户"} />
            <OnlineUsers roomId={currentRoom} currentUserId={userId} />
          </div>

          {/* 聊天主界面 */}
          <div className="lg:col-span-3">
            <ChatInterface
              userName={userName || "访客用户"}
              roomId={currentRoom}
              onConnectionChange={setIsConnected}
              height="70vh"
            />
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-600 text-sm">
            YanYu Cloud³ 实时通信平台 &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  )
}
