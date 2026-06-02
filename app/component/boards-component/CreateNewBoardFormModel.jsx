"use client";
import React, { useState } from 'react';
import { inter } from '@/app/fonts';
import { toast } from 'sonner';

const CreateNewBoardFormModel = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bg_color: '#57C9D8'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!formData.name.trim()) {
                setError('Board name is required');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    bg_color: formData.bg_color
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to create board');
                setLoading(false);
                return;
            }

            setSuccess('Board created successfully!');
            toast.success("Board created successfully!");

            setFormData({
                name: '',
                description: '',
                bg_color: '#57C9D8'
            });

            setTimeout(() => {
                onSuccess?.(data.board);
                onClose?.();
                setSuccess('');
                setLoading(false);
            }, 1500);

        } catch (err) {
            setError('Error creating board: ' + err.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 ${inter.className}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Board</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Board Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Board Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter board name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter board description"
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Background Color
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                name="bg_color"
                                value={formData.bg_color}
                                onChange={handleChange}
                                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                                disabled={loading}
                            />
                            <input
                                type="text"
                                value={formData.bg_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, bg_color: e.target.value }))}
                                placeholder="#57C9D8"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNewBoardFormModel;