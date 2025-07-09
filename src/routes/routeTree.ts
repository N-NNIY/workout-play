import { Router } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { playlistRoute } from './playlistRoute'
import { playerRoute } from './playerRoute'
import { countdownRoute } from './sretchCountdown'
import { homeRoute } from './homeRoute'
const routeTree = rootRoute.addChildren([playlistRoute, playerRoute,countdownRoute,homeRoute])
export const router = new Router({ routeTree })
