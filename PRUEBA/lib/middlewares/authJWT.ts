import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import users from '../modules/users/schema';
import reviews from '../modules/reviews/schema';
import housings from '../modules/challenges/schema';
import conversations from '../modules/activities/schema';
import IJwtPayload from '../modules/JWTPayload';
import RevokedTokenService from '../modules/revokedToken/service';

export class authJWT {
    
    private revoked_token_service: RevokedTokenService = new RevokedTokenService();

  public async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const _SECRET: string = 'api+jwt';
      const token = req.header("x-access-token");

      if (!token) {
        return res.status(403).json({ message: "No token provided" });
      }

      const isRevoked = await this.revoked_token_service.isTokenRevoked(token);

      if (isRevoked) {
        return res.status(401).json({ message: "Unauthorized! Token has been revoked" });
      }

      try {
        const decoded = jwt.verify(token, _SECRET) as IJwtPayload;
        req.userId = decoded.id;

        const user = await users.findById(req.userId, { password: 0 });
        if (!user) return res.status(404).json({ message: "No user found" });

        return next();
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }


    public async isOwner(req: Request, res: Response, next: NextFunction, ThingToVerify: String) {
        try {
            const user = await users.findById(req.userId);
            var isAdmin: boolean = false;

            if (user.role == "admin") {
                isAdmin = true;
            }

            switch (ThingToVerify) {
               
                case 'Housing': {
                    if (!isAdmin) {
                        const housingId = req.params.id;
                        const housing = await housings.findById(housingId);

                        if (!housing) return res.status(403).json({ message: "No housing found" });

                        if (housing.owner != req.userId) return res.status(403).json({ message: "Not Owner" });
                    }
                    return next();
                }
                case 'Review': {
                    if (!isAdmin) {
                        const reviewsId = req.params.id;
                        const review = await reviews.findById(reviewsId);

                        if (!review) return res.status(403).json({ message: "No review found" });

                        if (review.author != req.userId) return res.status(403).json({ message: "Not Owner" });
                    }
                    return next();
                }
                case 'User': {
                    if (!isAdmin) {
                        const userId = req.params.id;
                        const user = await users.findById(userId);

                        if (!user) return res.status(403).json({ message: "No user found" });

                        if (user._id != req.userId) return res.status(403).json({ message: "Not Owner" });
                    }
                    return next();
                }
                case 'Conversation': {
                    if (!isAdmin) {
                        const conversationId = req.params.id;
                        const conversation = await conversations.findById(conversationId);

                        if (!conversation) return res.status(403).json({ message: "No conversation found" });

                        if (conversation.user != req.userId) return res.status(403).json({ message: "Not Owner" });
                    }
                    return next();
                }
                default: {
                    return res.status(500).send({ error: 'Internal server error' });
                }
            }

        } catch (error) {
            console.log(error)
            return res.status(500).send({ message: error });
        }
    }

    public async isAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("isAdmin verification");
            const user = await users.findById(req.userId);
            if (user.role == "admin") {
                console.log("User is admin");
                return next();
            }
            return res.status(403).json({ message: "Require Admin Role!" });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: error });
        }
    }
}
