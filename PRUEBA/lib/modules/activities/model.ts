// lib/modules/activities/model.ts
import * as mongoose from 'mongoose';

export interface IActivity {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    type: 'running' | 'cycling' | 'hiking';
    user: mongoose.Types.ObjectId;
    
    // Datos de la ruta
    route: {
        type: 'LineString';
        coordinates: [number, number][]; // Array de [longitud, latitud]
    };
    
    // Métricas
    distance: number;      // en metros
    duration: number;      // en segundos
    elevation: {
        gain: number;      // ganancia en metros
        loss: number;      // pérdida en metros
    };
    
    // Datos de velocidad
    averageSpeed: number;  // km/h
    maxSpeed: number;      // km/h
    pace: number;         // minutos/km
    
    // Datos de tiempo
    startTime: Date;
    endTime: Date;
    
    // Condiciones
    weather?: {
        temperature: number;
        condition: string;
        humidity: number;
        windSpeed: number;
    };
    
    // Social
    isPublic: boolean;
    kudos: mongoose.Types.ObjectId[];  // IDs de usuarios que dieron like
    comments: {
        user: mongoose.Types.ObjectId;
        text: string;
        timestamp: Date;
    }[];
    
    // Datos del sistema
    activity_deactivated: boolean;
    creation_date: Date;
    modified_date: Date;
}

// lib/modules/activities/schema.ts
const ActivitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { 
        type: String, 
        enum: ['running', 'cycling', 'hiking'],
        required: true 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    
    route: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    },
    
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    elevation: {
        gain: Number,
        loss: Number
    },
    
    averageSpeed: Number,
    maxSpeed: Number,
    pace: Number,
    
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    weather: {
        temperature: Number,
        condition: String,
        humidity: Number,
        windSpeed: Number
    },
    
    isPublic: { type: Boolean, default: true },
    kudos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    
    activity_deactivated: { type: Boolean, default: false },
    creation_date: { type: Date, default: Date.now },
    modified_date: { type: Date, default: Date.now }
});

// Crear índices
ActivitySchema.index({ 'route.coordinates': '2dsphere' });
ActivitySchema.index({ user: 1, creation_date: -1 });
ActivitySchema.index({ isPublic: 1, creation_date: -1 });

export default mongoose.model<IActivity & mongoose.Document>('activities', ActivitySchema);