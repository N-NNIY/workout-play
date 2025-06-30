import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import StretchCountdownPage from '../pages/StretchCountdownPage'

export const countdownRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stretchCountdown',
  component:  StretchCountdownPage,
})
