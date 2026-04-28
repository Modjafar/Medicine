import React from 'react';
import { Pill, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const MedicineCard = ({ medicine, onMarkTaken, onDelete, showActions = true }) => {
    const isLowStock = medicine.daysRemaining <= 3 && medicine.quantity > 0;
    const isOutOfStock = medicine.quantity <= 0;

    const getStockStatusColor = () => {
        if (isOutOfStock) return 'bg-danger-50 text-danger-600 border-danger-200';
        if (isLowStock) return 'bg-warning-50 text-warning-600 border-warning-200';
        return 'bg-success-50 text-success-600 border-success-200';
    };

    const getStockStatusText = () => {
        if (isOutOfStock) return 'Out of Stock';
        if (isLowStock) return `${medicine.daysRemaining} days left`;
        return 'In Stock';
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Pill size={20} className="text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                        <p className="text-sm text-gray-500">{medicine.unit}</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStockStatusColor()}`}>
                    {getStockStatusText()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={16} />
                    <span>Qty: {medicine.quantity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{medicine.dosagePerDay}/day</span>
                </div>
            </div>

            {medicine.reminderTimes?.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1.5">Reminder times</p>
                    <div className="flex flex-wrap gap-2">
                        {medicine.reminderTimes.map((time, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                            >
                                {time}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {medicine.instructions && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{medicine.instructions}</p>
            )}

            {showActions && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onMarkTaken?.(medicine._id)}
                        disabled={isOutOfStock}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-success-50 text-success-600 rounded-lg text-sm font-medium hover:bg-success-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={16} />
                        Mark Taken
                    </button>
                    <button
                        onClick={() => onDelete?.(medicine._id)}
                        className="px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicineCard;

