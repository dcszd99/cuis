import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AdminLayout from '@/components/admin/AdminLayout'
import EditFallback from '@/components/admin/EditFallback'
import RequireAuth from '@/components/admin/RequireAuth'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminLogin from '@/pages/admin/login'
import AdminPosts from '@/pages/admin/posts'
import AdminProfile from '@/pages/admin/profile'
import AdminProjects from '@/pages/admin/projects'
import AdminSettings from '@/pages/admin/settings'
import AdminSkills from '@/pages/admin/skills'
import About from '@/pages/about'
import Home from '@/pages/home'
import Skills from '@/pages/skills'
import Root from '@/root'

// 编辑页含 Markdown 编辑器（react-markdown），按需加载以避免打进首屏主包。
// oxlint-disable-next-line react/only-export-components -- React.lazy 绑定被误判为组件
const AdminPostEdit = lazy(() => import('@/pages/admin/post-edit'))
// oxlint-disable-next-line react/only-export-components -- React.lazy 绑定被误判为组件
const AdminProjectEdit = lazy(() => import('@/pages/admin/project-edit'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'skills', element: <Skills /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'profile', element: <AdminProfile /> },
      { path: 'skills', element: <AdminSkills /> },
      { path: 'projects', element: <AdminProjects /> },
      {
        path: 'projects/new',
        element: (
          <Suspense fallback={<EditFallback />}>
            <AdminProjectEdit />
          </Suspense>
        ),
      },
      {
        path: 'projects/:slug',
        element: (
          <Suspense fallback={<EditFallback />}>
            <AdminProjectEdit />
          </Suspense>
        ),
      },
      { path: 'posts', element: <AdminPosts /> },
      {
        path: 'posts/new',
        element: (
          <Suspense fallback={<EditFallback />}>
            <AdminPostEdit />
          </Suspense>
        ),
      },
      {
        path: 'posts/:slug',
        element: (
          <Suspense fallback={<EditFallback />}>
            <AdminPostEdit />
          </Suspense>
        ),
      },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
])
