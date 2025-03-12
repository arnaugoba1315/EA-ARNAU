import * as mongoose from 'mongoose';
import { IUserModel } from './model';

const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const schema = new Schema({
    first_name: {type:String,required:true},
    middle_name: {type:String,required:false},
    last_name: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    phone_number: {type:String,required:true, unique:true},
    gender: {type:String,required:true},
    places: [{ type: Schema.Types.ObjectId, ref: 'places' }], // Array of ObjectIds referencing the places model
    reviews: [{ type: Schema.Types.ObjectId, ref: 'reviews' }], // Array of ObjectIds referencing the reviews model
    conversations: [{ type: Schema.Types.ObjectId, ref: 'conversations' }], // Array of ObjectIds referencing the conversations model
    user_rating: {type:Number,required:false},
    photo: {type:String,required:false},
    description: {type:String,required:false},
    personality: {type:String,required:false},
    password: {type:String,required:true},
    birth_date: {type:Date,required:true},
    role: {type:String,required:true,default:'user'},
    housing_offered: [{ type: Schema.Types.ObjectId, ref: 'housings' }], // Array of ObjectIds referencing the housing model
    emergency_contact: {
        type:{
        full_name: { type: String, required: true },
        telephone: { type: String, required: true }},
        required: false
      },
    user_deactivated: {type:Boolean,required:true,default:false},
    creation_date: {type:Date,required:true,default:new Date()},
    modified_date: {type:Date,required:true,default: new Date()}
    
    }
);
schema.methods.encryptPassword = async (password:string) => {
  const salt = await bcrypt.genSalt(10);
  
  return bcrypt.hash(password, salt);
};

schema.methods.validatePassword = async function (password:string) {
  
  return bcrypt.compare(password, this.password);
};
export default mongoose.model<IUserModel>('users', schema);
