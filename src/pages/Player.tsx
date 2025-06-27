import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { VideoPlayer } from '../components/VideoPlayer'
import { useNavigate } from '@tanstack/react-router'

export default function PlayerPage() {
  const { playlist, currentIndex, next, previous, setCurrentIndex } = usePlaylistStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [playbackState] = useState<'playing' | 'paused' | 'loading'>('loading')
  const navigate = useNavigate()

  // 获取视频平台信息
  const getVideoInfo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { platform: 'YouTube', icon: '🎥' }
    } else if (url.includes('bilibili.com')) {
      return { platform: 'B站', icon: '📺' }
    } else if (url.includes('vimeo.com')) {
      return { platform: 'Vimeo', icon: '🎬' }
    }
    return { platform: '视频文件', icon: '🎞️' }
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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="text-4xl mb-3 text-gray-300">📹</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">播放列表为空</h2>
          <p className="text-gray-500 text-sm mb-4">请先添加视频片段</p>
          <button
            onClick={() => navigate({ to: '/playlist' })}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
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
    <div className={`min-h-screen ${isFullscreen ? 'bg-black p-0' : 'bg-green-50'}`}>
      {/* 顶部控制栏 */}
      {!isFullscreen && (
        <div className="bg-white border border-green-100 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: '/playlist' })}
                className="text-gray-400 hover:text-green-600 transition-colors text-sm"
              >
                ← 返回
              </button>
              <h1 className="font-medium text-gray-800">播放器</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {currentIndex + 1} / {playlist.length}
              </span>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                列表
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                全屏
              </button>
            </div>
          </div>

          {/* 进度条 */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>进度</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(getPlayedDuration())}</span>
              <span>{formatTime(getTotalDuration())}</span>
            </div>
          </div>
        </div>
      )}

      {/* 主播放区域 */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'bg-white border border-green-100 rounded-lg overflow-hidden'}`}>
        {/* 视频播放器 */}
        <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
          <VideoPlayer
            key={`${currentVideo.url}-${currentIndex}`}
            url={currentVideo.url}
            start={currentVideo.start}
            end={currentVideo.end}
            onEnded={next}
          />

          {/* 全屏时的覆盖控制层 */}
          {isFullscreen && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <h2 className="text-lg font-medium">
                    {getVideoInfo(currentVideo.url).icon} {getVideoInfo(currentVideo.url).platform}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {formatTime(currentVideo.start)}-{formatTime(currentVideo.end)} 
                    · {currentIndex + 1}/{playlist.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="bg-black/50 px-3 py-2 rounded disabled:opacity-50 hover:bg-black/70 transition-colors text-sm"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={next}
                    className="bg-black/50 px-3 py-2 rounded hover:bg-black/70 transition-colors text-sm"
                  >
                    ⏭
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="bg-black/50 px-3 py-2 rounded hover:bg-black/70 transition-colors text-sm"
                  >
                    退出
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 非全屏时的底部控制栏 */}
        {!isFullscreen && (
          <div className="bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-gray-800 truncate">
                  {getVideoInfo(currentVideo.url).icon} 第 {currentIndex + 1} 个视频
                </h2>
                <p className="text-xs text-gray-500">
                  {formatTime(currentVideo.start)}-{formatTime(currentVideo.end)} 
                  ({formatTime(currentVideo.end - currentVideo.start)})
                </p>
              </div>
              
              <div className="ml-4">
                <span className={`text-xs px-2 py-1 rounded ${
                  playbackState === 'playing' ? 'bg-green-500 text-white' : 
                  playbackState === 'paused' ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {playbackState === 'playing' ? '播放中' : 
                   playbackState === 'paused' ? '暂停' : '加载中'}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="bg-gray-200 px-3 py-2 rounded text-sm disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                ⏮ 上一个
              </button>
              <button
                onClick={next}
                className="bg-lime-500 text-white px-3 py-2 rounded text-sm hover:bg-lime-600 transition-colors"
              >
                ⏭ 下一个
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 播放列表侧边栏 */}
      {showPlaylist && !isFullscreen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 border-l border-green-100">
          <div className="p-4 bg-green-50 border-b border-green-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">播放列表</h3>
              <button
                onClick={() => setShowPlaylist(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {playlist.length} 个视频 · {formatTime(getTotalDuration())}
            </p>
          </div>
          
          <div className="overflow-y-auto h-full pb-20">
            {playlist.map((video, index) => (
              <div
                key={index}
                onClick={() => jumpToVideo(index)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors ${
                  index === currentIndex ? 'bg-lime-50 border-l-2 border-l-lime-500' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">
                    {index + 1}
                  </span>
                  {index === currentIndex && (
                    <span className="text-lime-500 text-xs">▶</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {getVideoInfo(video.url).icon} 视频 {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(video.start)}-{formatTime(video.end)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 遮罩层 */}
      {showPlaylist && !isFullscreen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowPlaylist(false)}
        />
      )}

      {/* 快捷键提示 */}
      {!isFullscreen && (
        <div className="mt-4 bg-green-100 rounded-lg p-3 text-center">
          <p className="text-green-700 text-xs">
            ← → 切换视频 · F 全屏 · 空格 播放/暂停 · ESC 关闭面板
          </p>
        </div>
      )}
    </div>
  )
}