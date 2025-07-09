import { createRoute } from '@tanstack/react-router'
import PlaylistPage from '../pages/Playlist'
import { rootRoute } from './rootRoute'

export const playlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playlist',
  component: PlaylistPage,
})
