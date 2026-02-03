import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import TreeExperience from './components/TreeExperience'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TreeExperience />} />
      </Routes>
    </Router>
  )
}

export default App