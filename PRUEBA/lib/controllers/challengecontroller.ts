// lib/controllers/challengeController.ts
import { Request, Response } from 'express';
import ChallengeService from '../modules/challenges/service';
import { IChallenge } from '../modules/challenges/model';
import { Types } from 'mongoose';
import { io } from '../config/app';

export class ChallengeController {
    private challenge_service: ChallengeService = new ChallengeService();

    public async createChallenge(req: Request, res: Response) {
        try {
            if (
                req.body.title &&
                req.body.description &&
                req.body.type &&
                req.body.activityType &&
                req.body.goal &&
                req.body.startDate &&
                req.body.endDate
            ) {
                const challenge_params: IChallenge = {
                    title: req.body.title,
                    description: req.body.description,
                    type: req.body.type,
                    activityType: req.body.activityType,
                    goal: req.body.goal,
                    startDate: new Date(req.body.startDate),
                    endDate: new Date(req.body.endDate),
                    creator: req.userId,
                    participants: [req.userId], // El creador se une automáticamente
                    progress: [{
                        userId: req.userId,
                        currentValue: 0,
                        lastUpdate: new Date(),
                        completed: false
                    }],
                    rules: req.body.rules,
                    visibility: req.body.visibility || 'public',
                    rewards: req.body.rewards || { points: 0 },
                    challenge_deactivated: false,
                    creation_date: new Date(),
                    modified_date: new Date()
                };

                const challenge_data = await this.challenge_service.createChallenge(challenge_params);
                
                // Emitir evento de nuevo reto
                if (challenge_data.visibility === 'public') {
                    io.emit('new-challenge', {
                        id: challenge_data._id,
                        title: challenge_data.title,
                        creator: req.userId
                    });
                }

                return res.status(201).json(challenge_data);
            } else {
                return res.status(400).json({ error: 'Missing required fields' });
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getActiveUserChallenges(req: Request, res: Response) {
        try {
            const challenges = await this.challenge_service.getActiveUserChallenges(req.userId);
            return res.status(200).json(challenges);
        } catch (error) {
            console.error('Error getting active challenges:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getAvailableChallenges(req: Request, res: Response) {
        try {
            const challenges = await this.challenge_service.getAvailableChallenges(req.userId);
            return res.status(200).json(challenges);
        } catch (error) {
            console.error('Error getting available challenges:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async joinChallenge(req: Request, res: Response) {
        try {
            const challengeId = new Types.ObjectId(req.params.challengeId);
            await this.challenge_service.joinChallenge(challengeId, req.userId);
            
            // Emitir evento de unión al reto
            io.emit('challenge-joined', {
                challengeId: challengeId,
                userId: req.userId
            });

            return res.status(200).json({ message: 'Successfully joined challenge' });
        } catch (error) {
            console.error('Error joining challenge:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getLeaderboard(req: Request, res: Response) {
        try {
            const challengeId = new Types.ObjectId(req.params.challengeId);
            const leaderboard = await this.challenge_service.getLeaderboard(challengeId);
            return res.status(200).json(leaderboard);
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async updateProgress(req: Request, res: Response) {
        try {
            const challengeId = new Types.ObjectId(req.params.challengeId);
            await this.challenge_service.updateProgress(challengeId, req.body.activity);

            // Emitir evento de actualización de progreso
            io.emit('challenge-progress-updated', {
                challengeId: challengeId,
                userId: req.userId
            });

            return res.status(200).json({ message: 'Progress updated successfully' });
        } catch (error) {
            console.error('Error updating progress:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}