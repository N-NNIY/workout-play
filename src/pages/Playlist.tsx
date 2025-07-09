import { useState, useEffect } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import type { VideoSegment } from '../store/usePlaylistStore'
import { useNavigate } from '@tanstack/react-router'
import { Edit, Plus, List, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BottomNote from '../components/BottomNote'
 
export default function PlaylistPage() {
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<{ url?: string }>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false)
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
  const [editingPlaylistName, setEditingPlaylistName] = useState<string>('')
 const {
    deletePlaylist,
    renamePlaylist,
  } = usePlaylistStore()
  
  // Start editing
  const startEditingPlaylist = (id: string, currentName: string) => {
    setEditingPlaylistId(id)
    setEditingPlaylistName(currentName)
  }

  // Save new name
  const savePlaylistName = () => {
    if (editingPlaylistId && editingPlaylistName.trim()) {
      renamePlaylist(editingPlaylistId, editingPlaylistName.trim())
      setEditingPlaylistId(null)
      setEditingPlaylistName('')
    }
  }

  // Cancel edit
  const cancelEditingPlaylist = () => {
    setEditingPlaylistId(null)
    setEditingPlaylistName('')
  }

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
  const { t } = useTranslation()

  // 获取当前播放列表的视频和信息
  const playlist = getCurrentVideos()
  const currentPlaylist = getCurrentPlaylist()

  // 如果没有当前播放列表，创建一个默认的
  useEffect(() => {
    if (!currentPlaylistId && playlists.length === 0) {
      createPlaylist('My playList')
    }
  }, [currentPlaylistId, playlists.length, createPlaylist])

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
  // 简化版本：使用 oEmbed API 获取视频标题
  const getVideoInfo = async (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          // 使用 YouTube oEmbed API
          const response = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          )

          if (response.ok) {
            const data = await response.json()
            return {
              platform: 'YouTube',
              title: data.title,
              thumbnail: data.thumbnail_url,
              author: data.author_name
            }
          }
        } catch (error) {
          console.error('YouTube oEmbed 获取失败:', error)
        }

        // 备用方案：解析 URL 获取视频ID
        const videoId = extractYouTubeId(url)
        return {
          platform: 'YouTube',
          title: `YouTube 视频 (${videoId})`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        }

      } else if (url.includes('vimeo.com')) {
        try {
          // 使用 Vimeo oEmbed API
          const response = await fetch(
            `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
          )

          if (response.ok) {
            const data = await response.json()
            return {
              platform: 'Vimeo',
              title: data.title,
              thumbnail: data.thumbnail_url,
              author: data.author_name
            }
          }
        } catch (error) {
          console.error('Vimeo oEmbed 获取失败:', error)
        }

        return {
          platform: 'Vimeo',
          title: 'Vimeo 视频',
          thumbnail: null
        }

      } else if (url.includes('bilibili.com')) {
        // B站暂时使用占位符，因为需要处理跨域问题
        return {
          platform: 'B站',
          title: 'B站视频',
          thumbnail: null
        }

      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        // 直接视频文件
        const filename = url.split('/').pop()?.split('.')[0] || 'video'
        return {
          platform: '视频文件',
          title: filename,
          thumbnail: null
        }
      }

      return {
        platform: '未知平台',
        title: '视频',
        thumbnail: null
      }

    } catch (error) {
      console.error('获取视频信息失败:', error)
      return {
        platform: '未知平台',
        title: '获取标题失败',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="./logo.png" alt="logo" className="w-8 h-8" />
            {/* 播放列表选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 backdrop-blur-sm hover:scale-105 shadow-lg"
              >
                <List className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-white">
                  {currentPlaylist?.name || 'Select Playlist'}
                </span>
                {playlists.length > 1 && <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showPlaylistSelector && playlists.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-xl shadow-2xl z-10 backdrop-blur-sm">
                  <div className="p-2">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all duration-300 ${playlist.id === currentPlaylistId
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                      >
                        {editingPlaylistId === playlist.id ? (
                          <>
                            <input
                              value={editingPlaylistName}
                              onChange={(e) => setEditingPlaylistName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') savePlaylistName()
                                if (e.key === 'Escape') cancelEditingPlaylist()
                              }}
                              className="flex-1 bg-gray-800/50 border border-gray-700/50 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white backdrop-blur-sm"
                              autoFocus
                            />
                            <button
                              onClick={savePlaylistName}
                              className="text-green-400 hover:text-green-500 transition-colors text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingPlaylist}
                              className="text-gray-400 hover:text-gray-500 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSwitchPlaylist(playlist.id)}
                              className="flex-1 text-left truncate"
                            >
                              <div className="flex items-center justify-between">
                                <span>{playlist.name}</span>
                                <span className="text-sm text-gray-400">
                                  {playlist.videos?.length || 0} videos
                                </span>
                              </div>
                            </button>
                            <button
                              onClick={() => startEditingPlaylist(playlist.id, playlist.name)}
                              className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this playlist?')) {
                                  deletePlaylist(playlist.id)
                                }
                              }}
                              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                              title="Delete"
                            >
                              ×
                            </button>

                          </>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-gray-700/50 mt-2 pt-2">
                      <button
                        onClick={handleQuickCreatePlaylist}
                        className="w-full text-left px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        Quick create playlist
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 m-24">
          {/* 左侧：添加视频表单 */}
          <div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm hover:shadow-cyan-500/10 transition-all duration-500">
              <div className="mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/30">
                  <div className="w-6 h-6 border-2 border-cyan-400 rounded flex items-center justify-center">
                    <div className="w-0 h-0 border-l-3 border-l-cyan-400 border-y-2 border-y-transparent ml-0.5"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">{t('addVideo')}</h3>
                <p className="text-gray-300">{t('platformSupportDesc')}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">{t('videoUrl')}</label>
                  <input
                    className={`w-full bg-gray-800/50 border border-gray-700/50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm hover:bg-gray-700/50 ${errors.url ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''
                      }`}
                    placeholder={t('videoUrlPlaceholder')}
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      if (errors.url) setErrors({ ...errors, url: undefined })
                    }}
                  />
                  {errors.url && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-400">⚠</span>
                      {errors.url}
                    </p>
                  )}
                </div>

                <button
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
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
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 shadow-lg border border-gray-700/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm group hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        {/* 缩略图 */}
                        <div className="flex-shrink-0">
                          {seg.thumbnail ? (
                            <img
                              src={seg.thumbnail}
                              alt={seg.title || '视频缩略图'}
                              className="w-20 h-15 object-cover rounded-lg bg-gray-700/50 border border-gray-600/50"
                            />
                          ) : (
                            <div className="w-20 h-15 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg flex items-center justify-center border border-gray-600/50">
                              <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                <div className="w-0 h-0 border-l-3 border-l-gray-400 border-y-2 border-y-transparent ml-0.5"></div>
                              </div>
                            </div>
                          )}
                          <div className="text-center mt-2">
                            <span className="text-cyan-400 font-medium text-sm bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/30">{index + 1}</span>
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
                                  className="flex-1 bg-gray-800/50 border border-gray-700/50 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white backdrop-blur-sm"
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
                                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 text-sm shadow-lg"
                                >
                                  {t('save')}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-500/50 transition-all duration-300 text-sm"
                                >
                                  {t('cancel')}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-white truncate flex-1 group-hover:text-cyan-300 transition-colors duration-300">
                                  {seg.title || '未命名视频'}
                                </h3>
                                <button
                                  onClick={() => startEditingTitle(index, seg.title || '')}
                                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:scale-110 transform mt-2"
                                  title="编辑标题"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 平台信息 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">{getVideoPlatform(seg.url)}</span>
                          </div>

                          <p className="text-gray-400 text-xs font-mono truncate mb-3 bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">
                            {seg.url}
                          </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => moveSegment(index, index - 1)}
                              className="w-8 h-8 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-110 transform border border-transparent hover:border-cyan-500/30"
                              title="上移"
                            >
                              ↑
                            </button>
                          )}
                          {index < playlist.length - 1 && (
                            <button
                              onClick={() => moveSegment(index, index + 1)}
                              className="w-8 h-8 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-110 transform border border-transparent hover:border-emerald-500/30"
                              title="下移"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => removeSegment(index)}
                            className="w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-110 transform border border-transparent hover:border-red-500/30"
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
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center mb-6 border border-gray-700/50 backdrop-blur-sm">
                  <div className="w-8 h-6">
                    <div className="w-full h-1 bg-gray-500 mb-1 rounded-full"></div>
                    <div className="w-full h-1 bg-gray-500 mb-1 rounded-full"></div>
                    <div className="w-full h-1 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">{t('emptyStateTitle')}</h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
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
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                  >
                    <div className="w-0 h-0 border-l-3 border-l-white border-y-2 border-y-transparent"></div>
                    {t('startPlaying')}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  disabled={playlist.length === 0}
                  className="px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700/50 hover:border-red-500/30 hover:scale-105"
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

      <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }
      
      .animate-pulse {
        animation: pulse 4s ease-in-out infinite;
      }
    `}</style>
    </div>
  )
}