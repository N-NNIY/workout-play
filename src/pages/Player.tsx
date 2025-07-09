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
  <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isFullscreen ? 'p-0' : 'p-4 lg:p-6'} relative overflow-hidden`}>
    {/* 动态背景光效 */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div className="max-w-7xl mx-auto relative z-10">
      {/* 顶部导航栏 */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('backToPlaylist')}</span>
            </button>
          </div>
          
          {/* 移动端播放列表按钮 */}
          <button
            onClick={() => setShowPlaylist(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35 hover:scale-105 border border-white/20"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">播放列表</span>
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${!isFullscreen ? 'lg:m-8' : ''}`}>
        {/* 左侧主播放区域 */}
        <div className={`${!isFullscreen ? 'lg:col-span-3' : 'col-span-4'}`}>
          {/* 播放器信息卡片 */}
          {!isFullscreen && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-xl text-white">{currentPlaylist.name}</h2>
                    <p className="text-sm text-gray-300">
                      {currentIndex + 1} / {playlist.length} 
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium border backdrop-blur-sm transition-all duration-300 ${
                    playbackState === 'playing' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-500/25' :
                    playbackState === 'paused' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50 shadow-lg shadow-yellow-500/25' : 'bg-gray-500/20 text-gray-300 border-gray-400/50'
                  }`}>
                    {t(playbackState === 'playing' ? 'playing' :
                      playbackState === 'paused' ? 'pause' : 'playing')}
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-3">
                  <span>{t('playProgress')}</span>
                  <span className="font-medium">{Math.round(getProgress())}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-3 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/25"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 视频播放器 */}
          <div className={`relative ${isFullscreen ? 'h-screen' : 'bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl'}`}>
            <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
              <VideoPlayer
                key={`${currentVideo.url}-${currentIndex}`}
                url={currentVideo.url}
                start={currentVideo.start}
                onEnded={next}
              />

              {/* 全屏模式控制栏 */}
              {isFullscreen && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold flex items-center gap-4 mb-3">
                        {getVideoInfo(currentVideo.url).icon}
                        <span>{currentVideo.title || `视频 ${currentIndex + 1}`}</span>
                      </h2>
                      <p className="text-sm opacity-90 flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">{currentPlaylist.name}</span>
                        <span>•</span>
                        <span className="font-medium">{currentIndex + 1} / {playlist.length}</span>
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
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 sticky top-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="p-6 border-b border-white/10">
                <h3 className="font-semibold text-lg text-white flex items-center gap-3 mb-3">
                  <List className="w-5 h-5 text-cyan-400" />
                  {t('playlist')}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    {playlist.length} {t('videos')}
                  </span>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => jumpToVideo(index)}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 border-b border-white/5 last:border-b-0 hover:scale-105 ${
                      index === currentIndex ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-l-4 border-l-cyan-400 shadow-lg shadow-cyan-500/25' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/25' 
                          : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                      }`}>
                        {index === currentIndex ? (
                          <Play className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-gray-300">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate flex items-center gap-2 transition-colors duration-300 ${
                          index === currentIndex ? 'text-white' : 'text-gray-300 hover:text-white'
                        }`}>
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
          <div className="fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 lg:hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-white flex items-center gap-3">
                  <List className="w-5 h-5 text-cyan-400" />
                  {t('playlist')}
                </h3>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-300 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">{currentPlaylist.name}</p>
            </div>
            
            <div className="overflow-y-auto h-full pb-20">
              {playlist.map((video, index) => (
                <div
                  key={index}
                  onClick={() => {
                    jumpToVideo(index);
                    setShowPlaylist(false);
                  }}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 border-b border-white/5 hover:scale-105 ${
                    index === currentIndex ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-l-4 border-l-cyan-400 shadow-lg shadow-cyan-500/25' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/25' 
                        : 'bg-white/10 backdrop-blur-sm border border-white/20'
                    }`}>
                      {index === currentIndex ? (
                        <Play className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm font-medium text-gray-300">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate flex items-center gap-2 transition-colors duration-300 ${
                        index === currentIndex ? 'text-white' : 'text-gray-300'
                      }`}>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowPlaylist(false)}
          />
        </>
      )}
    </div>
  </div>
)
}