function App() {
  return (
    <>
      <div className="card">
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="age-select">Age: </label>
          <select id="age-select">
            {["10&U", "11-12", "13-14", "15-16", "17-18"].map((ageBracket) => (
              <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
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
      </div>
    </>
  )
}

export default App
