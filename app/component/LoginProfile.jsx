"use client"

import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { Pencil, Camera, X, Check, Loader2, Link as LinkIcon } from 'lucide-react'
import { urbanist } from '../fonts'

const LoginProfile = () => {
    // Mutate ko useUser se nikaalein taake update ke baad data refresh ho jaye
    const { user, loading, mutate } = useUser()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    if (loading) return <div className="p-8 text-center text-purple-600 animate-pulse">Loading profile...</div>
    if (!user) return <div className="p-8 text-center text-gray-500">No user data found.</div>

    return (
        <div className={`min-h-screen bg-gray-50/50 p-4 ${urbanist.className}`}>
            <div className="max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your profile</h2>
                    <span className="text-sm text-gray-500">
                        Joined {user?.joinedDate || '2026'}
                    </span>
                </div>

                <div className="relative w-24 h-24 mb-6">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
                        <img
                            src={user?.image || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {user?.name}
                        </h3>
                        <div className="text-gray-500 text-sm">
                            <p>{user?.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-gray-700">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] px-5 py-2 rounded-full transition-all font-medium text-sm active:scale-95"
                    >
                        <Pencil size={16} />
                        Edit
                    </button>
                </div>
            </div>

            {isEditModalOpen && (
                <ProfileEditModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                    mutate={mutate} // Refresh data after save
                />
            )}
        </div>
    )
}

const ProfileEditModal = ({ user, onClose, mutate }) => {
    // Input states
    const [name, setName] = useState(user?.name || "")
    const [imageUrl, setImageUrl] = useState(user?.image || "")
    const [isSaving, setIsSaving] = useState(false)

    const handleformsubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`/api/user/${user.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, image: imageUrl }),
            });

            const result = await response.json();

            if (result.success) {
                // UI update karne ke liye mutate call karein
                if (mutate) mutate();
                onClose();
            } else {
                alert(result.message || "Failed to update");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Server error occurred");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative bg-white w-full max-w-md rounded-lg p-5 shadow-2xl ${urbanist.className}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-4 border-b border-gray-200 pb-3">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <p className="text-gray-500 text-sm">Update your name and profile picture URL.</p>
                </div>

                <form className="space-y-4" onSubmit={handleformsubmit}>
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center mb-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-50 shadow-sm">
                            <img
                                src={imageUrl || 'https://via.placeholder.com/150'}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                            />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                <LinkIcon size={14} /> Profile Image URL
                            </label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="text-xs flex-1 py-2 px-3 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="text-xs flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:bg-purple-400"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginProfile