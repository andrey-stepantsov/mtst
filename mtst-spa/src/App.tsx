import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="age-select">Age: </label>
          <select id="age-select">
            {Array.from({ length: 13 }, (_, i) => i + 6).map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="gender-select">Gender: </label>
          <select id="gender-select">
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="course-select">Course: </label>
          <select id="course-select">
            <option value="SCY">SCY</option>
            <option value="LCM">LCM</option>
          </select>
        </div>

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
