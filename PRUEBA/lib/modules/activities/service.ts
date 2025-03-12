import { IActivity } from './model';
import activities from './schema';
import { Types, FilterQuery } from 'mongoose';
import { lineString } from '@turf/helpers';
import length from '@turf/length';
import { LineString } from 'geojson';

export default class ActivityService {
    public async createActivity(activity_params: IActivity): Promise<IActivity> {
        try {
            const session = new activities(activity_params);
            return await session.save();
        } catch (error) {
            throw error;
        }
    }

    public async getActivity(activityId: Types.ObjectId): Promise<IActivity | null> {
        try {
            return await activities.findById(activityId)
                .populate('user', 'first_name last_name photo')
                .populate('comments.user', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }

    public async updateActivity(
        activityId: Types.ObjectId, 
        updateData: Partial<IActivity>
    ): Promise<IActivity | null> {
        try {
            return await activities.findByIdAndUpdate(
                activityId,
                { $set: updateData },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    public async deactivateActivity(activityId: Types.ObjectId): Promise<void> {
        try {
            await activities.findByIdAndUpdate(activityId, {
                $set: { activity_deactivated: true }
            });
        } catch (error) {
            throw error;
        }
    }
    public async getUserActivities(
        userId: Types.ObjectId, 
        page: number = 1, 
        limit: number = 10
    ): Promise<IActivity[]> {
        try {
            return await activities.find({ 
                user: userId,
                activity_deactivated: false 
            })
            .sort({ creation_date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }

    public async getNearbyActivities(
        longitude: number,
        latitude: number,
        maxDistanceKm: number
    ): Promise<IActivity[]> {
        try {
            return await activities.find({
                'route.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: maxDistanceKm * 1000
                    }
                },
                activity_deactivated: false
            }).populate('user', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }
    public async getActivityFeed(
        userId: Types.ObjectId,
        page: number = 1,
        limit: number = 10
    ): Promise<IActivity[]> {
        try {
            return await activities.find({
                isPublic: true,
                activity_deactivated: false
            })
            .sort({ creation_date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'first_name last_name photo')
            .populate('comments.user', 'first_name last_name photo');
        } catch (error) {
            throw error;
        }
    }

    public async getActivityStats(
        userId: Types.ObjectId,
        activityType?: string
    ): Promise<{
        totalDistance: number;
        totalTime: number;
        totalActivities: number;
        avgSpeed: number;
    }> {
        try {
            const activities = await this.getUserActivities(userId);
            let totalDistance = 0;
            let totalTime = 0;
            
            activities.forEach(activity => {
                if (activity.route) {
                    const line = lineString(activity.route.coordinates);
                    totalDistance += length(line, { units: 'kilometers' });
                    totalTime += activity.duration || 0;
                }
            });
    
            const totalActivities = activities.length;
            const avgSpeed = totalTime > 0 ? totalDistance / (totalTime / 3600) : 0; // km/h
    
            return {
                totalDistance,
                totalTime,
                totalActivities,
                avgSpeed
            };
        } catch (error) {
            // Either throw the error or return a default value
            throw error;
            // OR return default values
            /* return {
                totalDistance: 0,
                totalTime: 0,
                totalActivities: 0,
                avgSpeed: 0
            }; */
        }
    }
    

public async addKudos(activityId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
        try {
            await activities.findByIdAndUpdate(activityId, {
                $addToSet: { kudos: userId }
            });
        } catch (error) {
            throw error;
        }
    }

    public async addComment(
        activityId: Types.ObjectId,
        userId: Types.ObjectId,
        text: string
    ): Promise<void> {
        try {
            await activities.findByIdAndUpdate(activityId, {
                $push: {
                    comments: {
                        user: userId,
                        text,
                        timestamp: new Date()
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }
    public async startTracking(
        userId: Types.ObjectId,
        type: string,
        title: string
    ): Promise<IActivity> {
        try {
            const activity = new activities({
                user: userId,
                type,
                title,
                start_time: new Date(),
                route: {
                    type: 'LineString',
                    coordinates: []
                }
            });
            return await activity.save();
        } catch (error) {
            throw error;
        }
    }

    public async updateTracking(
        activityId: Types.ObjectId,
        trackingData: {
            latitude: number;
            longitude: number;
            elevation: number;
            speed: number;
            timestamp: Date;
        }
    ): Promise<void> {
        try {
            await activities.findByIdAndUpdate(activityId, {
                $push: {
                    'route.coordinates': [trackingData.longitude, trackingData.latitude],
                    tracking_points: {
                        coordinates: [trackingData.longitude, trackingData.latitude],
                        elevation: trackingData.elevation,
                        speed: trackingData.speed,
                        timestamp: trackingData.timestamp
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }

    public async finishTracking(activityId: Types.ObjectId): Promise<IActivity | null> {
        try {
            const activity = await activities.findById(activityId);
            if (!activity) {
                throw new Error('Activity not found');
            }

            // Calculate final stats
            const stats = await this.calculateActivityStats(activity.route.coordinates);

            return await activities.findByIdAndUpdate(
                activityId,
                {
                    $set: {
                        end_time: new Date(),
                        distance: stats.distance,
                        elevation_gain: stats.elevation.gain,
                        elevation_loss: stats.elevation.loss,
                        is_tracking: false
                    }
                },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    private async calculateActivityStats(routeCoordinates: [number, number][]): Promise<{
        distance: number;
        elevation: { gain: number; loss: number };
    }> {
        try {
            // Use the imported functions directly, not through turf namespace
            const line = lineString(routeCoordinates);
            const distance = length(line, { units: 'kilometers' });
            
            return {
                distance: distance * 1000, // Convert to meters
                elevation: {
                    gain: 0, // Implement real elevation calculation
                    loss: 0  // Implement real elevation calculation
                }
            };
        } catch (error) {
            throw error;
        }
    }
}