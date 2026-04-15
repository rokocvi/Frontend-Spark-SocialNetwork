import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Match from './pages/Match'
import Chat from './pages/Chat'
import Messages from './pages/Messages'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path = "/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/match" element={
          <ProtectedRoute><Match /></ProtectedRoute>
        } />
        <Route path="/chat/:matchId" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App