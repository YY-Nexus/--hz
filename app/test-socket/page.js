"use client"

import { useState, useEffect } from "react"
import {
  initYanYuSocket,
  isYanYuSocketConnected,
  sendChatMessage,
  onYanYuSocketEvent,
  offYanYuSocketEvent,
  disconnectYanYuSocket,
} from "@/lib/socket"

export default function TestSocketPage() {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [userName, setUserName] = useState("测试用户")
  const [loading, setLoading] = useState(false)

  // 初始化Socket连接
  useEffect(() => {
    const setupSocket = async () => {
      try {
        setLoading(true)
        await initYanYuSocket()

        // 监听连接状态变化
        const handleConnect = () => setConnected(true)
        const handleDisconnect = () => setConnected(false)

        // 监听聊天消息
        const handleChatMessage = (message) => {
          setMessages((prev) => [...prev, message])
        }

        // 监听欢迎消息
        const handleWelcome = (data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: "welcome_" + Date.now(),
              text: data.message,
              user: "YanYu Cloud³ 系统",
              timestamp: data.timestamp,
              isSystem: true,
            },
          ])
        }

        onYanYuSocketEvent("connect", handleConnect)
        onYanYuSocketEvent("disconnect", handleDisconnect)
        onYanYuSocketEvent("chat:message", handleChatMessage)
        onYanYuSocketEvent("welcome", handleWelcome)

        // 检查初始连接状态
        setConnected(isYanYuSocketConnected())

        // 清理函数
        return () => {
          offYanYuSocketEvent("connect", handleConnect)
          offYanYuSocketEvent("disconnect", handleDisconnect)
          offYanYuSocketEvent("chat:message", handleChatMessage)
          offYanYuSocketEvent("welcome", handleWelcome)
        }
      } catch (error) {
        console.error("Socket初始化失败:", error)
      } finally {
        setLoading(false)
      }
    }

    setupSocket()

    // 组件卸载时断开连接
    return () => {
      disconnectYanYuSocket()
    }
  }, [])

  // 发送消息
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !connected) return

    try {
      sendChatMessage(inputMessage, userName)
      setInputMessage("")
    } catch (error) {
      console.error("发送消息失败:", error)
      alert("发送消息失败: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YanYu Cloud³ WebSocket 测试页面</h1>
          <p className="text-gray-600">测试实时通信功能 - www.0379.vin</p>
        </div>

        {/* 连接状态 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">连接状态</h2>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  loading ? "bg-yellow-500" : connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`font-medium ${loading ? "text-yellow-600" : connected ? "text-green-600" : "text-red-600"}`}
              >
                {loading ? "连接中..." : connected ? "已连接" : "未连接"}
              </span>
            </div>
          </div>
          {connected && <p className="text-sm text-gray-500 mt-2">YanYu Cloud³ 实时通信服务运行正常</p>}
        </div>

        {/* 用户设置 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">用户设置</h2>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">用户名:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入您的用户名"
            />
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-xl font-semibold">实时聊天测试</h2>
          </div>

          {/* 消息列表 */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">暂无消息，开始测试聊天功能吧！</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-4 ${msg.isSystem ? "text-center" : ""}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-xs ${
                      msg.isSystem
                        ? "bg-blue-100 text-blue-800 text-sm"
                        : msg.user === userName
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {!msg.isSystem && <div className="text-xs opacity-75 mb-1">{msg.user}</div>}
                    <div>{msg.text}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>

          {/* 消息输入 */}
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="输入测试消息..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!connected}
              />
              <button
                type="submit"
                disabled={!connected || !inputMessage.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
              >
                发送
              </button>
            </div>
            {!connected && <p className="text-sm text-red-500 mt-2">请等待连接建立后再发送消息</p>}
          </form>
        </div>

        {/* 调试信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>YanYu Cloud³ WebSocket 测试环境</p>
          <p>如有问题，请联系: china@0379.email</p>
        </div>
      </div>
    </div>
  )
}
