"use client"

import { useState, useEffect } from "react"

export default function UserAvatar({ username, status = "offline", size = "md" }) {
  const [initials, setInitials] = useState("")
  const [bgColor, setBgColor] = useState("")

  // 根据用户名生成头像背景色
  useEffect(() => {
    if (username) {
      // 提取首字母
      const parts = username.split(/\s+/)
      const initial = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : username.substring(0, 2)

      setInitials(initial.toUpperCase())

      // 根据用户名生成一致的颜色
      const hash = username.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)

      const h = Math.abs(hash) % 360
      setBgColor(`hsl(${h}, 70%, 60%)`)
    }
  }, [username])

  // 尺寸映射
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  }

  // 状态指示器尺寸
  const statusSizes = {
    sm: "w-2 h-2 right-0 bottom-0",
    md: "w-3 h-3 right-0 bottom-0",
    lg: "w-3 h-3 right-0 bottom-0",
    xl: "w-4 h-4 right-0 bottom-0",
  }

  // 状态颜色映射
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    typing: "bg-blue-500",
  }

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium`}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>

      {/* 状态指示器 */}
      {status && (
        <div
          className={`absolute border-2 border-white rounded-full ${statusSizes[size]} ${statusColors[status] || "bg-gray-400"}`}
        ></div>
      )}
    </div>
  )
}
