import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function PrivateRoutes({ authToken }) {
  return (
    authToken? <Outlet/> : <Navigate to='/signin'/>
  )
}
