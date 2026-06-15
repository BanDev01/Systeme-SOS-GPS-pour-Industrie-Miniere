import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Alert, getAlerts, acknowledgeAlert, resolveAlert } from '../services/api';
import './Alerts.css';

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const TYPE_ICONS: Record<string, string> = {
  ACCIDENT: '⚠️',
  MEDICAL: '🏥',
  SECURITY: '🔒',
  GENERAL: '🚨',
};

const FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'ACTIVE', label: 'Actives' },
  { value: 'ACKNOWLEDGED', label: 'Reçues' },
  { value: 'RESOLVED', label: 'Résolues' },
];

export const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    newSocket.on('connect', () => newSocket.emit('join-monitoring'));

    newSocket.on('alert-created', (alert: Alert) => {
      setAlerts((prev) => {
        if (prev.find((a) => a.id === alert.id)) return prev;
        return [alert, ...prev];
      });
    });

    newSocket.on('emergency-alert', (alert: Alert) => {
      setAlerts((prev) => {
        if (prev.find((a) => a.id === alert.id)) return prev;
        return [alert, ...prev];
      });
    });

    newSocket.on('alert-updated', (updated: Alert) => {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    });

    newSocket.on('alert-acknowledged', (updated: Alert) => {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    });

    setSocket(newSocket);
    load();

    return () => { newSocket.close(); };
  }, []);

  const load = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch {
      console.error('Impossible de charger les alertes');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id, 'Opérateur');
      load();
    } catch {
      console.error('Erreur lors de l\'accusé de réception');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      load();
    } catch {
      console.error('Erreur lors de la résolution');
    }
  };

  const filtered = alerts
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
      return (PRIORITY_ORDER[b.priority ?? 'MEDIUM'] ?? 0) - (PRIORITY_ORDER[a.priority ?? 'MEDIUM'] ?? 0);
    });

  const counts: Record<string, number> = {
    all: alerts.length,
    ACTIVE: alerts.filter((a) => a.status === 'ACTIVE').length,
    ACKNOWLEDGED: alerts.filter((a) => a.status === 'ACKNOWLEDGED').length,
    RESOLVED: alerts.filter((a) => a.status === 'RESOLVED').length,
  };

  const parseServices = (raw?: string | string[]): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h2>Gestion des alertes</h2>
        <div className="connection-dot" title={socket?.connected ? 'Temps réel actif' : 'Déconnecté'}>
          <span className={socket?.connected ? 'dot green' : 'dot red'} />
          {socket?.connected ? 'Temps réel' : 'Déconnecté'}
        </div>
      </div>

      <div className="filters">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className={filter === value ? 'active' : ''}
            onClick={() => setFilter(value)}
          >
            {label}
            <span className="filter-count">{counts[value] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="alerts-table">
        {filtered.length === 0 ? (
          <p className="no-data">Aucune alerte trouvée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Priorité</th>
                <th>Travailleur</th>
                <th>Message</th>
                <th>Position</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Services notifiés</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const services = parseServices(alert.externalServicesNotified);
                return (
                  <tr key={alert.id} className={alert.status === 'ACTIVE' ? 'row-active' : ''}>
                    <td>
                      <span className={`alert-badge type-${alert.type.toLowerCase()}`}>
                        {TYPE_ICONS[alert.type]} {alert.type}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${(alert.priority ?? 'MEDIUM').toLowerCase()}`}>
                        {alert.priority ?? 'MEDIUM'}
                      </span>
                    </td>
                    <td>{alert.worker?.name ?? 'N/A'}</td>
                    <td>{alert.message ?? '—'}</td>
                    <td className="coords">
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </td>
                    <td>{new Date(alert.createdAt).toLocaleString('fr-FR')}</td>
                    <td>
                      <span className={`status-badge ${alert.status.toLowerCase()}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      {services.length > 0 ? (
                        <span className="services-badge">{services.join(', ')}</span>
                      ) : '—'}
                    </td>
                    <td className="actions-cell">
                      {alert.status === 'ACTIVE' && (
                        <button className="btn-acknowledge" onClick={() => handleAcknowledge(alert.id)}>
                          Recevoir
                        </button>
                      )}
                      {(alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED') && (
                        <button className="btn-resolve" onClick={() => handleResolve(alert.id)}>
                          Résoudre
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
