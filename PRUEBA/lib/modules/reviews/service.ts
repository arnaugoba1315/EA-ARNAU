import { IReview } from './model';
import reviews from './schema';
import { FilterQuery } from 'mongoose';

export default class ReviewService {
    
    public async createReview(review_params: IReview): Promise<IReview> {
        try {
            const session = new reviews(review_params);
            return await session.save();
        } catch (error) {
            throw error;
        }
    }

    public async filterReviewsByAuthor(query: any): Promise<IReview[]> {
        try {
            const updatedQuery = { ...query, review_deactivated: { $ne: true } };
            return await reviews.find(updatedQuery);
        } catch (error) {
            throw error;
        }
    }

    public async filterReviewsByPlace(query: any): Promise<IReview[]> {
        try {
            const updatedQuery = { ...query, review_deactivated: { $ne: true } };
            return await reviews.find(updatedQuery);
        } catch (error) {
            throw error;
        }
    }

    public async filterReviewsByHousing(query: any): Promise<IReview[]> {
        try {
            const updatedQuery = { ...query, review_deactivated: { $ne: true } };
            return await reviews.find(updatedQuery);
        } catch (error) {
            throw error;
        }
    }

    public async filterReviewByID(query: any): Promise<IReview | null> {
        try {
            return await reviews.findOne(query);
        } catch (error) {
            throw error;
        }
    }

    public async filterReviews(query: any): Promise<IReview[] | null> {
        try {
            const updatedQuery = { ...query, review_deactivated: { $ne: true } };
            return await reviews.find(updatedQuery);
        } catch (error) {
            throw error;
        }
    }
    public async filterUsersEvenDeactivated(query: any, page: number, pageSize: number): Promise<IReview[] | null> {
        try {
            const skipCount = (page - 1) * pageSize;
            const updatedQuery = { query };
            return await reviews.find(updatedQuery).skip(skipCount).limit(pageSize);
        } catch (error) {
            throw error;
        }
    }

    public async updateReview(review_params: IReview): Promise<void> {
        try {
            const query = { _id: review_params._id };
            await reviews.findOneAndUpdate(query, review_params);
        } catch (error) {
            throw error;
        }
    }

    public async deleteReview(review_paramsPartial: Partial<IReview>, review_filter: FilterQuery<IReview>): Promise<void> {
        try {
            await reviews.findOneAndUpdate(review_filter, review_paramsPartial);
        } catch (error) {
            throw error;
        }
    }

}