import { Router } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { playlistRoute } from './playlistRoute'
import { playerRoute } from './playerRoute'

const routeTree = rootRoute.addChildren([playlistRoute, playerRoute])
export const router = new Router({ routeTree })
