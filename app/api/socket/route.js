import { Server as SocketIOServer } from "socket.io"
import { NextResponse } from "next/server"

// 全局Socket.IO服务器实例
let io

export async function GET(req, res) {
  if (!res.socket.server.io) {
    console.log("正在初始化YanYu Cloud³ Socket.IO服务器...")

    // 创建Socket.IO服务器实例
    const httpServer = res.socket.server
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: ["http://localhost:3000", "https://www.0379.vin", "https://0379.vin"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    // 连接事件处理
    io.on("connection", (socket) => {
      console.log(`YanYu Cloud³: 新客户端连接 ${socket.id}`)

      // 发送欢迎消息
      socket.emit("welcome", {
        message: "欢迎使用YanYu Cloud³实时通信服务！",
        timestamp: new Date().toISOString(),
        server: "YanYu Cloud³ v1.0.0",
      })

      // 处理聊天消息
      socket.on("chat:message", (data) => {
        console.log("收到聊天消息:", data)

        // 广播消息给所有连接的客户端
        io.emit("chat:message", {
          ...data,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          server: "YanYu Cloud³",
        })
      })

      // 处理用户状态更新
      socket.on("user:status", (status) => {
        console.log(`用户状态更新: ${socket.id} -> ${status}`)
        socket.broadcast.emit("user:status", {
          userId: socket.id,
          status: status,
          timestamp: new Date().toISOString(),
        })
      })

      // 处理房间加入
      socket.on("room:join", (roomName) => {
        socket.join(roomName)
        console.log(`用户 ${socket.id} 加入房间: ${roomName}`)

        socket.to(roomName).emit("room:user-joined", {
          userId: socket.id,
          room: roomName,
          timestamp: new Date().toISOString(),
        })
      })

      // 处理房间离开
      socket.on("room:leave", (roomName) => {
        socket.leave(roomName)
        console.log(`用户 ${socket.id} 离开房间: ${roomName}`)

        socket.to(roomName).emit("room:user-left", {
          userId: socket.id,
          room: roomName,
          timestamp: new Date().toISOString(),
        })
      })

      // 处理断开连接
      socket.on("disconnect", (reason) => {
        console.log(`YanYu Cloud³: 客户端断开连接 ${socket.id}, 原因: ${reason}`)
      })

      // 错误处理
      socket.on("error", (error) => {
        console.error("Socket错误:", error)
      })
    })

    // 将Socket.IO实例附加到服务器
    res.socket.server.io = io
    console.log("YanYu Cloud³ Socket.IO服务器初始化完成！")
  } else {
    console.log("YanYu Cloud³ Socket.IO服务器已在运行")
  }

  return NextResponse.json({
    success: true,
    message: "YanYu Cloud³ WebSocket服务已启动",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
}

// 处理POST请求（可用于服务器端主动推送消息）
export async function POST(req, res) {
  try {
    const body = await req.json()

    if (res.socket.server.io) {
      // 服务器端主动推送消息
      res.socket.server.io.emit("server:broadcast", {
        ...body,
        timestamp: new Date().toISOString(),
        source: "YanYu Cloud³ Server",
      })

      return NextResponse.json({
        success: true,
        message: "消息已广播",
        data: body,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Socket.IO服务器未初始化",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("POST请求处理错误:", error)
    return NextResponse.json(
      {
        success: false,
        message: "服务器错误",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
