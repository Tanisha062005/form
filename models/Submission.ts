import mongoose, { Schema, model, models } from 'mongoose';

const SubmissionSchema = new Schema({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    metadata: {
        ip: { type: String },
        userAgent: { type: String },
    },
    locationData: {
        latitude: Number,
        longitude: Number,
        city: String,
        timestamp: Date
    },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Submission = models.Submission || model('Submission', SubmissionSchema);

export default Submission;
