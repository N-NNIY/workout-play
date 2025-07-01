import { useState } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { useNavigate } from '@tanstack/react-router'
import { Edit, Trash2, Play, ArrowLeft, Plus, Calendar, Video, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
export default function PlaylistManagerPage() {
  const [isCreatingModal, setIsCreatingModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const { t } = useTranslation()
  const {
    playlists,
    currentPlaylistId,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    switchPlaylist,
  } = usePlaylistStore()

  const navigate = useNavigate()

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newId = createPlaylist(newPlaylistName.trim())
      setNewPlaylistName('')
      setNewPlaylistDescription('')
      setIsCreatingModal(false)
      // 创建后自动切换到新播放列表并跳转到编辑页面
      switchPlaylist(newId)
      navigate({ to: '/' })
    }
  }

  const handleCloseModal = () => {
    setIsCreatingModal(false)
    setNewPlaylistName('')
    setNewPlaylistDescription('')
  }

  const handleDeletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId)
    if (playlist && window.confirm(`确定要删除播放列表"${playlist.name}"吗？这将删除其中的所有视频。`)) {
      deletePlaylist(playlistId)
    }
  }

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    if (newName.trim()) {
      renamePlaylist(playlistId, newName.trim())
      setEditingPlaylistId(null)
      setEditingName('')
    }
  }

  const startEditing = (playlistId: string, currentName: string) => {
    setEditingPlaylistId(playlistId)
    setEditingName(currentName)
  }

  const cancelEditing = () => {
    setEditingPlaylistId(null)
    setEditingName('')
  }

  const handleEditPlaylist = (playlistId: string) => {
    switchPlaylist(playlistId)
    navigate({ to: '/' })
  }

  const handlePlayPlaylist = (playlistId: string) => {
    switchPlaylist(playlistId)
    navigate({ to: '/player' })
  }

  // 计算播放列表统计信息
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPlaylistStats = (playlist: any) => {
    const videoCount = playlist.videos?.length || 0
    return {
      videoCount,
    }
  }

  // 格式化创建时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '今天'
    if (diffDays === 2) return '昨天'
    if (diffDays <= 7) return `${diffDays} 天前`
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('playlistManageTitle')}</h1>
              <p className="text-gray-500 mt-1">{t('playlistManageDesc')}</p>
            </div>
          </div>

          {/* 快速创建按钮 */}
          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('playlistManageCreate')}
          </button>
        </div>

        {/* 播放列表网格 */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => {
              const stats = getPlaylistStats(playlist)
              const isActive = playlist.id === currentPlaylistId

              return (
                <div
                  key={playlist.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md group ${
                    isActive ? 'border-gray-900 ring-2 ring-gray-100' : 'border-gray-100'
                  }`}
                >
                  {/* 播放列表头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      {editingPlaylistId === playlist.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-semibold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenamePlaylist(playlist.id, editingName)
                              } else if (e.key === 'Escape') {
                                cancelEditing()
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                            {playlist.name}
                          </h3>
                          {isActive && (
                            <div className="w-2 h-2 bg-gray-900 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      )}

                      {/* 编辑模式下的操作按钮 */}
                      {editingPlaylistId === playlist.id && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleRenamePlaylist(playlist.id, editingName)}
                            className="px-3 py-1 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 快速操作按钮 */}
                    {editingPlaylistId !== playlist.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(playlist.id, playlist.name)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="重命名"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 播放列表信息 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        <span>{stats.videoCount} 个视频</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(playlist.createdAt)}</span>
                      </div>
                    </div>

                    {/* 视频预览列表 */}
                    {stats.videoCount > 0 ? (
                      <div className="space-y-2">
                        {playlist.videos?.slice(0, 3).map((video, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
                            <span className="truncate">{video.title || '未命名视频'}</span>
                          </div>
                        ))}
                        {stats.videoCount > 3 && (
                          <div className="text-sm text-gray-400 pl-3">
                            还有 {stats.videoCount - 3} 个视频...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">暂无视频</div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {editingPlaylistId !== playlist.id && (
                    <div className="flex items-center gap-2">
                      {stats.videoCount > 0 ? (
                        <>
                          <button
                            onClick={() => handlePlayPlaylist(playlist.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            <Play className="w-4 h-4" />
                            播放
                          </button>
                          <button
                            onClick={() => handleEditPlaylist(playlist.id)}
                            className="flex-1 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            编辑
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPlaylist(playlist.id)}
                            className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            添加视频
                          </button>
                          {!isActive && (
                            <button
                              onClick={() => switchPlaylist(playlist.id)}
                              className="px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              切换
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="space-y-1">
                <div className="flex gap-1 justify-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-1 bg-gray-600 rounded-full"></div>
                </div>
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-1 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex gap-1 justify-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">还没有播放列表</h2>
            <p className="text-gray-500 mb-6">创建你的第一个播放列表，开始收集喜欢的视频</p>
            <button
              onClick={() => setIsCreatingModal(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              创建第一个列表
            </button>
          </div>
        )}
      </div>

      {/* 创建播放列表模态弹窗 */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">创建新播放列表</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  播放列表名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="输入播放列表名称..."
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePlaylist()
                    } else if (e.key === 'Escape') {
                      handleCloseModal()
                    }
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述 <span className="text-gray-400">(可选)</span>
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="为你的播放列表添加描述..."
                  rows={3}
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  newPlaylistName.trim()
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                创建播放列表
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}