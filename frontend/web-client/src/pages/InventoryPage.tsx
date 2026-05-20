import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SectionCard from "../components/SectionCard";
import api from "../lib/api";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../app/AuthContext";
import type { DonationHistory, ResourceBatch, Shelter } from "../lib/types";

const batchForm = {
  shelterId: 0,
  resourceType: "FOOD",
  resourceName: "",
  unit: "units",
  quantityReceived: 1,
  expiryDate: ""
};

function openDatePicker(event: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
  input.showPicker?.();
}

export default function InventoryPage() {
  const { auth } = useAuth();
  const [form, setForm] = useState(batchForm);
  const [lookupShelterId, setLookupShelterId] = useState(0);
  const [batches, setBatches] = useState<ResourceBatch[]>([]);
  const [history, setHistory] = useState<DonationHistory | null>(null);
  const [managedShelters, setManagedShelters] = useState<Shelter[]>([]);
  const [activeShelters, setActiveShelters] = useState<Shelter[]>([]);
  const [allShelters, setAllShelters] = useState<Shelter[]>([]);
  const [lastDonationReference, setLastDonationReference] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createBatch(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post<ResourceBatch>("/api/resources/batches", {
        ...form,
        shelterId: Number(form.shelterId),
        quantityReceived: Number(form.quantityReceived),
        expiryDate: form.expiryDate || null
      });
      setLastDonationReference(data.sourceDonationRef);
      setSuccess("Donation batch submitted successfully. Your donation reference was generated automatically.");
      setForm((current) => ({
        ...batchForm,
        shelterId: current.shelterId
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit the donation batch."));
    }
  }

  async function loadInventory() {
    const { data } = await api.get<ResourceBatch[]>(`/api/resources/shelters/${lookupShelterId}`);
    setBatches(data);
  }

  async function loadDonationHistory() {
    const { data } = await api.get<DonationHistory>("/api/resources/donations/me");
    setHistory(data);
  }

  async function loadManagedShelters() {
    const { data } = await api.get<Shelter[]>("/api/shelters");
    const mine = data.filter((shelter) => shelter.managerUserId === auth?.userId);
    setManagedShelters(mine);
    if (mine[0]) {
      setLookupShelterId(mine[0].id);
    }
  }

  const loadShelterLists = useCallback(async () => {
    try {
      const { data } = await api.get<Shelter[]>("/api/shelters");
      setAllShelters(data);
      const availableShelters = data.filter((shelter) => shelter.status === "ACTIVE");
      setActiveShelters(availableShelters);
      setError("");
      setForm((current) => {
        const currentSelectionIsStillValid = availableShelters.some((shelter) => shelter.id === Number(current.shelterId));
        return {
          ...current,
          shelterId: currentSelectionIsStillValid
            ? current.shelterId
            : (availableShelters[0]?.id ?? 0)
        };
      });
      if (auth?.role === "SHELTER_MANAGER") {
        const mine = data.filter((shelter) => shelter.managerUserId === auth.userId);
        setManagedShelters(mine);
        setLookupShelterId((current) => (mine.some((shelter) => shelter.id === current) ? current : (mine[0]?.id ?? 0)));
      }
    } catch (err) {
      setActiveShelters([]);
      setError(getApiErrorMessage(err, "Could not load shelters for donation right now."));
    }
  }, [auth?.role, auth?.userId]);

  useEffect(() => {
    void loadShelterLists();
  }, [loadShelterLists]);

  useEffect(() => {
    const refreshOnFocus = () => {
      void loadShelterLists();
    };
    window.addEventListener("focus", refreshOnFocus);
    const intervalId = window.setInterval(() => {
      void loadShelterLists();
    }, 30000);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      window.clearInterval(intervalId);
    };
  }, [loadShelterLists]);

  const currentShelter = useMemo(
    () => activeShelters.find((shelter) => shelter.id === Number(form.shelterId)),
    [activeShelters, form.shelterId]
  );

  const selectedInventoryShelter = useMemo(
    () => managedShelters.find((shelter) => shelter.id === lookupShelterId),
    [managedShelters, lookupShelterId]
  );

  function getShelterName(shelterId: number) {
    return allShelters.find((shelter) => shelter.id === shelterId)?.name ?? `Shelter #${shelterId}`;
  }

  async function copyDonationReference() {
    if (!lastDonationReference) {
      return;
    }
    await navigator.clipboard.writeText(lastDonationReference);
    setSuccess("Donation reference copied to the clipboard.");
  }

  if (auth?.role === "DONOR") {
    return (
      <div className="page-grid">
        <SectionCard title="Donate Resources">
          <form className="stack" onSubmit={createBatch}>
            <label className="field">
              <span className="field-label required">Destination shelter</span>
              <select value={form.shelterId} onChange={(e) => setForm({ ...form, shelterId: Number(e.target.value) })} required>
                {activeShelters.length === 0 ? <option value={0}>No active shelters available</option> : null}
                {activeShelters.map((shelter) => (
                  <option key={shelter.id} value={shelter.id}>
                    {shelter.name} ({shelter.district})
                  </option>
                ))}
              </select>
            </label>
            {activeShelters.length === 0 ? <p className="muted">No active shelters are available for donations yet.</p> : null}
            {currentShelter ? <p className="muted">Selected shelter: {currentShelter.name}</p> : null}
            {currentShelter ? <p className="muted">Contact: {currentShelter.contactName} | {currentShelter.contactPhone}</p> : null}
            <button className="secondary-button compact-button" type="button" onClick={() => void loadShelterLists()}>
              Refresh shelters
            </button>
            <div className="inline-grid">
              <label className="field">
                <span className="field-label required">Resource category</span>
                <select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
                  <option value="FOOD">FOOD</option>
                  <option value="WATER">WATER</option>
                  <option value="MEDICINE">MEDICINE</option>
                  <option value="HYGIENE">HYGIENE</option>
                  <option value="CLOTHING">CLOTHING</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label required">Resource name</span>
                <input placeholder="Bottled water 1L" value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} required />
              </label>
            </div>
            <div className="inline-grid">
              <label className="field">
                <span className="field-label required">Unit</span>
                <input placeholder="bottles, packs, boxes" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
              </label>
              <label className="field">
                <span className="field-label required">Quantity received</span>
                <input type="number" min={1} placeholder="100" value={form.quantityReceived} onChange={(e) => setForm({ ...form, quantityReceived: Number(e.target.value) })} />
              </label>
            </div>
            <label className="field">
              <span className="field-label">Expiry date</span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                onFocus={openDatePicker}
                onClick={openDatePicker}
              />
            </label>
            <label className="field">
              <span className="field-label required">Donation reference</span>
              <div className="copy-field">
                <input
                  value={lastDonationReference || "Generated automatically after submission"}
                  readOnly
                  aria-readonly="true"
                />
                <button className="secondary-button" type="button" onClick={() => void copyDonationReference()} disabled={!lastDonationReference}>
                  Copy
                </button>
              </div>
              <p className="muted">Format: `DON-YYYYMMDD-XXXXXX`. This value is system-generated and cannot be edited.</p>
            </label>
            {success ? <p className="success-text">{success}</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" type="submit" disabled={activeShelters.length === 0}>Submit donation</button>
          </form>
        </SectionCard>
        <SectionCard title="Donation History">
          <button className="secondary-button" onClick={() => void loadDonationHistory()}>Load history</button>
          <div className="table-like">
            {history?.batches.map((batch) => (
              <div className="table-row" key={batch.id}>
                <div>
                  <strong>{batch.resourceName}</strong>
                  <p className="muted">{batch.sourceDonationRef}</p>
                </div>
                <div>
                  <p>{batch.quantityReceived} {batch.unit}</p>
                  <p className="muted">{getShelterName(batch.shelterId)}</p>
                </div>
              </div>
            )) ?? <p className="muted">Load your donation history to review submitted batches.</p>}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <SectionCard title="Manager Inventory View">
        <div className="stack">
          <button className="secondary-button" onClick={() => void loadManagedShelters()}>Refresh my shelters</button>
          <div className="table-like">
            {managedShelters.map((shelter) => (
              <div className="table-row" key={shelter.id}>
                <div>
                  <strong>{shelter.name}</strong>
                  <p className="muted">{shelter.district}</p>
                </div>
                <button className="secondary-button" onClick={() => { setLookupShelterId(shelter.id); void loadInventory(); }}>
                  View inventory
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Shelter Inventory">
        <div className="inline-grid">
          <label className="field">
            <span className="field-label required">Shelter</span>
            <select value={lookupShelterId} onChange={(e) => setLookupShelterId(Number(e.target.value))}>
              {managedShelters.map((shelter) => (
                <option key={shelter.id} value={shelter.id}>
                  {shelter.name} ({shelter.district})
                </option>
              ))}
            </select>
          </label>
          <button className="secondary-button" onClick={() => void loadInventory()} disabled={managedShelters.length === 0}>Load inventory</button>
        </div>
        {selectedInventoryShelter ? <p className="muted">Viewing inventory for {selectedInventoryShelter.name}.</p> : null}
        <div className="table-like">
          {batches.map((batch) => (
            <div className="table-row" key={batch.id}>
              <div>
                <strong>{batch.resourceName}</strong>
                <p className="muted">{batch.resourceType} | {batch.unit}</p>
              </div>
              <div>
                <p>{batch.quantityAvailable}/{batch.quantityReceived}</p>
                <p className="muted">{batch.sourceDonationRef}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
