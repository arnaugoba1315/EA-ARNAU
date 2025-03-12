import * as mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true // Asegura que no haya duplicados
    },
    revokedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index para limpieza automática
    }
});

export default mongoose.model('RevokedToken', RevokedTokenSchema);