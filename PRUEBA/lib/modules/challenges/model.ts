// lib/modules/challenges/model.ts
import * as mongoose from 'mongoose';

export interface IChallenge {
    owner: mongoose.Types.ObjectId;
    _id?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'distance' | 'time' | 'elevation' | 'frequency';
    activityType: 'running' | 'cycling' | 'hiking' | 'all';
    goal: {
        value: number;      // El valor objetivo (km, minutos, metros, veces)
        unit: string;       // 'km', 'minutes', 'meters', 'times'
    };
    startDate: Date;
    endDate: Date;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    progress: {
        userId: mongoose.Types.ObjectId;
        currentValue: number;
        lastUpdate: Date;
        completed: boolean;
        completionDate?: Date;
    }[];
    rules: {
        minActivityLength?: number;    // Longitud mínima de actividad en metros
        minActivityDuration?: number;  // Duración mínima de actividad en minutos
        allowedLocations?: {          // Ubicaciones permitidas para el reto
            type: 'Point';
            coordinates: [number, number];
            radius: number;           // Radio en metros
        }[];
    };
    visibility: 'public' | 'private' | 'invite-only';
    rewards: {
        points: number;
        badge?: string;       // URL de la insignia
        achievement?: string; // ID del logro asociado
    };
    challenge_deactivated: boolean;
    creation_date: Date;
    modified_date: Date;
}