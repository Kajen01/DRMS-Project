import { FormEvent, useEffect, useMemo, useState } from "react";
import SectionCard from "../components/SectionCard";
import api from "../lib/api";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../app/AuthContext";
import type { Shelter, ShortageRequest, Transfer } from "../lib/types";

const shortageForm = {
  shelterId: 1,
  resourceType: "FOOD",
  resourceName: "",
  unit: "units",
  requiredQuantity: 1,
  justification: ""
};

export default function SharingPage() {
  const { auth } = useAuth();
  const [shortage, setShortage] = useState<ShortageRequest | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [transferList, setTransferList] = useState<Transfer[]>([]);
  const [allShortages, setAllShortages] = useState<ShortageRequest[]>([]);
  const [form, setForm] = useState(shortageForm);
  const [availableShelters, setAvailableShelters] = useState<Shelter[]>([]);
  const [allShelters, setAllShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEligibleShelters() {
    const { data } = await api.get<Shelter[]>("/api/shelters");
    setAllShelters(data);
    const shelters = auth?.role === "SHELTER_MANAGER"
      ? data.filter((shelter) => shelter.managerUserId === auth.userId)
      : data;
    setAvailableShelters(shelters);
    if (shelters[0]) {
      setForm((current) => ({ ...current, shelterId: shelters[0].id }));
    }
  }

  async function loadShortageSummary() {
    const { data } = await api.get<ShortageRequest[]>("/api/transparency/shortages");
    setAllShortages(data);
  }

  useEffect(() => {
    void loadShortageSummary();
    void loadEligibleShelters();
  }, [auth?.role, auth?.userId]);

  async function createShortage(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post<ShortageRequest>("/api/shares/requests", form);
      setShortage(data);
      setTransfer(null);
      setSuccess("Shortage request created successfully.");
      await loadShortageSummary();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the shortage request."));
    }
  }

  async function matchShortage() {
    if (!shortage) return;
    setError("");
    try {
      const { data } = await api.post<Transfer>("/api/shares/matches", { shortageRequestId: shortage.id });
      setTransfer(data);
      setSuccess("Matching transfer reserved successfully.");
      await loadShortageSummary();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not match the shortage request."));
    }
  }

  async function dispatchTransfer() {
    if (!transfer) return;
    setError("");
    try {
      const { data } = await api.post<Transfer>(`/api/shares/transfers/${transfer.transferId}/dispatch`);
      setTransfer(data);
      setSuccess("Transfer dispatched successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not dispatch the transfer."));
    }
  }

  async function receiveTransfer() {
    if (!transfer) return;
    setError("");
    try {
      const { data } = await api.post<Transfer>(`/api/shares/transfers/${transfer.transferId}/receive`);
      setTransfer(data);
      setSuccess("Transfer receipt confirmed successfully.");
      await loadShortageSummary();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not confirm receipt for the transfer."));
    }
  }

  async function loadTransfers(direction = "all") {
    setError("");
    try {
      const { data } = await api.get<Transfer[]>(`/api/shares/transfers?shelterId=${form.shelterId}&direction=${direction}`);
      setTransferList(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load transfers for the selected shelter."));
    }
  }

  function getShelterName(shelterId: number) {
    return allShelters.find((shelter) => shelter.id === shelterId)?.name ?? `Shelter #${shelterId}`;
  }

  const selectedShelter = useMemo(
    () => availableShelters.find((shelter) => shelter.id === form.shelterId),
    [availableShelters, form.shelterId]
  );

  return (
    <div className="page-grid">
      {auth?.role !== "DONOR" ? (
        <>
          <SectionCard title="Create Shortage Request">
            <form className="stack" onSubmit={createShortage}>
              <label className="field">
                <span className="field-label required">Shelter with shortage</span>
                <select value={form.shelterId} onChange={(e) => setForm({ ...form, shelterId: Number(e.target.value) })}>
                  {availableShelters.map((shelter) => (
                    <option key={shelter.id} value={shelter.id}>
                      {shelter.name} ({shelter.district})
                    </option>
                  ))}
                </select>
              </label>
              {availableShelters.length === 0 ? <p className="muted">No eligible shelters are available for your account yet.</p> : null}
              {selectedShelter ? <p className="muted">Selected shelter: {selectedShelter.name}</p> : null}
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
                  <input placeholder="Oral rehydration salts" value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} required />
                </label>
              </div>
              <div className="inline-grid">
                <label className="field">
                  <span className="field-label required">Unit</span>
                  <input placeholder="packs, boxes, bottles" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
                </label>
                <label className="field">
                  <span className="field-label required">Required quantity</span>
                  <input type="number" min={1} placeholder="50" value={form.requiredQuantity} onChange={(e) => setForm({ ...form, requiredQuantity: Number(e.target.value) })} />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Operational justification</span>
                <textarea placeholder="Urgent shortage due to flood evacuee increase." value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} />
              </label>
              {success ? <p className="success-text">{success}</p> : null}
              {error ? <p className="error-text">{error}</p> : null}
              <button className="primary-button" type="submit" disabled={availableShelters.length === 0}>Create shortage</button>
            </form>
          </SectionCard>
          <SectionCard title="Transfer Workflow">
            <div className="stack">
              <p className="muted">Shortage: {shortage ? `${shortage.resourceName} (${shortage.status})` : "No shortage created yet"}</p>
              <p className="muted">Transfer: {transfer ? `${transfer.donationRef} (${transfer.status})` : "No active transfer yet"}</p>
              <div className="inline-grid">
                <button className="secondary-button" onClick={() => void matchShortage()} disabled={!shortage}>Match</button>
                <button className="secondary-button" onClick={() => void dispatchTransfer()} disabled={!transfer}>Dispatch</button>
                <button className="primary-button" onClick={() => void receiveTransfer()} disabled={!transfer}>Receive</button>
              </div>
              <label className="field">
                <span className="field-label required">Transfer list shelter</span>
                <select value={form.shelterId} onChange={(e) => setForm({ ...form, shelterId: Number(e.target.value) })}>
                  {availableShelters.map((shelter) => (
                    <option key={shelter.id} value={shelter.id}>
                      {shelter.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="secondary-button" onClick={() => void loadTransfers()} disabled={availableShelters.length === 0}>Load shelter transfers</button>
              <div className="table-like">
                {transferList.map((item) => (
                  <div className="table-row" key={item.transferId}>
                    <div>
                      <strong>{item.resourceName}</strong>
                      <p className="muted">{item.donationRef}</p>
                    </div>
                    <div>
                      <p>{item.status}</p>
                      <p className="muted">{getShelterName(item.sourceShelterId)} to {getShelterName(item.targetShelterId)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Sharing Workflow Access">
          <p className="muted">Donor accounts cannot create or dispatch shortage workflows, but you can still review all submitted shortage requests below.</p>
        </SectionCard>
      )}
      <SectionCard title="All Shortage Requests">
        <button className="secondary-button" onClick={() => void loadShortageSummary()}>Refresh shortage summary</button>
        <div className="table-like">
          {allShortages.map((item) => (
            <div className="table-row summary-row" key={item.id}>
              <div>
                <strong>{item.resourceName}</strong>
                <p className="muted">{item.resourceType} | {item.unit}</p>
                <p className="muted">Shelter: {getShelterName(item.shelterId)}</p>
                <p className="muted">Justification: {item.justification || "No justification provided"}</p>
              </div>
              <div className="summary-meta">
                <p><strong>Request ID:</strong> {item.id}</p>
                <p><strong>Required:</strong> {item.requiredQuantity}</p>
                <p><strong>Shortage:</strong> {item.shortageQuantity}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {allShortages.length === 0 ? <p className="muted">No shortage requests have been submitted yet.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
}
