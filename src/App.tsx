import DragDropBoard from './components/DragDropBoard/DragDropBoard'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'

function App() {
 return (
  <ErrorBoundary>    <div className="App">
      <h1>Drag & Drop + История</h1>
      <DragDropBoard />
    </div></ErrorBoundary>

  )
}

export default App