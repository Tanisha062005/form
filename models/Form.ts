import mongoose, { Schema, model, models } from 'mongoose';

const FieldSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'email', 'number', 'select', 'radio', 'checkbox', 'date', 'file', 'location'],
        required: true,
    },
    label: { type: String, required: true },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    logic: { type: Object },
    validation: { type: Object },
});

const FormSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: String, required: true },
    fields: [FieldSchema],
    settings: {
        maxResponses: { type: Number, default: null },
        expiryDate: { type: Date, default: null },
        singleSubmission: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        closedMessage: { type: String, default: "This form is no longer accepting responses." },
        status: {
            type: String,
            enum: ['Draft', 'Live', 'Closed'],
            default: 'Draft'
        },
        visibility: {
            type: String,
            enum: ['Public', 'Private', 'Password Protected'],
            default: 'Public'
        },
        password: { type: String, default: "" },
    },
    folderName: { type: String, default: 'Uncategorized' },
}, { timestamps: true });

const Form = models.Form || model('Form', FormSchema);

export default Form;
