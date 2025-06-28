import { useState } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import type { VideoSegment } from '../store/usePlaylistStore'
import { useNavigate } from '@tanstack/react-router'

export default function PlaylistPage() {
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<{ url?: string }>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // 直接使用 store 中的 playlist，而不是本地状态
  const { playlist, setPlaylist } = usePlaylistStore()
  const navigate = useNavigate()

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
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: 300 // 默认5分钟，实际需要通过API获取
        }
      } else if (url.includes('bilibili.com')) {
        return {
          platform: 'B站',
          title: 'B站视频',
          thumbnail: null,
          duration: 300
        }
      } else if (url.includes('vimeo.com')) {
        return {
          platform: 'Vimeo',
          title: 'Vimeo 视频',
          thumbnail: null,
          duration: 300
        }
      }
      return {
        platform: '视频文件',
        title: '未知视频',
        thumbnail: null,
        duration: 300
      }
    } catch (error) {
      return {
        platform: '未知平台',
        title: '视频标题',
        thumbnail: null,
        duration: 300
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
      end: videoInfo.duration,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail
    }

    // 直接更新 store 中的 playlist
    setPlaylist([...playlist, newSegment])
    setUrl('')
    setErrors({})
  }

  const removeSegment = (index: number) => {
    // 直接更新 store 中的 playlist
    const newPlaylist = playlist.filter((_, i) => i !== index)
    setPlaylist(newPlaylist)
  }

  const clearAll = () => {
    if (window.confirm('确定要清空所有视频片段吗？')) {
      setPlaylist([])
    }
  }

  const updateTitle = (index: number, newTitle: string) => {
    const updatedPlaylist = [...playlist]
    updatedPlaylist[index] = { ...updatedPlaylist[index], title: newTitle }
    setPlaylist(updatedPlaylist)
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
    const newList = [...playlist]
    const [moved] = newList.splice(from, 1)
    newList.splice(to, 0, moved)
    setPlaylist(newList)
  }

  const startPlaying = () => {
    if (playlist.length === 0) return
    // 由于 playlist 已经在 store 中，只需要导航到播放器
    navigate({ to: '/player' })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalDuration = () => {
    return playlist.reduce((total, seg) => total + (seg.end - seg.start), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center mb-4">
            <div className="w-8 h-6 mr-3">
              <div className="w-full h-1 bg-gray-800 mb-1"></div>
              <div className="w-full h-1 bg-gray-800 mb-1"></div>
              <div className="w-full h-1 bg-gray-800"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            播放清单
          </h1>
          <p className="text-gray-600 text-lg">
            收集你喜欢的视频片段，创建专属训练清单
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* 左侧：添加视频表单 */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                    <div className="w-0 h-0 border-l-3 border-l-gray-600 border-y-2 border-y-transparent ml-0.5"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">添加视频</h3>
                <p className="text-gray-500">支持 YouTube、B站、Vimeo 等主流平台</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">视频链接</label>
                  <input
                    className={`w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200 ${errors.url ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    placeholder="粘贴视频链接..."
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
                  添加到清单
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：播放清单 */}
          <div>
            {playlist.length > 0 ? (
              <div className="space-y-6">
                {/* 清单头部 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">我的清单</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{playlist.length} 个视频</span>
                        <span>•</span>
                        <span>总时长 {formatTime(getTotalDuration())}</span>
                      </div>
                    </div>
                    <button
                      onClick={clearAll}
                      className="text-gray-500 hover:text-red-500 px-3 py-1 rounded-lg border border-gray-200 hover:border-red-200 transition-colors duration-200 text-sm"
                    >
                      清空全部
                    </button>
                  </div>
                </div>

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
                                  保存
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900 truncate flex-1">
                                  {seg.title || '未命名视频'}
                                </h3>
                                <button
                                  onClick={() => startEditingTitle(index, seg.title || '')}
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
                                  title="编辑标题"
                                >
                                  ✏️
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

                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">时长</span>
                              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono">
                                {formatTime(seg.end - seg.start)}
                              </span>
                            </div>
                          </div>
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

                {/* 播放按钮 */}
                <div className="pt-4">
                  <button
                    className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium text-lg flex items-center justify-center gap-3"
                    onClick={startPlaying}
                  >
                    <div className="w-0 h-0 border-l-4 border-l-white border-y-3 border-y-transparent"></div>
                    开始播放清单
                  </button>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">开始创建你的清单</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  添加你喜欢的视频片段，打造专属的学习或娱乐播放列表
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-2xl px-8 py-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>多平台支持</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>智能排序</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>连续播放</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}