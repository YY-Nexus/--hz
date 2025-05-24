import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">YanYu Cloud³</h1>
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">实时通信平台</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-900 hover:text-blue-600">
                首页
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-blue-600">
                聊天室
              </Link>
              <Link href="/test-socket" className="text-gray-600 hover:text-blue-600">
                测试页面
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">欢迎使用 YanYu Cloud³ 实时通信平台</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于WebSocket技术，为www.0379.vin提供高性能、可靠的实时通信服务
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-4xl text-blue-600 mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">实时聊天</h3>
              <p className="text-gray-600 mb-4">支持多房间、私聊、消息回复等功能，消息实时送达</p>
              <Link href="/chat" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                进入聊天室
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-4xl text-blue-600 mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">用户状态</h3>
              <p className="text-gray-600 mb-4">实时显示用户在线状态、输入状态，增强互动体验</p>
              <Link href="/chat" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                查看在线用户
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-4xl text-blue-600 mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">实时通知</h3>
              <p className="text-gray-600 mb-4">系统消息、用户活动通知，让您不错过任何重要信息</p>
              <Link
                href="/test-socket"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                测试通知功能
              </Link>
            </div>
          </div>
        </div>

        {/* 技术说明 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h3 className="text-xl font-semibold mb-4">技术实现</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">前端技术</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Next.js 14 应用框架</li>
                <li>Socket.IO Client 客户端库</li>
                <li>Tailwind CSS 样式框架</li>
                <li>React Hooks 状态管理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">后端技术</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Next.js API Routes 服务端接口</li>
                <li>Socket.IO Server 服务端</li>
                <li>实时事件处理系统</li>
                <li>房间管理与消息广播</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">&copy; {new Date().getFullYear()} YanYu Cloud³. 保留所有权利。</p>
            </div>
            <div className="flex space-x-6">
              <a href="mailto:china@0379.email" className="text-gray-600 hover:text-blue-600">
                联系我们
              </a>
              <a
                href="https://www.0379.vin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
              >
                官方网站
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
