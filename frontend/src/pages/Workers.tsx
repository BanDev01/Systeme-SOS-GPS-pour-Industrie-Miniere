import { useEffect, useState } from 'react';
import { Worker, getWorkers, createWorker } from '../services/api';
import './Workers.css';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  EMERGENCY: 'Urgence',
};

const EMPTY_FORM = { name: '', employeeId: '', department: '' };

export const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch {
      setError('Impossible de charger les travailleurs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createWorker({ ...form, department: form.department || undefined });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      setError('Erreur lors de la création du travailleur');
    }
  };

  const filtered = workers.filter((w) => filter === 'all' || w.status === filter);

  const counts = {
    all: workers.length,
    ACTIVE: workers.filter((w) => w.status === 'ACTIVE').length,
    EMERGENCY: workers.filter((w) => w.status === 'EMERGENCY').length,
    INACTIVE: workers.filter((w) => w.status === 'INACTIVE').length,
  };

  return (
    <div className="workers-page">
      <div className="page-header">
        <h2>Gestion des travailleurs</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setError(null); }}>
          + Nouveau travailleur
        </button>
      </div>

      <div className="workers-filters">
        {(['all', 'ACTIVE', 'EMERGENCY', 'INACTIVE'] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? 'active' : ''}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
            <span className="filter-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nouveau travailleur</h3>
            <form onSubmit={handleSubmit}>
              <label>
                Nom complet
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Mukendi"
                />
              </label>
              <label>
                ID Employé
                <input
                  required
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="EMP-001"
                />
              </label>
              <label>
                Département (optionnel)
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Mine souterraine"
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="no-data">Aucun travailleur trouvé</p>
      ) : (
        <div className="workers-grid">
          {filtered.map((worker) => (
            <div key={worker.id} className={`worker-card status-${worker.status.toLowerCase()}`}>
              <div className="worker-header">
                <h3>{worker.name}</h3>
                <span className={`status-badge ${worker.status.toLowerCase()}`}>
                  {STATUS_LABELS[worker.status] ?? worker.status}
                </span>
              </div>
              <div className="worker-info">
                <p><strong>ID Employé:</strong> {worker.employeeId}</p>
                {worker.department && (
                  <p><strong>Département:</strong> {worker.department}</p>
                )}
                {worker.lastLatitude && worker.lastLongitude ? (
                  <>
                    <p><strong>Dernière position:</strong></p>
                    <p className="coords">
                      {worker.lastLatitude.toFixed(6)}, {worker.lastLongitude.toFixed(6)}
                    </p>
                    {worker.lastLocationUpdate && (
                      <p className="location-time">
                        {new Date(worker.lastLocationUpdate).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="no-location">Aucune position enregistrée</p>
                )}
              </div>
              {worker.alerts && worker.alerts.length > 0 && (
                <div className="worker-alerts">
                  <span className="alert-count">⚠️ {worker.alerts.length} alerte{worker.alerts.length > 1 ? 's' : ''} active{worker.alerts.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
