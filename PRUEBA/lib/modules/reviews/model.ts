import * as mongoose from 'mongoose';

export interface IReview {
    _id?: mongoose.Types.ObjectId; // Optional _id field
    title: string;
    content: string;
    stars: number;
    author: mongoose.Types.ObjectId; // Reference to the User collection
    place_id?: mongoose.Types.ObjectId; // Reference to the Place collection
    housing_id?: mongoose.Types.ObjectId; // Reference to the Housing collection
    review_deactivated:boolean;
    creation_date: Date;
    modified_date: Date;
}