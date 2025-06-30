import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import PlaylistManagerPage from '../pages/PlaylistManagerPage'

export const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager',
  component: PlaylistManagerPage,
})
