import { useEffect, useState } from 'react';
import {
  EmergencyContact,
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../services/api';
import './EmergencyContacts.css';

const TYPE_LABELS: Record<EmergencyContact['type'], string> = {
  SECURITY: 'Sécurité',
  HOSPITAL: 'Hôpital',
  POLICE: 'Police',
  INTERNAL: 'Interne',
};

const EMPTY_FORM = {
  name: '',
  type: 'SECURITY' as EmergencyContact['type'],
  phone: '',
  email: '',
  isActive: true,
};

export const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch {
      setError('Impossible de charger les contacts');
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (c: EmergencyContact) => {
    setForm({ name: c.name, type: c.type, phone: c.phone, email: c.email ?? '', isActive: c.isActive });
    setEditingId(c.id);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, email: form.email || undefined };
      if (editingId) {
        await updateEmergencyContact(editingId, payload);
      } else {
        await createEmergencyContact(payload);
      }
      closeForm();
      load();
    } catch {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (c: EmergencyContact) => {
    try {
      await updateEmergencyContact(c.id, { isActive: !c.isActive });
      load();
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce contact ?')) return;
    try {
      await deleteEmergencyContact(id);
      load();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const grouped = (['SECURITY', 'HOSPITAL', 'POLICE', 'INTERNAL'] as EmergencyContact['type'][]).map(
    (type) => ({ type, items: contacts.filter((c) => c.type === type) })
  );

  return (
    <div className="contacts-page">
      <div className="page-header">
        <h2>Contacts d'urgence</h2>
        <button className="btn-primary" onClick={openCreate}>
          + Nouveau contact
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Modifier le contact' : 'Nouveau contact'}</h3>
            <form onSubmit={handleSubmit}>
              <label>
                Nom
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Centre de sécurité"
                />
              </label>
              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EmergencyContact['type'] })}
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Téléphone
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+243 99 000 0000"
                />
              </label>
              <label>
                Email (optionnel)
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@exemple.cd"
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Actif
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="contacts-grid">
        {grouped.map(({ type, items }) => (
          <div key={type} className="contact-group">
            <h3 className={`group-title type-${type.toLowerCase()}`}>
              {TYPE_LABELS[type]}
              <span className="group-count">{items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="empty-group">Aucun contact</p>
            ) : (
              items.map((c) => (
                <div key={c.id} className={`contact-card ${!c.isActive ? 'inactive' : ''}`}>
                  <div className="contact-header">
                    <span className="contact-name">{c.name}</span>
                    <span className={`active-badge ${c.isActive ? 'active' : 'inactive'}`}>
                      {c.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="contact-info">
                    <span>📞 {c.phone}</span>
                    {c.email && <span>✉️ {c.email}</span>}
                  </div>
                  <div className="contact-actions">
                    <button className="btn-icon" onClick={() => openEdit(c)} title="Modifier">
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleToggleActive(c)}
                      title={c.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {c.isActive ? '🔕' : '🔔'}
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(c.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
