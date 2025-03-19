import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './Landing'
import Photobooth from './Photobooth'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/booth" element={<Photobooth />} />
      </Routes>
    </Router>
  )
}

export default App
