import { FormEvent, useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import api from "../lib/api";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../app/AuthContext";
import type { Shelter, UserResponse } from "../lib/types";

const initialForm = {
  name: "",
  district: "",
  addressLine1: "",
  addressLine2: "",
  contactName: "",
  contactPhone: "",
  managerUserId: 0,
  latitude: "",
  longitude: "",
  capacity: 100,
  occupancy: 0,
  status: "ACTIVE"
};

export default function SheltersPage() {
  const { auth } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [managers, setManagers] = useState<UserResponse[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadShelters() {
    const { data } = await api.get<Shelter[]>("/api/shelters");
    setShelters(data);
  }

  async function loadManagers() {
    const { data } = await api.get<UserResponse[]>("/api/users");
    const activeManagers = data.filter((user) => user.role === "SHELTER_MANAGER" && user.status === "ACTIVE");
    setManagers(activeManagers);
    if (!form.managerUserId && activeManagers[0]) {
      setForm((current) => ({ ...current, managerUserId: activeManagers[0].id }));
    }
  }

  useEffect(() => {
    void loadShelters();
    if (auth?.role === "ADMIN") {
      void loadManagers();
    }
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/api/shelters", {
        ...form,
        managerUserId: Number(form.managerUserId),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null
      });
      setSuccess("Shelter created successfully.");
      setForm({
        ...initialForm,
        managerUserId: managers[0]?.id ?? 0
      });
      await loadShelters();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the shelter."));
    }
  }

  const visibleShelters = auth?.role === "SHELTER_MANAGER"
    ? shelters.filter((shelter) => shelter.managerUserId === auth.userId)
    : shelters;

  return (
    <div className="page-grid">
      {auth?.role === "ADMIN" ? (
        <SectionCard title="Register Shelter">
          <form className="stack" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-label required">Shelter name</span>
              <input placeholder="Colombo Central Relief Shelter" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              <span className="field-label required">District</span>
              <input placeholder="Colombo" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
            </label>
            <label className="field">
              <span className="field-label required">Address line 1</span>
              <input placeholder="123 Relief Road" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required />
            </label>
            <label className="field">
              <span className="field-label">Address line 2</span>
              <input placeholder="Near the municipal playground" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label required">Primary contact name</span>
              <input placeholder="Ayesha Silva" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
            </label>
            <label className="field">
              <span className="field-label required">Primary contact phone</span>
              <input placeholder="+94 77 123 4567" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required />
            </label>
            <label className="field">
              <span className="field-label required">Assigned shelter manager</span>
              <select value={form.managerUserId} onChange={(e) => setForm({ ...form, managerUserId: Number(e.target.value) })} required>
                <option value={0}>Select an active shelter manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName} ({manager.email})
                  </option>
                ))}
              </select>
            </label>
            <div className="inline-grid">
              <label className="field">
                <span className="field-label">Latitude</span>
                <input placeholder="6.9271" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Longitude</span>
                <input placeholder="79.8612" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </label>
            </div>
            <div className="inline-grid">
              <label className="field">
                <span className="field-label required">Capacity</span>
                <input type="number" min={1} placeholder="200" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span className="field-label required">Current occupancy</span>
                <input type="number" min={0} placeholder="35" value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: Number(e.target.value) })} />
              </label>
            </div>
            <label className="field">
              <span className="field-label required">Shelter status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
            {managers.length === 0 ? <p className="muted">No active shelter managers are available yet. Approve or create one in User Management first.</p> : null}
            {success ? <p className="success-text">{success}</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" type="submit" disabled={managers.length === 0 || form.managerUserId === 0}>Create shelter</button>
          </form>
        </SectionCard>
      ) : (
        <SectionCard title="Managed Shelter Summary">
          <p className="muted">Shelter managers see only shelters assigned to their account.</p>
        </SectionCard>
      )}
      <SectionCard title="Shelter Directory">
        {auth?.role === "ADMIN" && managers.length === 0 ? (
          <p className="muted">Create and approve an active shelter manager account before registering shelters.</p>
        ) : null}
        <div className="table-like">
          {visibleShelters.map((shelter) => (
            <div className="table-row" key={shelter.id}>
              <div>
                <strong>{shelter.name}</strong>
                <p className="muted">{shelter.district}</p>
              </div>
              <div>
                <p>{shelter.occupancy}/{shelter.capacity}</p>
                <p className="muted">{shelter.status}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
