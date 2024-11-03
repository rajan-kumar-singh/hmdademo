import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoutes({ authToken }) {
  return (
    authToken? <Navigate to='/' /> : <Outlet/>
  )
}
