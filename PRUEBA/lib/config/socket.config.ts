// lib/config/socket.config.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const configureSocket = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Namespace para tracking en tiempo real
    const trackingNamespace = io.of('/tracking');

    trackingNamespace.on('connection', (socket) => {
        console.log('User connected to tracking');

        // Unirse a una sala específica para una actividad
        socket.on('join-activity', (activityId: string) => {
            socket.join(`activity-${activityId}`);
        });

        // Actualización de posición
        socket.on('position-update', (data: {
            activityId: string;
            latitude: number;
            longitude: number;
            elevation: number;
            speed: number;
            timestamp: number;
        }) => {
            // Emitir a todos los que siguen esta actividad
            trackingNamespace.to(`activity-${data.activityId}`).emit('position-updated', data);
        });

        // Iniciar actividad en vivo
        socket.on('start-live-activity', (data: {
            activityId: string;
            userId: string;
            activityType: string;
        }) => {
            socket.join(`activity-${data.activityId}`);
            trackingNamespace.emit('activity-started', data);
        });

        // Finalizar actividad
        socket.on('end-activity', (activityId: string) => {
            trackingNamespace.to(`activity-${activityId}`).emit('activity-ended', activityId);
            socket.leave(`activity-${activityId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from tracking');
        });
    });

    return io;
};