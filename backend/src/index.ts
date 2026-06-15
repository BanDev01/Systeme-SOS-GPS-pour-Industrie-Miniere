import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { sosRoutes } from './routes/sos.routes';
import { workerRoutes } from './routes/worker.routes';
import { alertRoutes } from './routes/alert.routes';
import { emergencyContactsRoutes } from './routes/emergency-contacts.routes';
import { seedRoutes } from './routes/seed.routes';
import { setupSocketIO } from './socket/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sos', sosRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/emergency-contacts', emergencyContactsRoutes);
app.use('/api/seed', seedRoutes);

// Setup Socket.IO
setupSocketIO(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 WebSocket actif`);
});

