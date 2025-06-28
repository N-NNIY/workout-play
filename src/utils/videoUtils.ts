// 提取YouTube视频信息
export const extractYouTubeInfo = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  if (!videoId) return null;
  
  return {
    title: `YouTube视频 ${videoId}`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }
}

// 新增B站API接口类型
interface BilibiliVideoInfo {
  data?: {
    pic?: string
    title?: string
  }
}

// 修改B站信息提取函数
const extractBilibiliInfo = async (url: string) => {
  try {
    const match = url.match(/video\/(BV\w+)/);
    const bvid = match ? match[1] : '';
    
    if (!bvid) return null;

    // 调用B站API获取视频信息
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const data: BilibiliVideoInfo = await response.json();
    
    return {
      title: data?.data?.title || `B站视频 ${bvid}`,
      thumbnail: data?.data?.pic || null
    }
  } catch (error) {
    console.error('获取B站视频信息失败:', error);
    return {
      title: `B站视频 ${url.split('/').pop()}`,
      thumbnail: null
    }
  }
}

// 统一提取视频信息
export const fetchVideoInfo = async (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return extractYouTubeInfo(url)
  } else if (url.includes('bilibili.com')) {
    return extractBilibiliInfo(url)
  }
  return {
    title: url.split('/').pop() || '本地视频',
    thumbnail: null
  }
}