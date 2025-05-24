"use client"

import { io } from "socket.io-client"

// Socket.IO客户端实例
let socket

// 连接状态
let isConnected = false

// 事件监听器存储
const eventListeners = new Map()

/**
 * 初始化YanYu Cloud³ Socket连接
 */
export const initYanYuSocket = async () => {
  if (socket && isConnected) {
    console.log("YanYu Cloud³ Socket已连接，无需重复初始化")
    return socket
  }

  try {
    // 确保服务器端Socket.IO已初始化
    const response = await fetch("/api/socket")
    const result = await response.json()

    if (!result.success) {
      throw new Error("服务器Socket.IO初始化失败")
    }

    console.log("YanYu Cloud³ Socket服务器响应:", result)

    // 创建Socket.IO客户端连接
    socket = io({
      path: "/api/socket",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    // 连接成功事件
    socket.on("connect", () => {
      isConnected = true
      console.log("🎉 YanYu Cloud³ Socket连接成功！ID:", socket.id)
    })

    // 连接错误事件
    socket.on("connect_error", (error) => {
      isConnected = false
      console.error("❌ YanYu Cloud³ Socket连接错误:", error)
    })

    // 断开连接事件
    socket.on("disconnect", (reason) => {
      isConnected = false
      console.log("🔌 YanYu Cloud³ Socket连接断开:", reason)
    })

    // 重连事件
    socket.on("reconnect", (attemptNumber) => {
      isConnected = true
      console.log(`🔄 YanYu Cloud³ Socket重连成功，尝试次数: ${attemptNumber}`)
    })

    // 欢迎消息
    socket.on("welcome", (data) => {
      console.log("📨 收到YanYu Cloud³欢迎消息:", data)
    })

    return socket
  } catch (error) {
    console.error("YanYu Cloud³ Socket初始化失败:", error)
    throw error
  }
}

/**
 * 获取当前Socket实例
 */
export const getYanYuSocket = () => {
  if (!socket) {
    throw new Error("YanYu Cloud³ Socket未初始化，请先调用initYanYuSocket()")
  }
  return socket
}

/**
 * 检查连接状态
 */
export const isYanYuSocketConnected = () => {
  return socket && isConnected && socket.connected
}

/**
 * 发送聊天消息
 */
export const sendChatMessage = (message, user = "Anonymous") => {
  if (!isYanYuSocketConnected()) {
    throw new Error("YanYu Cloud³ Socket未连接")
  }

  const messageData = {
    text: message,
    user: user,
    clientId: socket.id,
    timestamp: new Date().toISOString(),
  }

  socket.emit("chat:message", messageData)
  return messageData
}

/**
 * 更新用户状态
 */
export const updateUserStatus = (status) => {
  if (!isYanYuSocketConnected()) {
    throw new Error("YanYu Cloud³ Socket未连接")
  }

  socket.emit("user:status", status)
}

/**
 * 加入房间
 */
export const joinRoom = (roomName) => {
  if (!isYanYuSocketConnected()) {
    throw new Error("YanYu Cloud³ Socket未连接")
  }

  socket.emit("room:join", roomName)
}

/**
 * 离开房间
 */
export const leaveRoom = (roomName) => {
  if (!isYanYuSocketConnected()) {
    throw new Error("YanYu Cloud³ Socket未连接")
  }

  socket.emit("room:leave", roomName)
}

/**
 * 添加事件监听器
 */
export const onYanYuSocketEvent = (event, callback) => {
  if (!socket) {
    throw new Error("YanYu Cloud³ Socket未初始化")
  }

  socket.on(event, callback)

  // 存储监听器以便后续清理
  if (!eventListeners.has(event)) {
    eventListeners.set(event, [])
  }
  eventListeners.get(event).push(callback)
}

/**
 * 移除事件监听器
 */
export const offYanYuSocketEvent = (event, callback) => {
  if (!socket) return

  socket.off(event, callback)

  // 从存储中移除
  if (eventListeners.has(event)) {
    const listeners = eventListeners.get(event)
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

/**
 * 断开连接并清理
 */
export const disconnectYanYuSocket = () => {
  if (socket) {
    // 清理所有事件监听器
    eventListeners.forEach((listeners, event) => {
      listeners.forEach((callback) => {
        socket.off(event, callback)
      })
    })
    eventListeners.clear()

    // 断开连接
    socket.disconnect()
    socket = null
    isConnected = false

    console.log("🔌 YanYu Cloud³ Socket已断开并清理")
  }
}

// 页面卸载时自动清理
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", disconnectYanYuSocket)
}
