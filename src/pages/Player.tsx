import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { VideoPlayer } from '../components/VideoPlayer'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Play,
  SkipBack,
  SkipForward,
  List,
  X,
  Youtube,
  Video,
  Clock,
  Monitor
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PlayerPage() {
  // 修改这里：使用新的存储格式
  const {
    getCurrentVideos,
    currentIndex,
    next,
    previous,
    setCurrentIndex,
    getCurrentPlaylist
  } = usePlaylistStore()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [playbackState] = useState<'playing' | 'paused' | 'loading'>('loading')
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 获取当前播放列表和视频
  const currentPlaylist = getCurrentPlaylist()
  const playlist = getCurrentVideos()

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

  // 如果没有当前播放列表或播放列表为空，重定向到播放列表页面
  useEffect(() => {
    if (!currentPlaylist || playlist.length === 0) {
      navigate({ to: '/playlist' })
    }
  }, [currentPlaylist, playlist.length, navigate])

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 如果没有播放列表或播放列表为空，显示空状态
  if (!currentPlaylist || playlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            {!currentPlaylist ? '未选择播放列表' : '播放列表为空'}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            {!currentPlaylist ? '请先选择一个播放列表' : '请先添加视频片段'}
          </p>
          <button
            onClick={() => navigate({ to: '/playlist' })}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            {!currentPlaylist ? '选择播放列表' : '编辑播放列表'}
          </button>
        </div>
      </div>
    )
  }

  const currentVideo = playlist[currentIndex]
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
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToPlaylist')}
              </button>
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

                  <div className={`px-2 py-1 rounded text-xs font-medium ${playbackState === 'playing' ? 'bg-green-100 text-green-700' :
                      playbackState === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {playbackState === 'playing' ? '播放中' :
                      playbackState === 'paused' ? '暂停' : '加载中'}
                  </div>
                </div>

                {/* 进度条 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('playProgress')}</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    />
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
                        <p className="text-sm opacity-80">{currentPlaylist.name}</p>
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
                          {t('exitFullscreen')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧播放列表 */}
          {!isFullscreen && !showPlaylist && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <List className="w-5 h-5" />
                    {currentPlaylist.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Monitor className="w-4 h-4" />
                    {playlist.length} {t('videosCount')}
                    <Clock className="w-4 h-4" />
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {playlist.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => jumpToVideo(index)}
                      className={`p-3 cursor-pointer transition hover:bg-gray-50 ${index === currentIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
                    {currentPlaylist.name}
                  </h3>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto h-full pb-20">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => jumpToVideo(index)}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${index === currentIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
                          开始: {video.start}s
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
      </div>
    </div>
  )
}