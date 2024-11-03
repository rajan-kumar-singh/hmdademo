import React, { useEffect, useState } from 'react'
import './App.css'
import { ThemeProvider, createTheme } from '@mui/material';
import SignIn from './components/SignIn';
import PrivateRoutes from './PrivateRoutes'
import ProtectedRoutes from './ProtectedRoutes'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ResponsiveDrawer from './components/ResponsiveDrawer';
import getAuthToken from './utils/getAuthToken';
import axios from 'axios';
import { apiRoot } from './config';
import Cookies from 'js-cookie'

function App() {

  const [authToken, setAuthToken] = useState(Boolean(getAuthToken()))
  // const [authToken, setAuthToken] = useState(true)

  useEffect(() => {
    const newToken = async () => {
      if (getAuthToken())
        try {
          await axios.post(`${apiRoot}/newToken`, {}, { withCredentials: true })
        } catch (err) {
          Cookies.remove('token')
          setAuthToken(false)
        }
    }
    newToken()
  }, [])

  const theme = createTheme({
    typography: {
      "fontFamily": `"Poppins", "Roboto", "Arial" ,"Helvetica", sans-serif`,
      "fontSize": 13,
      "fontWeightLight": 300,
      "fontWeightRegular": 400,
      "fontWeightMedium": 500
    }
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* <Route element={<ProtectedRoutes authToken={authToken} />}>
            <Route path="/signin" element={<SignIn authToken={authToken} setAuthToken={setAuthToken} />} />
          </Route>
          <Route element={<PrivateRoutes authToken={authToken} />}> */}
            <Route path='/' element={<ResponsiveDrawer setAuthToken={setAuthToken} />} />
          {/* </Route> */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;