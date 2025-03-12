import { Request, Response } from 'express';
import ActivityService from '../modules/activities/service';
import { IActivity } from '../modules/activities/model';
import { Types } from 'mongoose';

export class ActivityController {
    private activity_service: ActivityService = new ActivityService();

    public async createActivity(req: Request, res: Response) {
        try {
            const activity = await this.activity_service.createActivity(req.body);
            res.status(201).json(activity);
        } catch (error) {
            res.status(500).json({ error: 'Error creating activity' });
        }
    }

    public async getActivity(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.id);
            const activity = await this.activity_service.getActivity(activityId);
            
            if (!activity) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            
            res.status(200).json(activity);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching activity' });
        }
    }

    public async updateActivity(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.id);
            const updatedActivity = await this.activity_service.updateActivity(
                activityId,
                req.body
            );
            
            if (!updatedActivity) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            
            res.status(200).json(updatedActivity);
        } catch (error) {
            res.status(500).json({ error: 'Error updating activity' });
        }
    }

    public async deactivateActivity(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.id);
            await this.activity_service.deactivateActivity(activityId);
            res.status(200).json({ message: 'Activity deactivated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deactivating activity' });
        }
    }

    public async getActivityFeed(req: Request, res: Response) {
        try {
            const userId = new Types.ObjectId(req.userId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const activities = await this.activity_service.getActivityFeed(userId, page, limit);
            res.status(200).json(activities);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching activity feed' });
        }
    }

    public async getUserActivities(req: Request, res: Response) {
        try {
            const userId = new Types.ObjectId(req.params.userId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const activities = await this.activity_service.getUserActivities(userId, page, limit);
            res.status(200).json(activities);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching user activities' });
        }
    }

    public async getNearbyActivities(req: Request, res: Response) {
        try {
            const longitude = parseFloat(req.params.longitude);
            const latitude = parseFloat(req.params.latitude);
            const maxDistanceKm = parseFloat(req.params.maxDistanceKm);

            if (isNaN(longitude) || isNaN(latitude) || isNaN(maxDistanceKm)) {
                return res.status(400).json({ error: 'Invalid coordinates or distance' });
            }

            const activities = await this.activity_service.getNearbyActivities(
                longitude,
                latitude,
                maxDistanceKm
            );
            res.status(200).json(activities);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching nearby activities' });
        }
    }

    public async getActivityStats(req: Request, res: Response) {
        try {
            const activityType = req.params.type;
            const userId = new Types.ObjectId(req.userId);
            
            const stats = await this.activity_service.getActivityStats(userId, activityType);
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching activity statistics' });
        }
    }

    public async addKudos(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.activityId);
            const userId = new Types.ObjectId(req.userId);
            
            await this.activity_service.addKudos(activityId, userId);
            res.status(200).json({ message: 'Kudos added successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error adding kudos' });
        }
    }

    public async addComment(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.activityId);
            const userId = new Types.ObjectId(req.userId);
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Comment text is required' });
            }

            await this.activity_service.addComment(activityId, userId, text);
            res.status(200).json({ message: 'Comment added successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error adding comment' });
        }
    }

    public async startTracking(req: Request, res: Response) {
        try {
            const userId = new Types.ObjectId(req.userId);
            const { type, title } = req.body;

            if (!type || !title) {
                return res.status(400).json({ error: 'Activity type and title are required' });
            }

            const activity = await this.activity_service.startTracking(userId, type, title);
            res.status(201).json(activity);
        } catch (error) {
            res.status(500).json({ error: 'Error starting activity tracking' });
        }
    }

    public async updateTracking(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.activityId);
            const { latitude, longitude, elevation, speed } = req.body;

            if (!latitude || !longitude) {
                return res.status(400).json({ error: 'Coordinates are required' });
            }

            await this.activity_service.updateTracking(
                activityId,
                {
                    latitude,
                    longitude,
                    elevation: elevation || 0,
                    speed: speed || 0,
                    timestamp: new Date()
                }
            );
            res.status(200).json({ message: 'Tracking updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error updating tracking' });
        }
    }

    public async finishTracking(req: Request, res: Response) {
        try {
            const activityId = new Types.ObjectId(req.params.activityId);
            const activity = await this.activity_service.finishTracking(activityId);
            res.status(200).json(activity);
        } catch (error) {
            res.status(500).json({ error: 'Error finishing activity tracking' });
        }
    }
}