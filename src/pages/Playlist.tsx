import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import type { VideoSegment } from '../store/usePlaylistStore'
import { useNavigate } from '@tanstack/react-router'
import { Edit, Plus, Settings, List, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BottomNote from '../components/BottomNote'

export default function PlaylistPage() {
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<{ url?: string }>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false)

  // 使用新的 store 方法
  const {
    getCurrentVideos,
    addVideo,
    removeVideo,
    updateVideo,
    moveVideo,
    clearVideos,
    currentPlaylistId,
    createPlaylist,
    playlists,
    switchPlaylist,
    getCurrentPlaylist
  } = usePlaylistStore()

  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // 获取当前播放列表的视频和信息
  const playlist = getCurrentVideos()
  const currentPlaylist = getCurrentPlaylist()

  // 如果没有当前播放列表，创建一个默认的
  useEffect(() => {
    if (!currentPlaylistId && playlists.length === 0) {
      createPlaylist('My playList')
    }
  }, [currentPlaylistId, playlists.length, createPlaylist])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  // 快速创建新播放列表
  const handleQuickCreatePlaylist = () => {
    const name = `playList ${playlists.length + 1}`
    const newId = createPlaylist(name)
    switchPlaylist(newId)
    setShowPlaylistSelector(false)
  }

  // 切换播放列表
  const handleSwitchPlaylist = (playlistId: string) => {
    switchPlaylist(playlistId)
    setShowPlaylistSelector(false)
  }

  // 验证视频链接格式
  const validateUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/,
      /^https?:\/\/(www\.)?bilibili\.com/,
      /^https?:\/\/(www\.)?vimeo\.com/,
      /^https?:\/\/.*\.(mp4|webm|ogg)$/i
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  // 获取视频平台信息（同步版本，用于显示）
  const getVideoPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube'
    } else if (url.includes('bilibili.com')) {
      return 'B站'
    } else if (url.includes('vimeo.com')) {
      return 'Vimeo'
    }
    return '视频文件'
  }

  // 获取视频信息（标题、缩略图、时长）
  const getVideoInfo = async (url: string) => {
    try {
      // 这里模拟获取视频信息的过程
      // 在实际项目中，你需要使用相应的 API
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // YouTube API 或 oEmbed
        const videoId = extractYouTubeId(url)
        return {
          platform: 'YouTube',
          title: `YouTube 视频 ${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        }
      } else if (url.includes('bilibili.com')) {
        return {
          platform: 'B站',
          title: 'B站视频',
          thumbnail: null
        }
      } else if (url.includes('vimeo.com')) {
        return {
          platform: 'Vimeo',
          title: 'Vimeo 视频',
          thumbnail: null
        }
      }
      return {
        platform: '视频文件',
        title: '未知视频',
        thumbnail: null
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {
        platform: '未知平台',
        title: '视频标题',
        thumbnail: null
      }
    }
  }

  // 提取YouTube视频ID
  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : 'unknown'
  }

  const addSegment = async () => {
    const newErrors: { url?: string } = {}

    if (!url.trim()) {
      newErrors.url = '请输入视频链接'
    } else if (!validateUrl(url)) {
      newErrors.url = '请输入有效的视频链接（支持YouTube、B站、Vimeo等）'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // 获取视频信息
    const videoInfo = await getVideoInfo(url.trim())

    const newSegment: VideoSegment = {
      url: url.trim(),
      start: 0,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail
    }

    // 使用新的 store 方法添加视频
    addVideo(newSegment)
    setUrl('')
    setErrors({})
  }

  const removeSegment = (index: number) => {
    // 使用新的 store 方法删除视频
    removeVideo(index)
  }

  const clearAll = () => {
    if (window.confirm('确定要清空所有视频片段吗？')) {
      clearVideos()
    }
  }

  const updateTitle = (index: number, newTitle: string) => {
    // 使用新的 store 方法更新视频标题
    updateVideo(index, { title: newTitle })
    setEditingIndex(null)
    setEditingTitle('')
  }

  const startEditingTitle = (index: number, currentTitle: string) => {
    setEditingIndex(index)
    setEditingTitle(currentTitle || '')
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingTitle('')
  }

  const moveSegment = (from: number, to: number) => {
    // 使用新的 store 方法移动视频
    moveVideo(from, to)
  }

  const startPlaying = () => {
    if (playlist.length === 0) return
    // 导航到播放器
    navigate({ to: '/player' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('playlist')}
            </h1>
            {/* 播放列表选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <List className="w-4 h-4" />
                <span className="font-medium">
                  {currentPlaylist?.name || '选择播放列表'}
                </span>
                {playlists.length > 1 && <ChevronDown className="w-4 h-4" />}
              </button>

              {showPlaylistSelector && playlists.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handleSwitchPlaylist(playlist.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${playlist.id === currentPlaylistId
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{playlist.name}</span>
                          <span className="text-sm text-gray-500">
                            {playlist.videos?.length || 0} {t('videos')}
                          </span>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleQuickCreatePlaylist}
                        className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('quickCreatePlaylist')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 语言切换 */}
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>

            {/* 管理播放列表按钮 */}
            <button
              onClick={() => navigate({ to: '/manager' })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('playlistManager')}
            </button>
            <button
              onClick={() => navigate({ to: '/stretchCountdown' })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('stretchCountdown')}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 m-24">
          {/* 左侧：添加视频表单 */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                    <div className="w-0 h-0 border-l-3 border-l-gray-600 border-y-2 border-y-transparent ml-0.5"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('addVideo')}</h3>
                <p className="text-gray-500">{t('platformSupportDesc')}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('videoUrl')}</label>
                  <input
                    className={`w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200 ${errors.url ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    placeholder={t('videoUrlPlaceholder')}
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      if (errors.url) setErrors({ ...errors, url: undefined })
                    }}
                  />
                  {errors.url && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.url}
                    </p>
                  )}
                </div>

                <button
                  className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                  onClick={addSegment}
                >
                  <span className="text-lg">+</span>
                  {t('addVideo')}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：播放清单 */}
          <div>
            {playlist.length > 0 ? (
              <div className="space-y-6">
                {/* 视频列表 */}
                <div className="space-y-3">
                  {playlist.map((seg, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {/* 缩略图 */}
                        <div className="flex-shrink-0">
                          {seg.thumbnail ? (
                            <img
                              src={seg.thumbnail}
                              alt={seg.title || '视频缩略图'}
                              className="w-20 h-15 object-cover rounded-lg bg-gray-100"
                            />
                          ) : (
                            <div className="w-20 h-15 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                <div className="w-0 h-0 border-l-3 border-l-gray-600 border-y-2 border-y-transparent ml-0.5"></div>
                              </div>
                            </div>
                          )}
                          <div className="text-center mt-2">
                            <span className="text-gray-600 font-medium text-sm">{index + 1}</span>
                          </div>
                        </div>

                        {/* 视频信息 */}
                        <div className="flex-1 min-w-0">
                          {/* 标题编辑 */}
                          <div className="mb-3">
                            {editingIndex === index ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="flex-1 border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateTitle(index, editingTitle)
                                    } else if (e.key === 'Escape') {
                                      cancelEditing()
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateTitle(index, editingTitle)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                  {t('save')}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                                >
                                  {t('cancel')}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900 truncate flex-1">
                                  {seg.title || '未命名视频'}
                                </h3>
                                <button
                                  onClick={() => startEditingTitle(index, seg.title || '')}
                                  className="text-gray-400 hover:text-blue-500 transition-colors mt-2"
                                  title="编辑标题"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 平台信息 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-600 text-sm font-medium">{getVideoPlatform(seg.url)}</span>
                          </div>

                          <p className="text-gray-400 text-xs font-mono truncate mb-3 bg-gray-50 px-2 py-1 rounded">
                            {seg.url}
                          </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => moveSegment(index, index - 1)}
                              className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
                              title="上移"
                            >
                              ↑
                            </button>
                          )}
                          {index < playlist.length - 1 && (
                            <button
                              onClick={() => moveSegment(index, index + 1)}
                              className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
                              title="下移"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => removeSegment(index)}
                            className="w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 空状态 */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="w-8 h-6">
                    <div className="w-full h-1 bg-gray-400 mb-1"></div>
                    <div className="w-full h-1 bg-gray-400 mb-1"></div>
                    <div className="w-full h-1 bg-gray-400"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('emptyStateTitle')}</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {t('emptyStateDesc')}
                </p>
              </div>
            )}
            {/* 当前播放列表信息卡片 */}
            {currentPlaylist && (
              <div className="flex items-center justify-evenly mt-10">
                {playlist.length > 0 && (
                  <button
                    onClick={startPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-grey-700 transition-colors"
                  >
                    <div className="w-0 h-0 border-l-3 border-l-white border-y-2 border-y-transparent"></div>
                    {t('startPlaying')}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  disabled={playlist.length === 0}
                  className="px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('clearAll')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-16 text-center">
          <BottomNote t={t} />
        </div>
      </div>

      {/* 点击外部关闭播放列表选择器 */}
      {showPlaylistSelector && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowPlaylistSelector(false)}
        />
      )}
    </div>
  )
}