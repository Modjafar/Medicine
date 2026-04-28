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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);

