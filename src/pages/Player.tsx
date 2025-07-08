import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { VideoPlayer } from '../components/VideoPlayer'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Play,
  List,
  X,
  Youtube,
  Video,
  Monitor
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PlayerPage() {
  // 修改这里：使用新的存储格式
  const {
    getCurrentVideos,
    currentIndex,
    next,
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

  const getProgress = () => {
    return ((currentIndex + 1) / playlist.length) * 100
  }

  const jumpToVideo = (index: number) => {
    setCurrentIndex(index)
    setShowPlaylist(false)
  }


return (
  <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'p-0' : 'p-4 lg:p-6'}`}>
    <div className="max-w-7xl mx-auto">
      {/* 顶部导航栏 */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('backToPlaylist')}</span>
            </button>
          </div>
          
          {/* 移动端播放列表按钮 */}
          <button
            onClick={() => setShowPlaylist(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <List className="w-4 h-4" />
            <span className="text-sm">播放列表</span>
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${!isFullscreen ? 'lg:m-8' : ''}`}>
        {/* 左侧主播放区域 */}
        <div className={`${!isFullscreen ? 'lg:col-span-3' : 'col-span-4'}`}>
          {/* 播放器信息卡片 */}
          {!isFullscreen && (
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{currentPlaylist.name}</h2>
                    <p className="text-sm text-gray-500">
                      {currentIndex + 1} / {playlist.length} 
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    playbackState === 'playing' ? 'bg-green-100 text-green-700' :
                    playbackState === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t(playbackState === 'playing' ? 'playing' :
                      playbackState === 'paused' ? 'pause' : 'playing')}
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
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
          <div className={`relative ${isFullscreen ? 'h-screen' : 'bg-white rounded-xl shadow-sm border overflow-hidden'}`}>
            <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
              <VideoPlayer
                key={`${currentVideo.url}-${currentIndex}`}
                url={currentVideo.url}
                start={currentVideo.start}
                onEnded={next}
              />

              {/* 全屏模式控制栏 */}
              {isFullscreen && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold flex items-center gap-3 mb-2">
                        {getVideoInfo(currentVideo.url).icon}
                        <span>{currentVideo.title || `视频 ${currentIndex + 1}`}</span>
                      </h2>
                      <p className="text-sm opacity-80 flex items-center gap-2">
                        <span>{currentPlaylist.name}</span>
                        <span>•</span>
                        <span>{currentIndex + 1} / {playlist.length}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧播放列表 (桌面端) */}
        {!isFullscreen && (
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border sticky top-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                  <List className="w-5 h-5" />
                  {t('playlist')}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Monitor className="w-4 h-4" />
                    {playlist.length} {t('videos')}
                  </span>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => jumpToVideo(index)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                      index === currentIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {index === currentIndex ? (
                          <Play className="w-4 h-4 text-blue-500" />
                        ) : (
                          <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                        )}
                      </div>
                      
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

      {/* 移动端播放列表侧边栏 */}
      {showPlaylist && !isFullscreen && (
        <>
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-xl z-50 lg:hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  {t('playlist')}
                </h3>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">{currentPlaylist.name}</p>
            </div>
            
            <div className="overflow-y-auto h-full pb-20">
              {playlist.map((video, index) => (
                <div
                  key={index}
                  onClick={() => {
                    jumpToVideo(index);
                    setShowPlaylist(false);
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 ${
                    index === currentIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      {index === currentIndex ? (
                        <Play className="w-4 h-4 text-blue-500" />
                      ) : (
                        <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                      )}
                    </div>
                    
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