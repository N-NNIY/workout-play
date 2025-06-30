import { Router } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { playlistRoute } from './playlistRoute'
import { playerRoute } from './playerRoute'
import { managerRoute } from './playlistManagerRoute'
import { countdownRoute } from './sretchCountdown'
const routeTree = rootRoute.addChildren([playlistRoute, playerRoute,managerRoute,countdownRoute])
export const router = new Router({ routeTree })
