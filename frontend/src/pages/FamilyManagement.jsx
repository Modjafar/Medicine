import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Users, Plus, X, User, Heart, Baby, PersonStanding, Loader2 } from 'lucide-react';
import api from '../services/api';

const relationshipIcons = {
    spouse: Heart,
    child: Baby,
    parent: PersonStanding,
    sibling: Users,
    grandparent: User,
    other: User,
};

const FamilyManagement = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        relationship: 'spouse',
        age: '',
        medicalNotes: '',
    });

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const response = await api.get('/family');
            setFamilyMembers(response.data);
        } catch (error) {
            toast.error('Failed to load family members');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/family', {
                ...formData,
                age: formData.age ? Number(formData.age) : undefined,
            });
            toast.success('Family member added');
            setFormData({ name: '', relationship: 'spouse', age: '', medicalNotes: '' });
            setShowAddForm(false);
            fetchFamilyMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add family member');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this family member and all their medicines?')) return;
        try {
            await api.delete(`/family/${id}`);
            toast.success('Family member deleted');
            fetchFamilyMembers();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
                    <p className="text-gray-600 mt-1">Manage medicines for your family</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddForm ? 'Cancel' : 'Add Member'}
                </button>
            </div>

            {showAddForm && (
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Add Family Member</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                            <select
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="grandparent">Grandparent</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Age"
                                min="0"
                                max="150"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                            <textarea
                                name="medicalNotes"
                                value={formData.medicalNotes}
                                onChange={handleChange}
                                className="input-field"
                                rows="2"
                                placeholder="Any allergies or medical conditions..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="btn-primary">
                                Add Member
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {familyMembers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No family members</h3>
                    <p className="text-gray-500 mt-1">Add family members to manage their medicines</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {familyMembers.map((member) => {
                        const Icon = relationshipIcons[member.relationship] || User;
                        return (
                            <div key={member._id} className="card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Icon size={24} className="text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {member.age && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Age:</span> {member.age} years
                                        </p>
                                    )}
                                    {member.medicalNotes && (
                                        <p className="text-gray-600 line-clamp-2">
                                            <span className="font-medium">Notes:</span> {member.medicalNotes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FamilyManagement;

