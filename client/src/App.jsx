
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/drones`
function App() {
  const [drones, setDrones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)

  const emptyForm = {
    serialNumber: '',
    model: '',
    status: 'active',
    flightHours: 0
  }

  const [form, setForm] = useState(emptyForm)

  // Fetch all drones from the backend
  const fetchDrones = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch drones')
      }

      const data = await response.json()
      setDrones(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrones()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Add or update a drone
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setError('')

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          flightHours: Number(form.flightHours)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save drone')
      }

      setForm(emptyForm)
      setEditingId(null)
      fetchDrones()
    } catch (err) {
      setError(err.message)
    }
  }

  // Load drone details into the form for editing
  const handleEdit = (drone) => {
    setEditingId(drone._id)
    setForm({
      serialNumber: drone.serialNumber,
      model: drone.model,
      status: drone.status,
      flightHours: drone.flightHours
    })
  }

  // Delete a drone
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drone?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Unable to delete drone')
      }

      fetchDrones()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredDrones = drones.filter((drone) =>
    `${drone.serialNumber} ${drone.model}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const activeCount = drones.filter(
    (drone) => drone.status === 'active'
  ).length

  const maintenanceCount = drones.filter(
    (drone) => drone.status === 'under_maintenance'
  ).length

  const totalFlightHours = drones.reduce(
    (total, drone) => total + Number(drone.flightHours || 0),
    0
  )

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Drone Fleet Tracker</h1>
          <p>Monitor and manage your drone fleet</p>
        </div>

        <button className="refresh-btn" onClick={fetchDrones}>
          ↻ Refresh
        </button>
      </header>

      <main>
        <section className="stats">
          <div className="stat-card">
            <span>Total Drones</span>
            <h2>{drones.length}</h2>
          </div>

          <div className="stat-card">
            <span>Active Drones</span>
            <h2>{activeCount}</h2>
          </div>

          <div className="stat-card">
            <span>Under Maintenance</span>
            <h2>{maintenanceCount}</h2>
          </div>

          <div className="stat-card">
            <span>Total Flight Hours</span>
            <h2>{totalFlightHours}</h2>
          </div>
        </section>

        <section className="content">
          <div className="form-section">
            <h2>{editingId ? 'Edit Drone' : 'Add New Drone'}</h2>

            <form onSubmit={handleSubmit}>
              <label>Serial Number</label>
              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                placeholder="Enter serial number"
                required
              />

              <label>Drone Model</label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Enter drone model"
                required
              />

              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="retired">Retired</option>
              </select>

              <label>Flight Hours</label>
              <input
                type="number"
                name="flightHours"
                min="0"
                value={form.flightHours}
                onChange={handleChange}
                required
              />

              <button type="submit" className="submit-btn">
                {editingId ? 'Update Drone' : 'Add Drone'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h2>Drone Inventory</h2>

              <input
                className="search"
                placeholder="Search drones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {error && <p className="error">{error}</p>}

            {loading ? (
              <p>Loading drones...</p>
            ) : filteredDrones.length === 0 ? (
              <p className="empty">No drones found.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Serial Number</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Flight Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDrones.map((drone) => (
                      <tr key={drone._id}>
                        <td>{drone.serialNumber}</td>
                        <td>{drone.model}</td>
                        <td>
                          <span className={`status ${drone.status}`}>
                            {drone.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{drone.flightHours}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(drone)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(drone._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
