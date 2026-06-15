import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const setupSocketIO = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);

    // Rejoindre la room pour les mises à jour en temps réel
    socket.on('join-monitoring', () => {
      socket.join('monitoring');
      console.log(`📊 Client ${socket.id} a rejoint le monitoring`);
    });

    // Rejoindre la room pour un travailleur spécifique
    socket.on('join-worker', (workerId: string) => {
      socket.join(`worker-${workerId}`);
      console.log(`👷 Client ${socket.id} suit le travailleur ${workerId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO n\'est pas initialisé');
  }
  return ioInstance;
};



