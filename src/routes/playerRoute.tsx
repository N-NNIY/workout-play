import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import PlayerPage from '../pages/Player'

export const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/player',
  component: PlayerPage,
})
