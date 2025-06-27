import { create } from 'zustand'

export interface VideoSegment {
  url: string
  start: number
  end: number
}

interface PlaylistState {
  playlist: VideoSegment[]
  currentIndex: number
  setPlaylist: (list: VideoSegment[]) => void
  next: () => void
  previous: () => void
  setCurrentIndex: (index: number) => void
  reset: () => void
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlist: [],
  currentIndex: 0,
  
  setPlaylist: (list) => set({ playlist: list, currentIndex: 0 }),
  
  next: () => {
    const { currentIndex, playlist } = get()
    const nextIndex = currentIndex + 1 < playlist.length ? currentIndex + 1 : 0
    set({ currentIndex: nextIndex })
  },
  
  previous: () => {
    const { currentIndex, playlist } = get()
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1
    set({ currentIndex: prevIndex })
  },
  
  setCurrentIndex: (index) => {
    const { playlist } = get()
    if (index >= 0 && index < playlist.length) {
      set({ currentIndex: index })
    }
  },
  
  reset: () => set({ currentIndex: 0 }),
}))