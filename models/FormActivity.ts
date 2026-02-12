import mongoose, { Schema, model, models } from 'mongoose';

const FormActivitySchema = new Schema({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    eventType: {
        type: String,
        enum: ['created', 'status_changed', 'response_received', 'settings_updated'],
        required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// Index for efficient querying
FormActivitySchema.index({ formId: 1, timestamp: -1 });

const FormActivity = models.FormActivity || model('FormActivity', FormActivitySchema);

export default FormActivity;
