import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

export class SocketGateway {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupNamespaces();
    logger.info('WebSocket Gateway initialized with namespaces /source, /collector, /admin');
  }

  private setupNamespaces() {
    // Default namespace
    this.io.on('connection', (socket: Socket) => {
      logger.info({ socketId: socket.id }, 'Client connected to real-time gateway');

      // Join booking room
      socket.on('booking:join', (bookingId: string) => {
        const room = `booking:${bookingId}`;
        socket.join(room);
        logger.info({ socketId: socket.id, room }, 'Joined booking room');
        socket.emit('system:notification', { message: `Connected to live telemetry for Booking #${bookingId}` });
      });

      // Leave booking room
      socket.on('booking:leave', (bookingId: string) => {
        const room = `booking:${bookingId}`;
        socket.leave(room);
      });

      // Collector pushes live GPS location
      socket.on('booking:location', async (data: {
        bookingId: string;
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
        etaMinutes?: number;
      }) => {
        const { bookingId, lat, lng, heading = 0, speed = 25, etaMinutes = 15 } = data;
        const room = `booking:${bookingId}`;

        // Broadcast to both Source and Admin in real-time
        this.io.to(room).emit('booking:location', {
          bookingId,
          collector: { lat, lng, heading, speed },
          etaMinutes,
          timestamp: Date.now(),
        });

        // Persist periodically in DB
        prisma.bookingRoute.upsert({
          where: { bookingId },
          create: {
            bookingId,
            currentLat: lat,
            currentLng: lng,
            heading,
            speed,
            etaMinutes,
          },
          update: {
            currentLat: lat,
            currentLng: lng,
            heading,
            speed,
            etaMinutes,
            updatedAt: new Date(),
          },
        }).catch((e) => console.error('Error saving socket telemetry:', e));
      });

      // Real-time Chat
      socket.on('booking:message', (data: { bookingId: string; from: string; message: string }) => {
        const room = `booking:${data.bookingId}`;
        this.io.to(room).emit('booking:message', {
          ...data,
          timestamp: Date.now(),
        });
      });

      socket.on('disconnect', () => {
        logger.info({ socketId: socket.id }, 'Client disconnected from real-time gateway');
      });
    });
  }

  // Helper method to emit events from controllers
  public emitToBooking(bookingId: string, event: string, payload: any) {
    this.io.to(`booking:${bookingId}`).emit(event, payload);
  }

  public emitToUser(userId: string, event: string, payload: any) {
    this.io.emit(`user:${userId}:${event}`, payload);
  }

  public getIO() {
    return this.io;
  }
}
