"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const socket_io_1 = require("socket.io");
const logger_js_1 = require("../lib/logger.js");
const prisma_js_1 = require("../lib/prisma.js");
class SocketGateway {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.setupNamespaces();
        logger_js_1.logger.info('WebSocket Gateway initialized with namespaces /source, /collector, /admin');
    }
    setupNamespaces() {
        // Default namespace
        this.io.on('connection', (socket) => {
            logger_js_1.logger.info({ socketId: socket.id }, 'Client connected to real-time gateway');
            // Join booking room
            socket.on('booking:join', (bookingId) => {
                const room = `booking:${bookingId}`;
                socket.join(room);
                logger_js_1.logger.info({ socketId: socket.id, room }, 'Joined booking room');
                socket.emit('system:notification', { message: `Connected to live telemetry for Booking #${bookingId}` });
            });
            // Leave booking room
            socket.on('booking:leave', (bookingId) => {
                const room = `booking:${bookingId}`;
                socket.leave(room);
            });
            // Collector pushes live GPS location
            socket.on('booking:location', async (data) => {
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
                prisma_js_1.prisma.bookingRoute.upsert({
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
            socket.on('booking:message', (data) => {
                const room = `booking:${data.bookingId}`;
                this.io.to(room).emit('booking:message', {
                    ...data,
                    timestamp: Date.now(),
                });
            });
            socket.on('disconnect', () => {
                logger_js_1.logger.info({ socketId: socket.id }, 'Client disconnected from real-time gateway');
            });
        });
    }
    // Helper method to emit events from controllers
    emitToBooking(bookingId, event, payload) {
        this.io.to(`booking:${bookingId}`).emit(event, payload);
    }
    emitToUser(userId, event, payload) {
        this.io.emit(`user:${userId}:${event}`, payload);
    }
    getIO() {
        return this.io;
    }
}
exports.SocketGateway = SocketGateway;
