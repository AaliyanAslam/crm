"use client";
import React, { useState, useLayoutEffect, useRef } from 'react';
import { inter } from '@/app/fonts';
import { RxCross1 } from "react-icons/rx";
import { FaFilesPinwheel } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi"; // For custom select arrow
import gsap from 'gsap';
import { toast } from 'sonner';

const AddClientFormModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: '',
        profile_image_url: "",
        gender: 'Male',
        email: '',
        phone_number: '',
        country: '',
        state: '',
        city: '',
        status: 'Pending',
        company_name: '',
        website_url: '',
        lead_source: '',
        lead_stage: 'New'
    });

    useLayoutEffect(() => {
        if (isOpen) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.98, y: 10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const res = await fetch('/api/client', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Client created successfully!");
                setIsLoading(false);
                onClose();
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div ref={overlayRef} className={`fixed inset-0 z-100 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 ${inter.className}`}>
            <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200/80">

                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-linear-to-r from-[#5FC8DB]/10 to-[#5FC8DB]/5">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Register New Client</h2>
                        <p className="text-xs md:text-sm text-slate-500 font-normal mt-1">Create new client record to manage future interactions</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-[#5FC8DB]/15 transition-all text-slate-400 hover:text-[#5FC8DB] border border-transparent hover:border-[#5FC8DB]/30 shrink-0">
                        <RxCross1 size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-1 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* PERSONAL INFORMATION SECTION */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-3 bg-linear-to-b from-blue-600 to-blue-500 rounded-full"></div>

                            <h3 className="text-xs md:text-sm font-medium text-slate-800">Personal Information</h3>
                        </div>
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                            <Input label="Full Name *" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="First and last name" required />
                            <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" required />
                            <Input label="Profile Image Url" name="profile_image_url" type="text" value={formData.profile_image_url} onChange={handleChange} placeholder="http://" required />
                            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                            <Select label="Account Status" name="status" value={formData.status} onChange={handleChange} options={['Pending', 'Active', 'Closed']} />
                        </div>
                    </div>

                    {/* BUSINESS DETAILS SECTION */}
                    <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-3 bg-linear-to-b from-blue-600 to-blue-500 rounded-full"></div>
                            <h3 className="text-xs md:text-sm font-medium text-slate-800">Business Context</h3>
                        </div>
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                            <Input label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Legal business name" />
                            <Input label="Website URL" name="website_url" type="url" value={formData.website_url} onChange={handleChange} placeholder="https://www.example.com" />
                            <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+92 3XX XXXXXXX" />
                            <Input label="Lead Source" name="lead_source" value={formData.lead_source} onChange={handleChange} placeholder="e.g. LinkedIn, Referral" />
                        </div>
                        <div className="w-full">
                            <Select
                                label="Lead Pipeline Stage"
                                name="lead_stage"
                                value={formData.lead_stage}
                                onChange={handleChange}
                                options={['New', 'Contacted', 'Qualified', 'Converted', 'Lost']}
                            />
                        </div>
                    </div>

                    {/* LOCATION SECTION */}
                    <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-3 bg-linear-to-b from-blue-600 to-blue-500 rounded-full"></div>

                            <h3 className="text-xs md:text-sm font-medium text-slate-800">Geographic Data</h3>
                        </div>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-2">
                            <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="Pakistan" />
                            <Input label="State / Province" name="state" value={formData.state} onChange={handleChange} placeholder="Sindh" />
                            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Karachi" />
                        </div>
                    </div>

                    {/* Footer - Fixed Button Style */}
                    <div className="flex justify-end items-center gap-2 md:gap-3 pt-2 border-t border-slate-100 mt-2">
                        <button type="button" onClick={onClose} className="text-[10px] md:text-xs font-semibold uppercase text-slate-600 rounded-md cursor-pointer px-3 md:px-4 py-1.5 md:py-2 hover:bg-slate-100 hover:text-slate-800 tracking-widest transition-all">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-linear-to-r from-[#5FC8DB] to-[#5FC8DB]/80 hover:from-[#5FC8DB]/90 hover:to-[#5FC8DB]/70 text-white px-3 md:px-4 cursor-pointer py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold uppercase tracking-widest shadow-lg shadow-[#5FC8DB]/30 hover:shadow-[#5FC8DB]/40 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                            {isLoading ? <FaFilesPinwheel className="animate-spin" /> : "Authorize & Sync"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* Redesigned Input Components for better visibility */
const Input = ({ label, ...props }) => (
    <div className="group space-y-0.5">
        <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 transition-colors group-focus-within:text-[#5FC8DB]">
            {label}
        </label>
        <input
            {...props}
            className="w-full bg-white border border-slate-200 rounded-md px-2.5 md:px-3 py-1.5 md:py-2 text-slate-900 text-xs md:text-xs font-normal placeholder-slate-350 outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 transition-all hover:border-slate-300"
        />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="group space-y-0.5">
        <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 uppercase tracking-widest transition-colors group-focus-within:text-[#5FC8DB]">
            {label}
        </label>
        <div className="relative">
            <select
                {...props}
                className="w-full bg-white border border-slate-200 rounded-md px-2.5 md:px-3 py-1.5 md:py-2 text-slate-900 text-xs md:text-xs font-normal outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 appearance-none cursor-pointer transition-all hover:border-slate-300"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#5FC8DB] transition-colors">
                <FiChevronDown size={14} />
            </div>
        </div>
    </div>
);

export default AddClientFormModal;