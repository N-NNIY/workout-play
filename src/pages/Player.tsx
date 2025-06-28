import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { VideoPlayer } from '../components/VideoPlayer'
import { useNavigate } from '@tanstack/react-router'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize, 
  List,
  X,
  Youtube,
  Video,
  Clock,
  Monitor
} from 'lucide-react'

export default function PlayerPage() {
  const { playlist, currentIndex, next, previous, setCurrentIndex } = usePlaylistStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [playbackState] = useState<'playing' | 'paused' | 'loading'>('loading')
  const navigate = useNavigate()

  // 获取视频平台信息
  const getVideoInfo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { platform: 'YouTube', icon: <Youtube className="w-4 h-4" /> }
    } else if (url.includes('bilibili.com')) {
      return { platform: 'B站', icon: <Video className="w-4 h-4" /> }
    } else if (url.includes('vimeo.com')) {
      return { platform: 'Vimeo', icon: <Video className="w-4 h-4" /> }
    }
    return { platform: '视频文件', icon: <Video className="w-4 h-4" /> }
  }

  // 如果播放列表为空，重定向到播放列表页面
  useEffect(() => {
    if (playlist.length === 0) {
      navigate({ to: '/playlist' })
    }
  }, [playlist.length, navigate])

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          // 这里可以控制播放/暂停，需要通过 VideoPlayer 组件暴露方法
          break
        case 'ArrowLeft':
          e.preventDefault()
          previous()
          break
        case 'ArrowRight':
          e.preventDefault()
          next()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          if (showPlaylist) setShowPlaylist(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [next, previous, showPlaylist])

  if (playlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">播放列表为空</h2>
          <p className="text-gray-500 text-sm mb-4">请先添加视频片段</p>
          <button
            onClick={() => navigate({ to: '/playlist' })}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            创建播放列表
          </button>
        </div>
      </div>
    )
  }

  const currentVideo = playlist[currentIndex]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error)
    }
  }

  const getProgress = () => {
    return ((currentIndex + 1) / playlist.length) * 100
  }

  const jumpToVideo = (index: number) => {
    setCurrentIndex(index)
    setShowPlaylist(false)
  }

  const getTotalDuration = () => {
    return playlist.reduce((total, seg) => total + (seg.end - seg.start), 0)
  }

  const getPlayedDuration = () => {
    return playlist
      .slice(0, currentIndex)
      .reduce((total, seg) => total + (seg.end - seg.start), 0)
  }

  const handlePrevious = () => {
    previous()
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'p-0' : 'p-6'}`}>
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航栏 */}
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: '/playlist' })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                返回播放列表
              </button>
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Play className="w-6 h-6" />
                视频播放器
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧主播放区域 */}
          <div className={`${!isFullscreen ? 'lg:col-span-3' : 'col-span-4'}`}>
            {/* 顶部信息栏 */}
            {!isFullscreen && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Monitor className="w-4 h-4" />
                    第 {currentIndex + 1} / {playlist.length} 个
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    总时长 {formatTime(getTotalDuration())}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    playbackState === 'playing' ? 'bg-green-100 text-green-700' :
                    playbackState === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {playbackState === 'playing' ? '播放中' :
                      playbackState === 'paused' ? '暂停' : '加载中'}
                  </div>
                </div>
                
                {/* 进度条 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>播放进度</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(getPlayedDuration())}</span>
                    <span>{formatTime(getTotalDuration())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 视频播放器 */}
            <div className={`relative ${isFullscreen ? 'h-screen' : 'bg-white rounded-lg shadow-sm border overflow-hidden'}`}>
              <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
                <VideoPlayer
                  key={`${currentVideo.url}-${currentIndex}`}
                  url={currentVideo.url}
                  start={currentVideo.start}
                  end={currentVideo.end}
                  onEnded={next}
                />

                {isFullscreen && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex justify-between items-center text-white">
                      <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          {getVideoInfo(currentVideo.url).icon} 
                          {getVideoInfo(currentVideo.url).platform}
                        </h2>
                        <p className="text-sm text-gray-300">
                          {formatTime(currentVideo.start)} - {formatTime(currentVideo.end)} · {currentIndex + 1}/{playlist.length}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevious}
                          disabled={currentIndex === 0}
                          className="bg-black/40 hover:bg-black/70 p-2 rounded-lg disabled:opacity-50"
                        >
                          <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                          onClick={next}
                          className="bg-black/40 hover:bg-black/70 p-2 rounded-lg"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="bg-black/40 hover:bg-black/70 px-4 py-2 rounded-lg text-sm"
                        >
                          退出
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部控制区域 */}
            {!isFullscreen && (
              <div className="bg-white rounded-lg shadow-sm border mt-4 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-medium text-gray-800 truncate flex items-center gap-2">
                      {getVideoInfo(currentVideo.url).icon} 
                      {currentVideo.title || `第 ${currentIndex + 1} 个视频`}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{getVideoInfo(currentVideo.url).platform}</span>
                      <span>•</span>
                      <span>{formatTime(currentVideo.start)} - {formatTime(currentVideo.end)}</span>
                      <span>•</span>
                      <span>({formatTime(currentVideo.end - currentVideo.start)})</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
                    >
                      <List className="w-4 h-4" />
                      列表
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
                    >
                      <Maximize className="w-4 h-4" />
                      全屏
                    </button>
                  </div>
                </div>
                
                {/* 播放控制按钮 */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-lg transition"
                  >
                    <SkipBack className="w-4 h-4" />
                    上一个
                  </button>
                  <button
                    className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition"
                  >
                    下一个
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右侧播放列表 */}
          {!isFullscreen && !showPlaylist && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <List className="w-5 h-5" />
                    播放队列
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Monitor className="w-4 h-4" />
                    {playlist.length} 个视频
                    <Clock className="w-4 h-4" />
                    {formatTime(getTotalDuration())}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {playlist.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => jumpToVideo(index)}
                      className={`p-3 cursor-pointer transition hover:bg-gray-50 ${
                        index === currentIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                        {index === currentIndex && (
                          <Play className="w-4 h-4 text-blue-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                            {getVideoInfo(video.url).icon}
                            {video.title || `视频 ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getVideoInfo(video.url).platform} • {formatTime(video.start)} - {formatTime(video.end)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 移动端播放列表覆盖层 */}
        {showPlaylist && !isFullscreen && (
          <>
            <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-xl z-50 lg:hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <List className="w-5 h-5" />
                    播放列表
                  </h3>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {playlist.length} 个视频 · {formatTime(getTotalDuration())}
                </p>
              </div>
              <div className="overflow-y-auto h-full pb-20">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => jumpToVideo(index)}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                      index === currentIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                      {index === currentIndex && (
                        <Play className="w-4 h-4 text-blue-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                          {getVideoInfo(video.url).icon}
                          视频 {index + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(video.start)} - {formatTime(video.end)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setShowPlaylist(false)}
            />
          </>
        )}

        {/* 快捷键提示 */}
        {!isFullscreen && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span>← → 切换视频</span>
              <span>F 全屏</span>
              <span>Space 播放/暂停</span>
              <span>Esc 关闭面板</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}