import { v2 as cloudinary } from 'cloudinary';
import { Application, Request, Response, NextFunction } from 'express';
import { authJWT } from '../middlewares/authJWT';
import * as multer from 'multer';
import * as fs from 'fs';

interface MulterRequest extends Request {
    file: Express.Multer.File;
}

export class PhotoUploadRoutes {
    private AuthJWT: authJWT = new authJWT();

    constructor() {
        // Cloudinary configuration is assumed to be set via .env file which is already loaded
    }

    public route(app: Application) {
        const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

        app.post('/upload', upload.single('image'), (req: MulterRequest, res: Response, next: NextFunction) => {
            this.AuthJWT.verifyToken(req, res, (err?: any) => {
                if (err) {
                    console.log("Error cc: " + err);
                    return res.status(401).json({ message: 'Unauthorized' }); // Short-circuit if token verification fails
                }

                // Now handle the file upload
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }

                // Upload to Cloudinary
                cloudinary.uploader.upload(file.path, (error: any, result: any) => {
                    // Clean up the local file
                    fs.unlink(file.path, (unlinkError) => {
                        if (unlinkError) {
                            console.error('Failed to delete local file:', unlinkError);
                        }
                    });

                    if (error) {
                        console.error("Cloudinary error:", error);
                        return res.status(500).json({ message: 'Failed to upload image' });
                    }

                    // Respond with the secure URL of the uploaded image
                    res.json({ url: result.secure_url });
                });
            });
        });
    }
}
