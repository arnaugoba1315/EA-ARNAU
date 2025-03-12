// lib/modules/challenges/schema.ts
import * as mongoose from 'mongoose';
import { IChallenge } from './model';

const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    description: { 
        type: String,
        required: true,
        trim: true 
    },
    type: { 
        type: String,
        enum: ['distance', 'time', 'elevation', 'frequency'],
        required: true
    },
    activityType: {
        type: String,
        enum: ['running', 'cycling', 'hiking', 'all'],
        required: true
    },
    goal: {
        value: { 
            type: Number, 
            required: true,
            min: 0 
        },
        unit: { 
            type: String, 
            required: true,
            enum: ['km', 'minutes', 'meters', 'times']
        }
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    creator: { 
        type: Schema.Types.ObjectId, 
        ref: 'users',
        required: true 
    },
    participants: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'users' 
    }],
    progress: [{
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'users',
            required: true 
        },
        currentValue: { 
            type: Number,
            default: 0 
        },
        lastUpdate: { 
            type: Date,
            default: Date.now 
        },
        completed: { 
            type: Boolean,
            default: false 
        },
        completionDate: { 
            type: Date 
        }
    }],
    rules: {
        minActivityLength: Number,
        minActivityDuration: Number,
        allowedLocations: [{
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            },
            radius: {
                type: Number,
                required: true
            }
        }]
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'invite-only'],
        default: 'public'
    },
    rewards: {
        points: { 
            type: Number,
            required: true,
            default: 0 
        },
        badge: String,
        achievement: {
            type: Schema.Types.ObjectId,
            ref: 'achievements'
        }
    },
    challenge_deactivated: {
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
ChallengeSchema.index({ startDate: 1, endDate: 1 });
ChallengeSchema.index({ activityType: 1 });
ChallengeSchema.index({ visibility: 1 });
ChallengeSchema.index({ 'rules.allowedLocations.coordinates': '2dsphere' });

// Middleware pre-save
ChallengeSchema.pre('save', function(next) {
    this.modified_date = new Date();
    next();
});

// Métodos del schema
ChallengeSchema.methods.isActive = function(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
};

ChallengeSchema.methods.getRemainingTime = function(): number {
    return this.endDate.getTime() - Date.now();
};

ChallengeSchema.methods.getProgress = function(userId: mongoose.Types.ObjectId): number {
    const userProgress = this.progress.find(p => p.userId.equals(userId));
    if (!userProgress) return 0;
    return (userProgress.currentValue / this.goal.value) * 100;
};

export default mongoose.model<IChallenge & mongoose.Document>('challenges', ChallengeSchema);