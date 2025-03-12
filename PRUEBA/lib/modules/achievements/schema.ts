import mongoose from 'mongoose';
import { IAchievement } from './model';

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    level: { type: Number, required: true },
    requirement: { type: Number, required: true },
    points: { type: Number, required: true },
    icon: { type: String, required: true },
    badgeUrl: { type: String, required: true },
    secret: { type: Boolean, default: false },
    prerequisites: [{ type: String }],
    userProgress: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        progress: { type: Number, default: 0 },
        achievedDate: { type: Date }
    }],
    repeatable: { type: Boolean, default: false },
    achievement_deactivated: { type: Boolean, default: false }
});

export const Achievement = mongoose.model<IAchievement>('achievement', achievementSchema);