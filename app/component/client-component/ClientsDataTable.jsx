"use client"
import React, { useMemo, useState } from 'react'
import {
    Table, TableBody, TableCaption, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { inter } from '@/app/fonts';
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'sonner';

const fetcher = (url) => fetch(url).then((res) => res.json());
const getClientAvatar = (client) =>
    client?.profile_image_url ||
    (client?.gender === "Male"
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
        : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png");

const ClientsDataTable = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const router = useRouter();

    const { data, mutate } = useSWR('/api/client', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    const clientsData = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.data || [];
    }, [data]);

    const handleEditClick = (client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (client) => {
        try {
            setSelectedClient(client);
            const confirmed = confirm("Are you sure you want to delete this client?");
            if (!confirmed) return;
            const res = await fetch(`/api/client/${client.client_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                await mutate();
                setSelectedClient(null);
                toast.success("Client deleted successfully!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateChange = (e) => {
        setSelectedClient({ ...selectedClient, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/client/${selectedClient.client_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedClient),
            });
            if (res.ok) {
                await mutate();
                setIsEditModalOpen(false);
                toast.success("Client updated successfully!");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-50 text-green-600 border-green-100';
            case 'Closed': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        }
    };

    return (
        <>
            <div className="w-full rounded-xl  bg-white p-1.5">
                <div className="overflow-x-auto">
                    <Table className={`${inter.className} min-w-225 text-xs`}>
                        <TableCaption className="text-[11px] text-gray-400 pt-2">
                            A comprehensive list of your agency clients.
                        </TableCaption>
                        <TableHeader className="bg-gray-50/60">
                            <TableRow>
                                <TableHead className="w-16 px-2 py-2 text-[10px] text-gray-500">ID</TableHead>
                                <TableHead className="text-[10px] font-semibold text-gray-600 py-2">Client & Company</TableHead>
                                <TableHead className="text-[10px] text-gray-500 py-2">Contact Info</TableHead>
                                <TableHead className="text-[10px] text-gray-500 py-2">Location</TableHead>
                                <TableHead className="text-[10px] text-gray-500 py-2">Status</TableHead>
                                <TableHead className="text-[10px] text-gray-500 py-2">Website</TableHead>
                                <TableHead className="text-right text-[10px] text-gray-500 py-2">Joined</TableHead>
                                <TableHead className="text-right text-[10px] text-gray-500 py-2">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientsData.map((client) => (
                                <TableRow key={client.client_id} className="border-none hover:bg-gray-50/60 transition-colors">
                                    <TableCell className="text-gray-400 text-[11px] px-2 py-1.5">{client.client_id}</TableCell>
                                    <TableCell className="py-1.5">
                                        <div
                                            className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer px-1.5 py-1.5 rounded-lg transition-colors"
                                            onClick={() => router.push(`/client/${client.client_id}`)}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#d9fff6] border border-[#d9fff6] flex items-center justify-center overflow-hidden shrink-0">
                                                <img
                                                    src={getClientAvatar(client)}
                                                    height={100} width={100}
                                                    alt="Client"
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-[11px] leading-none mb-0.5">
                                                    {client.full_name}
                                                </span>
                                                <span className="text-[10px] text-gray-400 leading-none">
                                                    {client.company_name || 'No Company'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                        <div className="flex flex-col text-[11px] space-y-0.5">
                                            <span className="text-gray-600">{client.email}</span>
                                            <span className="text-gray-400">{client.phone_number || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                        <div className="text-[11px]">
                                            <span className="text-gray-600">{client.city}, {client.country}</span>
                                            <p className="text-gray-400 text-[10px]">{client.state}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyles(client.status)}`}>
                                            {client.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                        {client.website_url
                                            ? <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[11px]">Visit</a>
                                            : <span className="text-gray-300 text-[11px]">—</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right text-[11px] text-gray-400 py-1.5">
                                        {new Date(client.created_at).toLocaleDateString('en-GB')}
                                    </TableCell>
                                    <TableCell className="text-right py-1.5">
                                        <div className="flex justify-end gap-1">
                                            <div
                                                onClick={() => handleEditClick(client)}
                                                className="inline-flex hover:bg-blue-500 p-1 active:scale-95 rounded hover:text-white text-gray-400 cursor-pointer duration-200"
                                            >
                                                <GrEdit size={12} />
                                            </div>
                                            <div
                                                onClick={() => handleDeleteClick(client)}
                                                className="inline-flex hover:bg-red-500 p-1 active:scale-95 rounded hover:text-white text-gray-400 cursor-pointer duration-200"
                                            >
                                                <MdOutlineDeleteOutline size={13} />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* EDIT MODAL */}
            {isEditModalOpen && selectedClient && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh]">
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Edit Client</h2>
                                <p className="text-[10px] text-gray-400">Update details for {selectedClient.full_name}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ModalInput label="Full Name"   name="full_name"    value={selectedClient.full_name}    onChange={handleUpdateChange} />
                                <ModalInput label="Email"       name="email"        type="email" value={selectedClient.email}  onChange={handleUpdateChange} />
                                <ModalSelect label="Gender"     name="gender"       value={selectedClient.gender}       onChange={handleUpdateChange} options={['Male', 'Female', 'Other']} />
                                <ModalSelect label="Status"     name="status"       value={selectedClient.status}       onChange={handleUpdateChange} options={['Pending', 'Active', 'Closed']} />
                                <ModalInput label="Phone"       name="phone_number" value={selectedClient.phone_number} onChange={handleUpdateChange} />
                                <ModalInput label="Company"     name="company_name" value={selectedClient.company_name} onChange={handleUpdateChange} />
                                <ModalInput label="Website"     name="website_url"  value={selectedClient.website_url}  onChange={handleUpdateChange} />
                                <ModalInput label="Country"     name="country"      value={selectedClient.country}      onChange={handleUpdateChange} />
                                <ModalInput label="State"       name="state"        value={selectedClient.state}        onChange={handleUpdateChange} />
                                <ModalInput label="City"        name="city"         value={selectedClient.city}         onChange={handleUpdateChange} />
                                <ModalInput label="Lead Source" name="lead_source"  value={selectedClient.lead_source}  onChange={handleUpdateChange} />
                                <ModalInput label="Lead Stage"  name="lead_stage"   value={selectedClient.lead_stage}   onChange={handleUpdateChange} />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-xs text-gray-400 hover:text-gray-800">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 transition active:scale-95">
                                    Update Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

/* Modal Helpers */
const ModalInput = ({ label, ...props }) => (
    <div className="space-y-0.5">
        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">{label}</label>
        <input {...props} className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all" />
    </div>
);

const ModalSelect = ({ label, options, ...props }) => (
    <div className="space-y-0.5">
        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">{label}</label>
        <select {...props} className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs outline-none cursor-pointer">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default ClientsDataTable;