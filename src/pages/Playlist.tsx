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
      return { platform: 'YouTube', icon: '🎥' }
    } else if (url.includes('bilibili.com')) {
      return { platform: 'B站', icon: '📺' }
    } else if (url.includes('vimeo.com')) {
      return { platform: 'Vimeo', icon: '🎬' }
    }
    return { platform: '视频文件', icon: '🎞️' }
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
    <div className="min-h-screen bg-green-50">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">播放清单</h1>
          <p className="text-gray-500 text-sm">创建专属视频训练列表</p>
        </div>

        {/* 添加视频表单 */}
        <div className="bg-white rounded-lg border border-green-100 p-5 mb-6">
          <div className="space-y-4">
            <div>
              <input
                className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 text-sm ${
                  errors.url ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="粘贴视频链接..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (errors.url) setErrors({ ...errors, url: undefined })
                }}
              />
              {errors.url && (
                <p className="text-red-500 text-xs mt-1">{errors.url}</p>
              )}
            </div>

            <button
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              onClick={addSegment}
            >
              添加视频
            </button>
          </div>
        </div>

        {/* 播放清单 */}
        {localList.length > 0 && (
          <div className="bg-white rounded-lg border border-green-100 p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-medium text-gray-800">视频列表</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {localList.length} 个视频 · {formatTime(getTotalDuration())}
                </p>
              </div>
              <button
                onClick={clearAll}
                className="text-red-500 hover:text-red-600 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50"
              >
                清空
              </button>
            </div>

            <div className="space-y-2 mb-5">
              {localList.map((seg, index) => (
                <div
                  key={index}
                  className="border border-gray-100 p-3 rounded-md bg-gray-50 hover:bg-lime-50 hover:border-lime-200 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{index + 1}</span>
                        <span className="text-sm">{getVideoInfo(seg.url).icon}</span>
                        <span className="text-xs text-gray-600">{getVideoInfo(seg.url).platform}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {seg.url}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(seg.start)}-{formatTime(seg.end)} ({formatTime(seg.end - seg.start)})
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveSegment(index, index - 1)}
                          className="p-1 text-xs text-gray-400 hover:text-lime-600 hover:bg-lime-100 rounded"
                          title="上移"
                        >
                          ↑
                        </button>
                      )}
                      {index < localList.length - 1 && (
                        <button
                          onClick={() => moveSegment(index, index + 1)}
                          className="p-1 text-xs text-gray-400 hover:text-lime-600 hover:bg-lime-100 rounded"
                          title="下移"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeSegment(index)}
                        className="p-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-100 rounded ml-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full bg-lime-500 text-white py-3 rounded-md hover:bg-lime-600 transition-colors font-medium"
              onClick={startPlaying}
            >
              开始播放
            </button>
          </div>
        )}

        {/* 空状态提示 */}
        {localList.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-300 text-4xl mb-3">📹</div>
            <p className="text-gray-400 text-sm">还没有添加视频</p>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <p className="text-green-700 text-xs">
            支持 YouTube、B站、Vimeo 等平台 · 可调整播放顺序 · 自动循环播放
          </p>
        </div>
      </div>
    </div>
  )
}