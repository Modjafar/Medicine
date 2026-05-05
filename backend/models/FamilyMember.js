const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide family member name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    relationship: {
        type: String,
        required: [true, 'Please provide relationship'],
        enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other']
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [150, 'Age seems invalid']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    medicalNotes: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Please provide family member email'],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    invited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound unique index: no duplicate emails per admin (user)
familyMemberSchema.index({ email: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);

