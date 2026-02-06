import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { setSocketIO } from './workers/searchWorker.js';
import { setSocketIO as setTwoPhaseSocketIO } from './workers/twoPhaseSearchWorker.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Pass io instance to workers
setSocketIO(io);
setTwoPhaseSocketIO(io);

// Make io available to the app
app.set('io', io);

// Export io instance for use in workers
export { io };

connectDB();

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('✅ Socket.io server initialized');
    console.log('✅ Search worker initialized and ready');
    console.log('✅ Two-phase search worker initialized and ready');
});
