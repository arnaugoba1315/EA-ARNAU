import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  stars: {type: Number, required: true},
  author: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // Reference to the User model
  place_id: { type: Schema.Types.ObjectId, ref: 'places' }, // Reference to the Place model
  housing_id: { type: Schema.Types.ObjectId, ref: 'housings' }, // Reference to the Housing model
  review_deactivated: {type:Boolean,required:true,default:false},
  creation_date: {type:Date,required:true,default:new Date()},
  modified_date: {type:Date,required:true,default: new Date()}
});

export default mongoose.model('reviews', schema);