import "./globals.css"

export const metadata = {
  title: "YanYu Cloud³ 实时通信平台 - www.0379.vin",
  description: "YanYu Cloud³提供的专业WebSocket实时通信服务，支持即时消息、在线状态和数据同步",
  keywords: "YanYu Cloud³, 实时通信, WebSocket, 0379, 洛阳",
  authors: [{ name: "YanYu Cloud³", url: "https://www.0379.vin" }],
  creator: "YanYu Cloud³",
  publisher: "YanYu Cloud³",
  openGraph: {
    title: "YanYu Cloud³ 实时通信平台",
    description: "专业的WebSocket实时通信服务",
    url: "https://www.0379.vin",
    siteName: "YanYu Cloud³",
    locale: "zh_CN",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
