import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Alert, Worker } from '../types';
import { getAlerts, getWorkers } from '../services/api';
import './Dashboard.css';

export const Dashboard = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Connexion WebSocket
    const newSocket = io('http://localhost:5000');
    newSocket.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
      newSocket.emit('join-monitoring');
    });

    // Écouter les nouvelles alertes d'urgence
    newSocket.on('emergency-alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev]);
      if (alert.status === 'ACTIVE') {
        setActiveAlerts(prev => [alert, ...prev]);
      }
    });

    newSocket.on('alert-created', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev]);
      if (alert.status === 'ACTIVE') {
        setActiveAlerts(prev => [alert, ...prev]);
      }
    });

    // Écouter les mises à jour de position
    newSocket.on('worker-location-update', (data: any) => {
      setWorkers(prev => prev.map(w => 
        w.id === data.workerId 
          ? { ...w, lastLatitude: data.latitude, lastLongitude: data.longitude }
          : w
      ));
    });

    // Écouter les mises à jour d'alertes
    newSocket.on('alert-updated', (alert: Alert) => {
      setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
      if (alert.status !== 'ACTIVE') {
        setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
      }
    });

    setSocket(newSocket);

    // Charger les données initiales
    loadData();

    return () => {
      newSocket.close();
    };
  }, []);

  const loadData = async () => {
    try {
      const [alertsData, workersData] = await Promise.all([
        getAlerts(),
        getWorkers()
      ]);
      setAlerts(alertsData);
      setActiveAlerts(alertsData.filter((a: Alert) => a.status === 'ACTIVE'));
      setWorkers(workersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de bord</h2>
        <div className="stats">
          <div className="stat-card workers">
            <div className="stat-value">{workers.length}</div>
            <div className="stat-label">Travailleurs</div>
          </div>
          <div className="stat-card alert">
            <div className="stat-value">{activeAlerts.length}</div>
            <div className="stat-label">Alertes actives</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="map-container">
          <h3>Carte des positions</h3>
          <MapContainer
            center={[-11.188, 26.473]} // Centre entre Kolwezi et Lubumbashi
            zoom={8}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {workers.map(worker => {
              if (worker.lastLatitude && worker.lastLongitude) {
                return (
                  <Marker
                    key={worker.id}
                    position={[worker.lastLatitude, worker.lastLongitude]}
                  >
                    <Popup>
                      <strong>{worker.name}</strong><br />
                      ID: {worker.employeeId}<br />
                      Statut: {worker.status}
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
            {activeAlerts.map(alert => {
              const alertIcons: Record<string, string> = {
                ACCIDENT: '⚠️',
                MEDICAL: '🏥',
                SECURITY: '🔒',
                GENERAL: '🚨',
              };
              const alertColors: Record<string, string> = {
                ACCIDENT: '#e74c3c',
                MEDICAL: '#3498db',
                SECURITY: '#f39c12',
                GENERAL: '#9b59b6',
              };
              return (
                <Marker
                  key={alert.id}
                  position={[alert.latitude, alert.longitude]}
                >
                  <Popup>
                    <strong>{alertIcons[alert.type] || '🚨'} ALERTE {alert.type}</strong><br />
                    Travailleur: {alert.worker?.name}<br />
                    Priorité: {alert.priority || 'MEDIUM'}<br />
                    {alert.message}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="alerts-panel">
          <h3>Alertes récentes</h3>
          {activeAlerts.length === 0 ? (
            <p className="no-alerts">Aucune alerte active</p>
          ) : (
            <div className="alerts-list">
              {activeAlerts
                .sort((a, b) => {
                  const priorityOrder: Record<string, number> = {
                    CRITICAL: 4,
                    HIGH: 3,
                    MEDIUM: 2,
                    LOW: 1,
                  };
                  return (priorityOrder[b.priority || 'MEDIUM'] || 0) - (priorityOrder[a.priority || 'MEDIUM'] || 0);
                })
                .slice(0, 5)
                .map(alert => {
                  const alertIcons: Record<string, string> = {
                    ACCIDENT: '⚠️',
                    MEDICAL: '🏥',
                    SECURITY: '🔒',
                    GENERAL: '🚨',
                  };
                  return (
                    <div key={alert.id} className="alert-card">
                      <div className="alert-header">
                        <span className="alert-type">
                          {alertIcons[alert.type] || '🚨'} {alert.type}
                        </span>
                        <span className="alert-priority">{alert.priority || 'MEDIUM'}</span>
                        <span className="alert-time">
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="alert-body">
                        <strong>{alert.worker?.name}</strong>
                        <p>{alert.message || 'Alerte déclenchée'}</p>
                        <div className="alert-coords">
                          📍 {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                        </div>
                        {alert.externalServicesNotified && (() => {
                          try {
                            const services = typeof alert.externalServicesNotified === 'string' 
                              ? JSON.parse(alert.externalServicesNotified) 
                              : alert.externalServicesNotified;
                            return services && services.length > 0 ? (
                              <div className="alert-services">
                                Services notifiés: {services.join(', ')}
                              </div>
                            ) : null;
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

