import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import KegelPage from './modules/kegel/KegelPage'
import WellnessPage from './modules/wellness/WellnessPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kegel" element={<KegelPage />} />
        <Route path="/wellness" element={<WellnessPage />} />
      </Routes>
    </Layout>
  )
}

export default App
