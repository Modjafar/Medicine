import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, X, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';

const AddMedicine = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        dosagePerDay: '1',
        reminderTimes: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: '',
        unit: 'tablets',
        familyMember: '',
    });

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const response = await api.get('/family');
            const data = response.data?.data || response.data;
            setFamilyMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch family members');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for dosagePerDay
        if (name === 'dosagePerDay') {
            const dosage = Number(value);
            const currentTimes = formData.reminderTimes.length;

            if (dosage === 1) {
                // Single dose - keep only first reminder time
                setFormData({
                    ...formData,
                    dosagePerDay: value,
                    reminderTimes: [formData.reminderTimes[0] || '08:00'],
                });
            } else {
                // Multiple doses - adjust reminder times array
                let newTimes = [...formData.reminderTimes];

                if (newTimes.length < dosage) {
                    // Add more times
                    const defaultTimes = ['08:00', '14:00', '20:00', '02:00'];
                    while (newTimes.length < dosage) {
                        newTimes.push(defaultTimes[newTimes.length] || '12:00');
                    }
                } else if (newTimes.length > dosage) {
                    // Remove extra times
                    newTimes = newTimes.slice(0, dosage);
                }

                setFormData({
                    ...formData,
                    dosagePerDay: value,
                    reminderTimes: newTimes,
                });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const updateReminderTime = (index, value) => {
        const newTimes = [...formData.reminderTimes];
        newTimes[index] = value;
        setFormData({ ...formData, reminderTimes: newTimes });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate reminder times count matches dosage
        if (formData.reminderTimes.length !== Number(formData.dosagePerDay)) {
            toast.error(`Please provide ${formData.dosagePerDay} reminder times`);
            return;
        }

        setLoading(true);
        try {
            await api.post('/medicines', {
                ...formData,
                quantity: Number(formData.quantity),
                dosagePerDay: Number(formData.dosagePerDay),
                familyMember: formData.familyMember || null,
            });
            toast.success('Medicine added successfully!');
            navigate('/medicines');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add medicine');
        } finally {
            setLoading(false);
        }
    };

    const units = ['tablets', 'capsules', 'ml', 'drops', 'injections', 'patches'];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add Medicine</h1>
                <p className="text-gray-600 mt-1">Add a new medicine to your tracker</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Paracetamol"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 30"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="input-field"
                            >
                                {units.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage Per Day *
                            </label>
                            <input
                                type="number"
                                name="dosagePerDay"
                                value={formData.dosagePerDay}
                                onChange={handleChange}
                                className="input-field"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                For Family Member
                            </label>
                            <select
                                name="familyMember"
                                value={formData.familyMember}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Myself</option>
                                {familyMembers.map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.name} ({member.relationship})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reminder Times *
                            {Number(formData.dosagePerDay) > 1 && (
                                <span className="ml-2 text-xs font-normal text-gray-600">
                                    ({formData.reminderTimes.length} time{formData.reminderTimes.length !== 1 ? 's' : ''} required)
                                </span>
                            )}
                        </label>

                        {Number(formData.dosagePerDay) === 1 ? (
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                <input
                                    type="time"
                                    value={formData.reminderTimes[0]}
                                    onChange={(e) => updateReminderTime(0, e.target.value)}
                                    className="input-field w-auto"
                                    required
                                />
                                <span className="text-sm text-gray-500">(1 dose per day)</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 mb-3">
                                    Set reminder time for each dose:
                                </p>
                                {formData.reminderTimes.map((time, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500 min-w-[50px]">
                                            Dose {index + 1}
                                        </span>
                                        <Clock size={16} className="text-gray-400" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => updateReminderTime(index, e.target.value)}
                                            className="input-field w-auto"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions (Optional)
                        </label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            className="input-field"
                            rows="3"
                            placeholder="e.g., Take after food, Take with water..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center justify-center gap-2 flex-1"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Add Medicine'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/medicines')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicine;

