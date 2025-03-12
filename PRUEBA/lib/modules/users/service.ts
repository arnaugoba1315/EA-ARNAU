import { IUser } from './model';
import users from './schema';
import { Types, FilterQuery } from 'mongoose';

export default class UserService {
    public async register(user_params:IUser): Promise<IUser> {
        try {
            
            const session = new users(user_params);
            return await session.save();
        }catch(error) {
            throw error;
        }
    }

    public async filterOneUser(query: any): Promise<IUser | null> {
        try {
            return await users.findOne(query);
        } catch (error) {
            throw error;
        }
    }

    public async filterUsers(query: any, page: number, pageSize: number): Promise<IUser[] | null> {
        try {
            const skipCount = (page - 1) * pageSize;
            const updatedQuery = { ...query, user_deactivated: { $ne: true } };
            return await users.find(updatedQuery).skip(skipCount).limit(pageSize);
        } catch (error) {
            throw error;
        }
    }
    public async filterUsersEvenDeactivated(query: any, page: number, pageSize: number): Promise<IUser[] | null> {
        try {
            const skipCount = (page - 1) * pageSize;
            const updatedQuery = { query };
            return await users.find(updatedQuery).skip(skipCount).limit(pageSize);
        } catch (error) {
            throw error;
        }
    }

    public async updateUser(user_params: IUser): Promise<void> {
        try {
            const query = { _id: user_params._id };
            await users.findOneAndUpdate(query, user_params);
        } catch (error) {
            throw error;
        }
    }

    public async deactivateUser(user_paramsPartial: Partial<IUser>, user_filter: FilterQuery<IUser>): Promise<void> {
        try {
            await users.findOneAndUpdate(user_filter, user_paramsPartial);
        } catch (error) {
            throw error;
        }
    }

    public async addPlaceToUser(userId: Types.ObjectId, placeId: Types.ObjectId): Promise<void> {
        try {
            // Retrieve the user document by ID
            const user = await users.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Add the post ID to the user's array of posts
            user.places.push(placeId);

            // Save the updated user document
            await user.save();
        } catch (error) {
            throw error;
        }
    }

    public async addReviewToUser(userId: Types.ObjectId, reviewId: Types.ObjectId): Promise<void> {
        try {
            // Retrieve the user document by ID
            const user = await users.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Add the post ID to the user's array of posts
            user.reviews.push(reviewId);

            // Save the updated user document
            await user.save();
        } catch (error) {
            throw error;
        }
    }

    public async addConversationToUser(userId: Types.ObjectId, conversationId: Types.ObjectId): Promise<void> {
        try {
            // Retrieve the user document by ID
            const user = await users.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Add the post ID to the user's array of posts
            user.conversations.push(conversationId);

            // Save the updated user document
            await user.save();
        } catch (error) {
            
            throw error;
        }
    }

    public async addHousingOfferedToUser(userId: Types.ObjectId, housingId: Types.ObjectId): Promise<void> {
        try {
            // Retrieve the user document by ID
            const user = await users.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Add the post ID to the user's array of posts
            user.housing_offered.push(housingId);
            console.log(user);

            // Save the updated user document
            await user.save();
        } catch (error) {
            console.log("ERROR",error);
            throw error;
        }
    }

}