import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
  start: number
  end: number
  onEnded: () => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, start, end, onEnded }) => {
  const playerRef = useRef<ReactPlayer>(null)
  const [playing, setPlaying] = useState(true)

  // 使用 useCallback 缓存 onEnded 函数引用
  const handleEnded = useCallback(() => {
    setPlaying(false)
    onEnded()
  }, [onEnded])

  // 每秒检查是否到达 end 时间
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime() ?? 0
      if (currentTime >= end) {
        handleEnded()
      }
    }, 1000)

    return () => clearInterval(checkInterval)
  }, [end, handleEnded])

  return (
    <div className="aspect-video max-w-4xl mx-auto">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        controls
        width="100%"
        height="100%"
        onReady={() => playerRef.current?.seekTo(start)}
      />
    </div>
  )
}