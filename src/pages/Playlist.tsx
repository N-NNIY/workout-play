import { useState } from 'react'
import { usePlaylistStore } from '../store/usePlaylistStore'
import type { VideoSegment } from '../store/usePlaylistStore'
import { useNavigate } from '@tanstack/react-router'

export default function PlaylistPage() {
  const [url, setUrl] = useState('')
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(30)
  const [localList, setLocalList] = useState<VideoSegment[]>([])
  const [errors, setErrors] = useState<{ url?: string; time?: string }>({})

  const setPlaylist = usePlaylistStore((s) => s.setPlaylist)
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

  // 提取视频平台信息（用于显示）
  const getVideoInfo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { platform: 'YouTube', icon: '' }
    } else if (url.includes('bilibili.com')) {
      return { platform: 'B站', icon: '' }
    } else if (url.includes('vimeo.com')) {
      return { platform: 'Vimeo', icon: '' }
    }
    return { platform: '视频文件', icon: '' }
  }

  const addSegment = () => {
    const newErrors: { url?: string; time?: string } = {}

    if (!url.trim()) {
      newErrors.url = '请输入视频链接'
    } else if (!validateUrl(url)) {
      newErrors.url = '请输入有效的视频链接（支持YouTube、B站、Vimeo等）'
    }

    if (end <= start) {
      newErrors.time = '结束时间必须大于起始时间'
    } else if (start < 0 || end < 0) {
      newErrors.time = '时间不能为负数'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const newSegment: VideoSegment = {
      url: url.trim(),
      start,
      end
    }

    setLocalList([...localList, newSegment])
    setUrl('')
    setStart(0)
    setEnd(30)
    setErrors({})
  }

  const removeSegment = (index: number) => {
    setLocalList(localList.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    if (window.confirm('确定要清空所有视频片段吗？')) {
      setLocalList([])
    }
  }

  const moveSegment = (from: number, to: number) => {
    const newList = [...localList]
    const [moved] = newList.splice(from, 1)
    newList.splice(to, 0, moved)
    setLocalList(newList)
  }

  const startPlaying = () => {
    if (localList.length === 0) return
    setPlaylist(localList)
    navigate({ to: '/player' })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalDuration = () => {
    return localList.reduce((total, seg) => total + (seg.end - seg.start), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-violet-500/25">
            <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
              <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            播放清单
          </h1>
          <p className="text-xl text-slate-400 max-w-md mx-auto leading-relaxed">
            收集你喜欢的视频片段，创建专属训练清单
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* 左侧：添加视频表单 */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">添加视频</h3>
                  <p className="text-slate-400 text-sm">支持 YouTube、B站等主流平台</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">视频链接</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-slate-800/50 border border-slate-700/50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-slate-500 transition-all duration-300 ${errors.url ? 'border-red-500/50 ring-2 ring-red-500/50' : ''
                          }`}
                        placeholder="粘贴视频链接..."
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value)
                          if (errors.url) setErrors({ ...errors, url: undefined })
                        }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full"></div>
                    </div>
                    {errors.url && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                        {errors.url}
                      </p>
                    )}
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transform"
                    onClick={addSegment}
                  >
                    添加到清单
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：播放清单 */}
          <div className="lg:col-span-3">
            {localList.length > 0 ? (
              <div className="space-y-6">
                {/* 清单头部 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">我的清单</h2>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">{localList.length} 个视频</span>
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                        <span className="text-slate-400">总时长 {formatTime(getTotalDuration())}</span>
                      </div>
                    </div>
                    <button
                      onClick={clearAll}
                      className="text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 text-sm font-medium"
                    >
                      清空全部
                    </button>
                  </div>
                </div>

                {/* 视频列表 */}
                <div className="space-y-4">
                  {localList.map((seg, index) => (
                    <div
                      key={index}
                      className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-violet-500/30 transition-all duration-300 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        {/* 序号 */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
                          <span className="text-violet-300 font-bold text-sm">{index + 1}</span>
                        </div>

                        {/* 视频信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getVideoInfo(seg.url).icon}</span>
                              <span className="text-slate-300 font-medium text-sm">{getVideoInfo(seg.url).platform}</span>
                            </div>
                          </div>

                          <p className="text-slate-500 text-sm font-mono truncate mb-4 bg-slate-800/30 px-3 py-2 rounded-lg">
                            {seg.url}
                          </p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">开始</span>
                              <div className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded-lg font-mono">
                                {formatTime(seg.start)}
                              </div>
                            </div>
                            <div className="w-4 h-px bg-slate-700"></div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">结束</span>
                              <div className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg font-mono">
                                {formatTime(seg.end)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs ml-auto">
                              <span className="text-slate-500">时长</span>
                              <div className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg font-mono">
                                {formatTime(seg.end - seg.start)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex-shrink-0 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all duration-300">
                          {index > 0 && (
                            <button
                              onClick={() => moveSegment(index, index - 1)}
                              className="w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
                              title="上移"
                            >
                              <div className="w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-3 border-b-current"></div>
                            </button>
                          )}
                          {index < localList.length - 1 && (
                            <button
                              onClick={() => moveSegment(index, index + 1)}
                              className="w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
                              title="下移"
                            >
                              <div className="w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-t-3 border-t-current"></div>
                            </button>
                          )}
                          <button
                            onClick={() => removeSegment(index)}
                            className="w-9 h-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 flex items-center justify-center ml-1"
                          >
                            <div className="w-3 h-px bg-current"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 播放按钮 */}
                <div className="sticky bottom-8 z-10">
                  <button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-6 rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold text-xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transform flex items-center justify-center gap-4"
                    onClick={startPlaying}
                  >
                    <div className="w-0 h-0 border-l-6 border-l-white border-y-4 border-y-transparent"></div>
                    开始播放清单
                  </button>
                </div>
              </div>
            ) : (
              /* 空状态 */
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                  <div className="w-12 h-12 border-2 border-slate-600 rounded-xl flex items-center justify-center">
                    <div className="w-0 h-0 border-l-6 border-l-slate-600 border-y-4 border-y-transparent ml-1"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">开始创建你的清单</h3>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                  添加你喜欢的视频片段，打造专属的学习或娱乐播放列表
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
              <span>多平台支持</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>智能排序</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>连续播放</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}