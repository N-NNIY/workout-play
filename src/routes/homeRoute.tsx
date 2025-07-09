import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import {WorkoutTrainerLanding} from '../pages/Home'

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WorkoutTrainerLanding,
})
