'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"

interface Settings {
  id?: number
  league_name: string
  season: string
  contact_email: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    league_name: "",
    season: "",
    contact_email: ""
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single()

    if (data) setSettings(data)
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("settings")
      .upsert({ ...settings, id: 1 })

    if (error) {
      setMessage("❌ Failed to save settings")
    } else {
      setMessage("✅ Settings saved successfully")
    }

    setSaving(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  if (loading) return <div className="p-6">Loading settings...</div>

  return (
    <div className="settings-container">

      <h1 className="title">System Settings</h1>

      <div className="card">

        <label>League Name</label>
        <input
          value={settings.league_name}
          onChange={e => setSettings({ ...settings, league_name: e.target.value })}
        />

        <label>Season</label>
        <input
          value={settings.season}
          onChange={e => setSettings({ ...settings, season: e.target.value })}
          placeholder="2026"
        />

        <label>Contact Email</label>
        <input
          value={settings.contact_email}
          onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
        />

        <button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {message && <p className="msg">{message}</p>}
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 700px;
          margin: auto;
          padding: 2rem;
          font-family: Inter, sans-serif;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }

        .card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-size: .9rem;
          font-weight: 600;
        }

        input {
          padding: .7rem;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }

        input:focus {
          outline: none;
          border-color: #1e40af;
        }

        button {
          margin-top: 1rem;
          padding: .9rem;
          border: none;
          border-radius: 10px;
          background: #1e40af;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover {
          background: #1e3a8a;
        }

        .msg {
          margin-top: 1rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
