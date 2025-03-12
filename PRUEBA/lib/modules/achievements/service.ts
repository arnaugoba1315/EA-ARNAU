import { IAchievement } from './model';
import {Achievement} from './schema';
import { io } from '../../config/app';
import { Types, Model } from 'mongoose';


export default class AchievementService {
    public async createAchievement(achievement_params: IAchievement): Promise<IAchievement> {
        try {
            const session = new Achievement(achievement_params);
            return await session.save();
        } catch (error) {
            throw error;
        }
    }

    public async updateAchievement(
        achievementId: Types.ObjectId,
        updateData: Partial<IAchievement>
    ): Promise<IAchievement | null> {
        try {
            return await Achievement.findByIdAndUpdate(
                achievementId,
                updateData,
                { new: true }  // Returns the updated document
            );
        } catch (error) {
            throw error;
        }
    }

    public async deactivateAchievement(achievementId: Types.ObjectId): Promise<void> {
        try {
            await Achievement.findByIdAndUpdate(
                achievementId,
                {
                    achievement_deactivated: true,
                    modified_date: new Date()
                },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    public async getAchievementById(achievementId: Types.ObjectId): Promise<IAchievement | null> {
        try {
            return await Achievement.findOne({
                _id: achievementId,
                achievement_deactivated: false
            });
        } catch (error) {
            throw error;
        }
    }

    public async getUserAchievements(userId: Types.ObjectId): Promise<IAchievement[]> {
        try {
            return await Achievement.find({
                'userProgress.userId': userId,
                'userProgress.achieved': true,
                achievement_deactivated: false
            }).sort({ level: 1, category: 1 });
        } catch (error) {
            throw error;
        }
    }

    public async getAvailableAchievements(userId: Types.ObjectId): Promise<IAchievement[]> {
        try {
            const userAchievements = await this.getUserAchievements(userId);
            
            if (!userAchievements || userAchievements.length === 0) {
                // If user has no achievements, return all non-secret achievements
                return await Achievement.find({
                    secret: false,
                    achievement_deactivated: false
                }).sort({ level: 1, category: 1 });
            }
            
            const achievedIds = userAchievements.map(a => a._id);
            
            return await Achievement.find({
                _id: { $nin: achievedIds },
                secret: false,
                achievement_deactivated: false
            }).sort({ level: 1, category: 1 });
        } catch (error) {
            // Consider more specific error handling
            throw new Error(`Failed to get available achievements: ${error.message}`);
        }
    }

    public async getUserProgress(userId: Types.ObjectId): Promise<any> {
        try {
            // First, await the Promise to get the array
            const achievements = await Achievement.find({
                achievement_deactivated: false
            });
    
            // Now we can use map on the array
            return achievements.map(achievement => ({
                achievementId: achievement._id,
                name: achievement.name,
                category: achievement.category,
                level: achievement.level,
                progress: this.calculateProgress(achievement, userId),
                achieved: this.isAchieved(achievement, userId),
                achievedDate: achievement.userProgress
                    .find(p => p.userId.equals(userId))?.achievedDate
            }));
        } catch (error) {
            throw error;
        }
    }
    calculateProgress(achievement: any, userId: Types.ObjectId) {
        throw new Error('Method not implemented.');
    }

    public async getCategoryProgress(userId: Types.ObjectId, category: string): Promise<number> {
        try {
            const categoryAchievements = await Achievement.find({
                category,
                achievement_deactivated: false
            });

            const achieved = categoryAchievements.filter(a => this.isAchieved(a, userId)).length;
            return categoryAchievements.length > 0 
                ? (achieved / categoryAchievements.length) * 100 
                : 0;
        } catch (error) {
            throw error;
        }
    }
    isAchieved(a: import("mongoose").Document<unknown, {}, IAchievement> & IAchievement & Required<{ _id: unknown; }> & { __v: number; }, userId: Types.ObjectId): unknown {
        throw new Error('Method not implemented.');
    }

    public async getRecentAchievements(userId: Types.ObjectId, limit: number = 5): Promise<IAchievement[]> {
        try {
            return await Achievement.find({
                'userProgress.userId': userId,
                'userProgress.achieved': true,
                achievement_deactivated: false
            })
            .sort({ 'userProgress.achievedDate': -1 })
            .limit(limit);
        } catch (error) {
            throw error;
        }
    }
}