import { RootRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

export const rootRoute = new RootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
})
