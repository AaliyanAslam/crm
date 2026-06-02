"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { inter } from '@/app/fonts';
import { FiUser, FiMail, FiGlobe, FiBriefcase, FiAlertCircle, FiX } from "react-icons/fi";

const AddProjectFormModal = ({ isOpen, onClose, onSuccess }) => {
    const [clients, setClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        client_id: '',
        project_name: '',
        description: '',
        status: 'Planning',
        budget: '',
        start_date: '',
        deadline: '',
        priority: 'Medium',
        logo_url: ''
    });

    const selectedClient = useMemo(() => {
        return clients.find(c => c.client_id === parseInt(formData.client_id));
    }, [formData.client_id, clients]);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/client')
                .then(res => res.json())
                .then(data => setClients(Array.isArray(data) ? data : data.data || []))
                .catch(err => console.error("Error:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    client_id: parseInt(formData.client_id),
                    budget: parseFloat(formData.budget) || 0
                }),
            });
            if (res.ok) {
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${inter.className}`}>
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row border border-slate-200/80">

                {/* LEFT SIDE: Form */}
                <div className="flex-[1.5] p-3 md:p-5 overflow-y-auto border-r border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight">New Project</h2>
                        </div>
                        <button onClick={onClose} className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 transition-colors"><FiX size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="sm:col-span-2">
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Assign Client</label>
                                <select name="client_id" value={formData.client_id} onChange={handleChange} required className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 outline-none transition-all appearance-none cursor-pointer text-xs md:text-xs hover:border-slate-300">
                                    <option value="">Choose Client</option>
                                    {clients.map(client => (
                                        <option className='rounded' key={client.client_id} value={client.client_id}>{client.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Project Name</label>
                                <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required placeholder="Enter project title" className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 placeholder:text-slate-350 text-xs md:text-xs transition-all hover:border-slate-300" />
                            </div>

                            <div>
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Budget ($)</label>
                                <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="0.00" className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 text-xs md:text-xs transition-all hover:border-slate-300" />
                            </div>

                            <div>
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Priority Level</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 cursor-pointer text-xs md:text-xs transition-all hover:border-slate-300 appearance-none">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Start Date</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 text-xs md:text-xs transition-all hover:border-slate-300" />
                            </div>

                            <div>
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Deadline</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 text-xs md:text-xs transition-all hover:border-slate-300" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Brief Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 resize-none text-xs md:text-xs transition-all hover:border-slate-300" placeholder="Outline project scope..."></textarea>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Logo URL</label>
                                <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-4 focus:ring-[#5FC8DB]/20 text-xs md:text-xs transition-all hover:border-slate-300" placeholder="Enter logo URL..." />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md font-semibold text-[10px] md:text-xs tracking-widest hover:bg-slate-50 transition-all text-slate-700">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-1.5 md:py-2 bg-linear-to-r from-[#5FC8DB] to-[#5FC8DB]/80 hover:from-[#5FC8DB]/90 hover:to-[#5FC8DB]/70 text-white rounded-md font-semibold text-[10px] md:text-xs tracking-widest shadow-lg shadow-[#5FC8DB]/30 hover:shadow-[#5FC8DB]/40 transition-all active:scale-95 disabled:opacity-30">
                                {isSubmitting ? 'Syncing...' : 'Save Project'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT SIDE: Client Context */}
                <div className="flex-1 bg-linear-to-br from-[#5FC8DB]/10 to-[#5FC8DB]/5 p-3 md:p-5 flex flex-col order-first md:order-last border-l border-slate-100">
                    <div className="hidden md:flex justify-end mb-4">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><FiX size={20} /></button>
                    </div>

                    <div className="space-y-4 h-full">
                        <p className="text-[0.65rem] md:text-[0.75rem] font-medium text-slate-600 uppercase tracking-widest">Client Information</p>

                        {selectedClient ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[#5FC8DB] text-white rounded-md flex items-center justify-center text-sm font-semibold">
                                        {selectedClient.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm md:text-base font-semibold text-slate-900 leading-none">{selectedClient.full_name}</h4>
                                        <p className="text-[0.65rem] md:text-[0.75rem] text-slate-600 font-normal tracking-widest mt-0.5">{selectedClient.company_name || 'Individual'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <DetailItem icon={<FiMail />} label="Email Address" value={selectedClient.email} />
                                    <DetailItem icon={<FiGlobe />} label="Location" value={`${selectedClient.city}, ${selectedClient.country}`} />
                                    <DetailItem icon={<FiBriefcase />} label="Website" value={selectedClient.website_url || 'None'} isLink />
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                <FiUser size={32} className="mb-2 text-slate-400" />
                                <p className="text-[0.65rem] md:text-[0.75rem] font-medium text-slate-600">No Client Selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, isLink }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5 text-[#5FC8DB] shrink-0 opacity-60">{icon}</div>
        <div className="min-w-0">
            <p className="text-[0.65rem] md:text-[0.75rem] font-medium text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
            {isLink && value !== 'None' ? (
                <a href={value} target="_blank" className="text-xs font-normal text-[#5FC8DB] hover:underline break-all">{value}</a>
            ) : (
                <p className="text-xs font-normal text-slate-800">{value}</p>
            )}
        </div>
    </div>
);

export default AddProjectFormModal;