// lib/modules/activities/schema.ts
import * as mongoose from 'mongoose';
import { IActivity } from './model';

const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    description: { 
        type: String,
        trim: true 
    },
    type: { 
        type: String, 
        enum: ['running', 'cycling', 'hiking'],
        required: true 
    },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    
    // Datos de la ruta
    route: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],  // Array de [longitud, latitud]
            required: true
        }
    },
    
    // Métricas
    distance: { 
        type: Number,   // en metros
        required: true,
        min: 0 
    },
    duration: { 
        type: Number,   // en segundos
        required: true,
        min: 0 
    },
    elevation: {
        gain: { 
            type: Number,   // en metros
            default: 0 
        },
        loss: { 
            type: Number,   // en metros
            default: 0 
        }
    },
    
    // Datos de velocidad
    averageSpeed: { 
        type: Number,   // km/h
        min: 0 
    },
    maxSpeed: { 
        type: Number,   // km/h
        min: 0 
    },
    pace: { 
        type: Number,   // minutos/km
        min: 0 
    },
    
    // Datos de tiempo
    startTime: { 
        type: Date,
        required: true 
    },
    endTime: { 
        type: Date,
        required: true 
    },
    
    // Condiciones meteorológicas
    weather: {
        temperature: Number,    // en celsius
        condition: String,      // descripción del clima
        humidity: {
            type: Number,
            min: 0,
            max: 100
        },
        windSpeed: {           // en km/h
            type: Number,
            min: 0
        }
    },
    
    // Datos sociales
    isPublic: { 
        type: Boolean, 
        default: true 
    },
    kudos: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'users' 
    }],
    comments: [{
        user: { 
            type: Schema.Types.ObjectId, 
            ref: 'users', 
            required: true 
        },
        text: { 
            type: String, 
            required: true,
            trim: true 
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        }
    }],
    
    // Control del sistema
    activity_deactivated: { 
        type: Boolean, 
        default: false 
    },
    creation_date: { 
        type: Date, 
        default: Date.now 
    },
    modified_date: { 
        type: Date, 
        default: Date.now 
    }
});

// Índices
ActivitySchema.index({ 'route.coordinates': '2dsphere' });
ActivitySchema.index({ user: 1, creation_date: -1 });
ActivitySchema.index({ isPublic: 1, creation_date: -1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ startTime: 1 });

// Middleware pre-save
ActivitySchema.pre('save', function(next) {
    this.modified_date = new Date();
    next();
});

// Métodos del schema
ActivitySchema.methods.calculatePace = function() {
    if (this.distance && this.duration) {
        // Convertir distancia a kilómetros y duración a minutos
        const distanceKm = this.distance / 1000;
        const durationMinutes = this.duration / 60;
        return durationMinutes / distanceKm; // minutos por kilómetro
    }
    return null;
};

ActivitySchema.methods.isOwner = function(userId: mongoose.Types.ObjectId): boolean {
    return this.user.equals(userId);
};

// Virtuals
ActivitySchema.virtual('durationFormatted').get(function() {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
});

ActivitySchema.virtual('distanceFormatted').get(function() {
    return `${(this.distance / 1000).toFixed(2)} km`;
});

// Configuración del schema
ActivitySchema.set('toJSON', { virtuals: true });
ActivitySchema.set('toObject', { virtuals: true });

export default mongoose.model<IActivity & mongoose.Document>('activities', ActivitySchema);