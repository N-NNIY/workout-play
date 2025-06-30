import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface VideoSegment {
  url: string
  start: number
  title?: string
  thumbnail?: string | null
}

export interface Playlist {
  id: string
  name: string
  videos: VideoSegment[]
  createdAt: string
  updatedAt: string
}

interface PlaylistState {
  playlists: Playlist[]
  currentPlaylistId: string | null
  currentIndex: number
  
  // 播放列表管理
  createPlaylist: (name: string) => string
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  setCurrentPlaylist: (id: string) => void
  switchPlaylist: (id: string) => void  // 添加这个方法

  // 视频管理
  addVideo: (video: VideoSegment) => void
  removeVideo: (index: number) => void
  updateVideo: (index: number, video: Partial<VideoSegment>) => void
  moveVideo: (from: number, to: number) => void
  clearVideos: () => void
  
  // 播放控制
  next: () => void
  previous: () => void
  setCurrentIndex: (index: number) => void
  
  // 导入导出
  exportPlaylist: (id: string) => string
  importPlaylist: (data: string) => boolean
  exportAllPlaylists: () => string
  importAllPlaylists: (data: string) => boolean
  
  // 获取当前播放列表
  getCurrentPlaylist: () => Playlist | null
  getCurrentVideos: () => VideoSegment[]
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      currentPlaylistId: null,
      currentIndex: 0,

      createPlaylist: (name: string) => {
        const id = Date.now().toString()
        const newPlaylist: Playlist = {
          id,
          name,
          videos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          playlists: [...state.playlists, newPlaylist],
          currentPlaylistId: id,
          currentIndex: 0
        }))
        
        return id
      },

      deletePlaylist: (id: string) => {
        set(state => {
          const newPlaylists = state.playlists.filter(p => p.id !== id)
          const newCurrentId = state.currentPlaylistId === id 
            ? (newPlaylists.length > 0 ? newPlaylists[0].id : null)
            : state.currentPlaylistId
          
          return {
            playlists: newPlaylists,
            currentPlaylistId: newCurrentId,
            currentIndex: 0
          }
        })
      },

      renamePlaylist: (id: string, name: string) => {
        set(state => ({
          playlists: state.playlists.map(p => 
            p.id === id 
              ? { ...p, name, updatedAt: new Date().toISOString() }
              : p
          )
        }))
      },

      setCurrentPlaylist: (id: string) => {
        const playlist = get().playlists.find(p => p.id === id)
        if (playlist) {
          set({ currentPlaylistId: id, currentIndex: 0 })
        }
      },

      // 添加 switchPlaylist 方法，功能与 setCurrentPlaylist 相同
      switchPlaylist: (id: string) => {
        const playlist = get().playlists.find(p => p.id === id)
        if (playlist) {
          set({ currentPlaylistId: id, currentIndex: 0 })
        }
      },

      addVideo: (video: VideoSegment) => {
        const { currentPlaylistId } = get()
        if (!currentPlaylistId) return

        set(state => ({
          playlists: state.playlists.map(p => 
            p.id === currentPlaylistId
              ? { 
                  ...p, 
                  videos: [...p.videos, video],
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      removeVideo: (index: number) => {
        const { currentPlaylistId, currentIndex } = get()
        if (!currentPlaylistId) return

        set(state => {
          const newCurrentIndex = index <= currentIndex && currentIndex > 0 
            ? currentIndex - 1 
            : currentIndex

          return {
            playlists: state.playlists.map(p => 
              p.id === currentPlaylistId
                ? { 
                    ...p, 
                    videos: p.videos.filter((_, i) => i !== index),
                    updatedAt: new Date().toISOString()
                  }
                : p
            ),
            currentIndex: newCurrentIndex
          }
        })
      },

      updateVideo: (index: number, videoUpdate: Partial<VideoSegment>) => {
        const { currentPlaylistId } = get()
        if (!currentPlaylistId) return

        set(state => ({
          playlists: state.playlists.map(p => 
            p.id === currentPlaylistId
              ? { 
                  ...p, 
                  videos: p.videos.map((v, i) => 
                    i === index ? { ...v, ...videoUpdate } : v
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      moveVideo: (from: number, to: number) => {
        const { currentPlaylistId } = get()
        if (!currentPlaylistId) return

        set(state => ({
          playlists: state.playlists.map(p => {
            if (p.id !== currentPlaylistId) return p
            
            const newVideos = [...p.videos]
            const [movedVideo] = newVideos.splice(from, 1)
            newVideos.splice(to, 0, movedVideo)
            
            return {
              ...p,
              videos: newVideos,
              updatedAt: new Date().toISOString()
            }
          })
        }))
      },

      clearVideos: () => {
        const { currentPlaylistId } = get()
        if (!currentPlaylistId) return

        set(state => ({
          playlists: state.playlists.map(p => 
            p.id === currentPlaylistId
              ? { 
                  ...p, 
                  videos: [],
                  updatedAt: new Date().toISOString()
                }
              : p
          ),
          currentIndex: 0
        }))
      },

      next: () => {
        const currentVideos = get().getCurrentVideos()
        const { currentIndex } = get()
        
        if (currentVideos.length === 0) return
        
        const nextIndex = currentIndex + 1 < currentVideos.length ? currentIndex + 1 : 0
        set({ currentIndex: nextIndex })
      },

      previous: () => {
        const currentVideos = get().getCurrentVideos()
        const { currentIndex } = get()
        
        if (currentVideos.length === 0) return
        
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentVideos.length - 1
        set({ currentIndex: prevIndex })
      },

      setCurrentIndex: (index: number) => {
        const currentVideos = get().getCurrentVideos()
        if (index >= 0 && index < currentVideos.length) {
          set({ currentIndex: index })
        }
      },

      exportPlaylist: (id: string) => {
        const playlist = get().playlists.find(p => p.id === id)
        if (!playlist) return ''
        
        const exportData = {
          version: '1.0',
          type: 'single',
          playlist: {
            name: playlist.name,
            videos: playlist.videos,
            createdAt: playlist.createdAt,
            exportedAt: new Date().toISOString()
          }
        }
        
        return JSON.stringify(exportData, null, 2)
      },

      importPlaylist: (data: string) => {
        try {
          const importData = JSON.parse(data)
          
          if (importData.type === 'single' && importData.playlist) {
            const { name, videos } = importData.playlist
            const id = get().createPlaylist(name)
            
            set(state => ({
              playlists: state.playlists.map(p => 
                p.id === id
                  ? { ...p, videos: videos || [] }
                  : p
              )
            }))
            
            return true
          }
          
          return false
        } catch (error) {
          console.error('Import failed:', error)
          return false
        }
      },

      exportAllPlaylists: () => {
        const { playlists } = get()
        
        const exportData = {
          version: '1.0',
          type: 'all',
          playlists: playlists.map(p => ({
            name: p.name,
            videos: p.videos,
            createdAt: p.createdAt
          })),
          exportedAt: new Date().toISOString()
        }
        
        return JSON.stringify(exportData, null, 2)
      },

      importAllPlaylists: (data: string) => {
        try {
          const importData = JSON.parse(data)
          
          if (importData.type === 'all' && importData.playlists) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newPlaylists: Playlist[] = importData.playlists.map((p: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: p.name,
              videos: p.videos || [],
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))
            
            set(state => ({
              playlists: [...state.playlists, ...newPlaylists]
            }))
            
            return true
          }
          
          return false
        } catch (error) {
          console.error('Import all failed:', error)
          return false
        }
      },

      getCurrentPlaylist: () => {
        const { playlists, currentPlaylistId } = get()
        return playlists.find(p => p.id === currentPlaylistId) || null
      },

      getCurrentVideos: () => {
        const currentPlaylist = get().getCurrentPlaylist()
        return currentPlaylist?.videos || []
      }
    }),
    {
      name: 'video-playlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)