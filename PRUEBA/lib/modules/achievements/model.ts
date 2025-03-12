import { Document, Types } from 'mongoose';

export interface IAchievement extends Document {
    sort(arg0: { level: number; category: number; }): IAchievement[] | PromiseLike<IAchievement[]>;
    name: string;
    description: string;
    category: string;
    type: string;
    level: number;
    requirement: number;
    points: number;
    icon: string;
    badgeUrl: string;
    secret: boolean;
    prerequisites: string[];
    userProgress: Array<{
        userId: Types.ObjectId;
        progress: number;
        achievedDate?: Date;
    }>;
    repeatable: boolean;
    achievement_deactivated: boolean;
}
