// lib/modules/challenges/service.ts
import { IChallenge } from './model';
import challenges from './schema';
import { Types, FilterQuery } from 'mongoose';
import { IActivity } from '../activities/model';

export default class ChallengeService {
    
    public async createChallenge(challenge_params: IChallenge): Promise<IChallenge> {
        try {
            const session = new challenges(challenge_params);
            return await session.save();
        } catch (error) {
            throw error;
        }
    }

    public async getActiveUserChallenges(userId: Types.ObjectId): Promise<IChallenge[]> {
        try {
            const now = new Date();
            return await challenges.find({
                participants: userId,
                startDate: { $lte: now },
                endDate: { $gte: now },
                challenge_deactivated: false
            }).populate('creator', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }

    public async getAvailableChallenges(userId: Types.ObjectId): Promise<IChallenge[]> {
        try {
            const now = new Date();
            return await challenges.find({
                participants: { $ne: userId },
                startDate: { $lte: now },
                endDate: { $gte: now },
                visibility: 'public',
                challenge_deactivated: false
            }).populate('creator', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }

    public async joinChallenge(challengeId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
        try {
            await challenges.findByIdAndUpdate(challengeId, {
                $addToSet: { 
                    participants: userId,
                    progress: {
                        userId: userId,
                        currentValue: 0,
                        lastUpdate: new Date(),
                        completed: false
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }

    public async updateProgress(challengeId: Types.ObjectId, activity: IActivity): Promise<void> {
        try {
            const challenge = await challenges.findById(challengeId);
            if (!challenge) throw new Error('Challenge not found');

            // Verificar si la actividad cumple con las reglas del reto
            if (!this.validateActivity(challenge, activity)) {
                return;
            }

            const progressValue = this.calculateProgress(challenge.type, activity);
            const userProgress = challenge.progress.find(p => 
                p.userId.equals(activity.user)
            );

            if (userProgress) {
                userProgress.currentValue += progressValue;
                userProgress.lastUpdate = new Date();
                
                // Verificar si se completó el reto
                if (userProgress.currentValue >= challenge.goal.value && !userProgress.completed) {
                    userProgress.completed = true;
                    userProgress.completionDate = new Date();
                }

                await challenge.save();
            }
        } catch (error) {
            throw error;
        }
    }

    private validateActivity(challenge: IChallenge, activity: IActivity): boolean {
        // Verificar tipo de actividad
        if (challenge.activityType !== 'all' && challenge.activityType !== activity.type) {
            return false;
        }

        // Verificar reglas
        if (challenge.rules) {
            if (challenge.rules.minActivityLength && 
                activity.distance < challenge.rules.minActivityLength) {
                return false;
            }

            if (challenge.rules.minActivityDuration && 
                activity.duration < challenge.rules.minActivityDuration * 60) { // convertir a segundos
                return false;
            }

            if (challenge.rules.allowedLocations && challenge.rules.allowedLocations.length > 0) {
                // Verificar si la actividad está dentro de las ubicaciones permitidas
                const isInAllowedLocation = challenge.rules.allowedLocations.some(location => {
                    // Aquí iría la lógica para verificar si la actividad está dentro del radio
                    // usando la biblioteca turf.js
                    return true; // Implementar la verificación real
                });
                if (!isInAllowedLocation) return false;
            }
        }

        return true;
    }

    private calculateProgress(challengeType: string, activity: IActivity): number {
        switch (challengeType) {
            case 'distance':
                return activity.distance / 1000; // convertir a kilómetros
            case 'time':
                return activity.duration / 60; // convertir a minutos
            case 'elevation':
                return activity.elevation.gain;
            case 'frequency':
                return 1; // cada actividad cuenta como una vez
            default:
                return 0;
        }
    }

    public async getLeaderboard(challengeId: Types.ObjectId): Promise<any[]> {
        try {
            const challenge = await challenges.findById(challengeId)
                .populate('progress.userId', 'first_name last_name photo');
            
            if (!challenge) throw new Error('Challenge not found');

            return challenge.progress
                .sort((a, b) => b.currentValue - a.currentValue)
                .map(p => ({
                    user: p.userId,
                    value: p.currentValue,
                    completed: p.completed,
                    completionDate: p.completionDate
                }));
        } catch (error) {
            throw error;
        }
    }
}