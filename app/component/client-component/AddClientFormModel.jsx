"use client";

import React, { useState } from "react";
import { X, Loader2, User, Building, MapPin } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { inter } from "@/app/fonts";

const initialForm = {
    full_name: "",
    profile_image_url: "",
    gender: "Male",
    email: "",
    phone_number: "",
    country: "",
    state: "",
    city: "",
    status: "Pending",
    company_name: "",
    website_url: "",
    lead_source: "LinkedIn",
    lead_stage: "New",
};

export default function AddClientFormModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState(initialForm);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.full_name || !formData.email) {
            toast.error("Please provide both full name and email.");
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch("/api/client", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Client registered successfully!");
                setFormData(initialForm);
                await mutate("/api/client");
                onClose();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || "Failed to create client.");
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs ${inter.className}`}
        >
            <div
                className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all"
                role="dialog"
                aria-modal="true"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                            Create New Client
                        </h2>
                        <p className="text-xs text-zinc-500">
                            Add a new client profile and pipeline context to your CRM.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    className="max-h-[78vh] overflow-y-auto px-5 py-4 space-y-4"
                >
                    {/* Section 1: Personal Info */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                            <User className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Contact Information</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Alex Morgan"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="alex@company.com"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+1 555 123 4567"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Business & Pipeline */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                            <Building className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Business Context</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Company Name
                                </label>
                                <input
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="Acme Studios Inc."
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    name="website_url"
                                    value={formData.website_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Account Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Lead Stage
                                </label>
                                <select
                                    name="lead_stage"
                                    value={formData.lead_stage}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Lead Source
                                </label>
                                <input
                                    name="lead_source"
                                    value={formData.lead_source}
                                    onChange={handleChange}
                                    placeholder="e.g. LinkedIn, Referral, Google Ads"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Location */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Location</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    Country
                                </label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="United States"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    State / Region
                                </label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="California"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                    City
                                </label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="San Francisco"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Create Client</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
