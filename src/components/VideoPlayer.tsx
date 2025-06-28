import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  start: number;
  end: number;
  onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, start, end, onEnded }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [isBilibili, setIsBilibili] = useState(false);
  const [bvid, setBvid] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true);

  // 检测视频平台
  useEffect(() => {
    const bilibiliRegex = /bilibili\.com\/video\/(BV\w+)/i;
    if (bilibiliRegex.test(url)) {
      setIsBilibili(true);
      setBvid(url.match(bilibiliRegex)![1]);
    } else {
      setIsBilibili(false);
    }
  }, [url]);

  // 处理播放/暂停
  const handlePlay = () => {
    setPlaying(true);
    setShowPlayButton(false);
    
    // 如果是B站视频，通过postMessage控制播放
    if (isBilibili && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        command: 'play',
        time: Math.floor(start)
      }, 'https://player.bilibili.com');
    }
  };

  // 处理视频结束
  const handleEnded = () => {
    setPlaying(false);
    onEnded();
  };

  // 监听B站iframe消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.bilibili.com') return;
      
      // 处理B站播放器状态变化
      if (event.data.event === 'ended') {
        handleEnded();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded]);

  // B站播放器组件
  if (isBilibili) {
    return (
      <div className="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`https://player.bilibili.com/player.html?${new URLSearchParams({
            bvid: bvid,
            page: '1',
            high_quality: '1',
            autoplay: playing ? '1' : '0',
            t: Math.floor(start).toString(),
            disable_fp: '1'
          }).toString()}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          onLoad={() => {
            // iframe加载完成后隐藏加载状态
            setShowPlayButton(!playing);
          }}
        />
        
        {showPlayButton && (
          <button 
            onClick={handlePlay}
            className="absolute inset-0 m-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
            aria-label="播放视频"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // 其他视频平台播放器
  return (
    <div className="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        controls
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        onReady={() => {
          playerRef.current?.seekTo(start);
          setShowPlayButton(!playing);
        }}
        onEnded={handleEnded}
        onPlay={() => setShowPlayButton(false)}
        onPause={() => setShowPlayButton(true)}
        config={{
          youtube: {
            playerVars: { 
              origin: window.location.origin,
              start: Math.floor(start),
              end: Math.floor(end),
              autoplay: playing ? 1 : 0,
              rel: 0, // 不显示相关视频
              modestbranding: 1 // 隐藏YouTube logo
            }
          },
          file: {
            attributes: {
              controlsList: 'nodownload' // 禁用下载按钮
            }
          }
        }}
      />
      
      {showPlayButton && (
        <button 
          onClick={handlePlay}
          className="absolute inset-0 m-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
          aria-label="播放视频"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
};