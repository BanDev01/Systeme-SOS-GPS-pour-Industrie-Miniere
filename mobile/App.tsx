import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { createEmergencyAlert, updateWorkerLocation } from './services/api';

const WORKER_ID = 'worker-1'; // À remplacer par l'ID réel du travailleur

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const trackingInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission d\'accès à la localisation refusée');
        return;
      }
      // Récupérer la position initiale dès le démarrage
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch {
        // Position non disponible au démarrage, pas bloquant
      }
    })();

    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, []);

  const sendLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      await updateWorkerLocation(WORKER_ID, loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Erreur de localisation:', error);
    }
  };

  const startTracking = async () => {
    setIsTracking(true);
    await sendLocation();
    trackingInterval.current = setInterval(sendLocation, 30000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  };

  const handleEmergency = async (type: 'ACCIDENT' | 'MEDICAL' | 'SECURITY' | 'GENERAL') => {
    if (!location?.coords) {
      Alert.alert('Erreur', 'Position GPS non disponible');
      return;
    }

    const alertTypes = {
      ACCIDENT: {
        title: 'Accident du travail',
        message: 'Voulez-vous déclencher une alerte d\'accident du travail ?',
        confirmText: 'Signaler l\'accident',
      },
      MEDICAL: {
        title: 'Malaise médical',
        message: 'Voulez-vous déclencher une alerte médicale ?',
        confirmText: 'Signaler le malaise',
      },
      SECURITY: {
        title: 'Incident de sécurité',
        message: 'Voulez-vous déclencher une alerte de sécurité ?',
        confirmText: 'Signaler l\'incident',
      },
      GENERAL: {
        title: 'Alerte d\'urgence',
        message: 'Voulez-vous déclencher une alerte d\'urgence ?',
        confirmText: 'Envoyer l\'alerte',
      },
    };

    const alertConfig = alertTypes[type];

    Alert.alert(
      alertConfig.title,
      alertConfig.message,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: alertConfig.confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              await createEmergencyAlert(
                WORKER_ID,
                type,
                location.coords.latitude,
                location.coords.longitude,
                `${alertConfig.title} déclenché depuis l'application mobile`
              );
              Alert.alert('Succès', 'Alerte envoyée. Les services appropriés ont été notifiés.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'envoyer l\'alerte');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🚨 SOS GPS</Text>
        <Text style={styles.subtitle}>Système d'alerte d'urgence</Text>
      </View>

      <View style={styles.content}>
        {errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : location?.coords ? (
          <View style={styles.locationInfo}>
            <Text style={styles.label}>Position actuelle:</Text>
            <Text style={styles.coords}>
              {location.coords.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coords}>
              {location.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracy}>
              Précision: {location.coords.accuracy?.toFixed(0)}m
            </Text>
          </View>
        ) : (
          <Text style={styles.noLocation}>Position non disponible</Text>
        )}

        <View style={styles.controls}>
          {!isTracking ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={startTracking}
            >
              <Text style={styles.buttonText}>Démarrer le suivi</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={stopTracking}
            >
              <Text style={styles.buttonText}>Arrêter le suivi</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.emergencyTitle}>Alertes d'urgence</Text>
          
          <View style={styles.emergencyButtons}>
            <TouchableOpacity
              style={[styles.emergencyButton, styles.accidentButton]}
              onPress={() => handleEmergency('ACCIDENT')}
            >
              <Text style={styles.emergencyButtonIcon}>⚠️</Text>
              <Text style={styles.emergencyButtonText}>Accident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyButton, styles.medicalButton]}
              onPress={() => handleEmergency('MEDICAL')}
            >
              <Text style={styles.emergencyButtonIcon}>🏥</Text>
              <Text style={styles.emergencyButtonText}>Malaise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyButton, styles.securityButton]}
              onPress={() => handleEmergency('SECURITY')}
            >
              <Text style={styles.emergencyButtonIcon}>🔒</Text>
              <Text style={styles.emergencyButtonText}>Sécurité</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyButton, styles.generalButton]}
              onPress={() => handleEmergency('GENERAL')}
            >
              <Text style={styles.emergencyButtonIcon}>🚨</Text>
              <Text style={styles.emergencyButtonText}>Urgence</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  locationInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  coords: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#333',
    marginVertical: 2,
  },
  accuracy: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  noLocation: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginBottom: 30,
  },
  error: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 30,
  },
  controls: {
    gap: 15,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e67e22',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  emergencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  emergencyButton: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accidentButton: {
    backgroundColor: '#e74c3c',
  },
  medicalButton: {
    backgroundColor: '#3498db',
  },
  securityButton: {
    backgroundColor: '#f39c12',
  },
  generalButton: {
    backgroundColor: '#9b59b6',
  },
  emergencyButtonIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

