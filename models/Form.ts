import mongoose, { Schema, model, models } from 'mongoose';

const FieldSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'email', 'number', 'select', 'radio', 'checkbox', 'date', 'file'],
        required: true,
    },
    label: { type: String, required: true },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    logic: { type: Object },
});

const FormSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: String, required: true },
    fields: [FieldSchema],
    settings: {
        expiryDate: { type: Date },
        responseLimit: { type: Number },
        isActive: { type: Boolean, default: true },
    },
    folder: { type: String, default: 'General' },
}, { timestamps: true });

const Form = models.Form || model('Form', FormSchema);

export default Form;
