import {IUser}  from './modules/users/model';


//with this we are passing the parameter in the request object to the next middleware
declare global{
    namespace Express {
        interface Request {
            userId: IUser["_id"];
        }
    }
}