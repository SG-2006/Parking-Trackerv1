import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [lots, setLots] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // fetches all lots from the backend and stores them in the lots state
  async function getLots() {
    const response = await fetch('http://localhost:3001/lots');
    const data = await response.json();
    setLots(data);
  }

  // fetches all spots from the backend and stores them in the spots state
  // pulled out of useEffect so handleBook/handleRelease can call it again to refresh the list
  async function getSpots() {
    const response = await fetch('http://localhost:3001/spots');
    const data = await response.json();
    setSpots(data);
  }

  // useEffect means: as soon as this screen appears, go do this automatically
  // without the user having to click anything - runs once on page load ([] = only once)
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      await Promise.all([getLots(), getSpots()]);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  // sends email/password to the backend to create a new account
  async function handleSignup() {
    setAuthError('');
    setAuthMessage('');
    const response = await fetch('http://localhost:3001/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (response.ok) {
      setAuthMessage('Account created — you can log in now.');
    } else {
      setAuthError('Could not create account.');
    }
  }

  // handleLogin sends the email/password to the backend, converting the data into
  // text (JSON format) so it can travel over the network. Saves the returned token
  // so the rest of the app knows the user is logged in
  async function handleLogin() {
    setAuthError('');
    setAuthMessage('');
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      setAuthError('Invalid email or password.');
      return;
    }
    const data = await response.json();
    setToken(data.token);
  }

  // this function sends a request to book a spot to the backend, verifies which
  // spot through spot_id and proves who's asking through the token, json converts
  // and sends the data through, where the backend validates it. getSpots() re-runs
  // afterward so the list updates without needing a manual page refresh
  async function handleBook(spotId: number) {
    await fetch('http://localhost:3001/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ spot_id: spotId })
    });
    getSpots();
  }

  // this function sends a request to release a specific spot, including proof of
  // who's asking (token) and which spot (the id) - JSON.stringify converts the data
  // into a network-transmissable text format before sending it
  async function handleRelease(spotId: number) {
    await fetch('http://localhost:3001/bookings/release', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ spot_id: spotId })
    });
    getSpots();
  }

  // simple version of the other handlers - no extra parameters to consider
  // (like spot_id for handleBook), just clears the token to log the user out
  function handleLogout() {
    setToken('');
    setAuthError('');
    setAuthMessage('');
  }

  const freeCount = spots.filter((s) => s.status === 'free').length;
  const totalCount = spots.length;

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand">
          <span className="brand-dot" />
          <h1>Parking Finder</h1>
        </div>

        {/* only show the login/signup form when there's no token (not logged in) */}
        {!token && (
          <div className="auth-box">
            {/* updates email as the user types, stores it as a value so it can be sent to auth in the backend */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* same thing, ensures password updates as the user writes it */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="auth-buttons">
              <button className="secondary" onClick={handleSignup}>Sign Up</button>
              {/* creates a button, which runs the handleLogin function */}
              <button onClick={handleLogin}>Login</button>
            </div>
          </div>
        )}

        {/* only show Logout once logged in */}
        {token && (
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        )}
      </header>

      {!token && (authError || authMessage) && (
        <div className={`auth-feedback ${authError ? 'error' : 'success'}`}>
          {authError || authMessage}
        </div>
      )}

      <main>
        {/* token ? means: does it hold an actual string? if not, don't display the details below */}
        {!token ? (
          /* if token is empty display this message */
          <div className="empty-state">
            <div className="empty-icon">🅿️</div>
            <p className="login-prompt">Log in to view live parking availability</p>
          </div>
        ) : loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p className="login-prompt">Loading spots...</p>
          </div>
        ) : (
          <>
            <div className="summary-bar">
              <div className="summary-stat">
                <span className="summary-number">{freeCount}</span>
                <span className="summary-label">free</span>
              </div>
              <div className="summary-track">
                <div
                  className="summary-fill"
                  style={{ width: totalCount ? `${(freeCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
              <div className="summary-stat">
                <span className="summary-number">{totalCount}</span>
                <span className="summary-label">total</span>
              </div>
            </div>

            {lots.map((lot) => (
              <div className="lot-card" key={lot.id}>
                <h2>{lot.name}</h2>
                <div className="spots-grid">
                  {/* only show the spots that belong to this specific lot */}
                  {spots
                    .filter((spot) => spot.lot_id === lot.id)
                    .map((spot) => (
                      <div className={`spot-card ${spot.status}`} key={spot.id}>
                        <div className="spot-top">
                          <span className="spot-label">{spot.label}</span>
                          <span className={`status-dot ${spot.status}`} />
                        </div>
                        <span className="spot-status">{spot.status}</span>
                        {/* when Book is pressed, run handleBook and pass over whatever id
                            this spot belongs to, allowing you to book that specific spot */}
                        {spot.status === 'free' ? (
                          <button onClick={() => handleBook(spot.id)}>Book</button>
                        ) : (
                          <button className="release" onClick={() => handleRelease(spot.id)}>Release</button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

export default App;