"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { inter } from '@/app/fonts';
import {
  FiMail, FiPhone, FiGlobe, FiMapPin,
  FiPlus, FiArrowUpRight, FiClock, FiArrowLeft, FiTrash2
} from "react-icons/fi";
import { useParams, useRouter } from 'next/navigation';
import AddClientNotesModal from '@/app/component/client-component/AddClientNotesModel';
import useSWR from 'swr';

const UI = {
  text: {
    title: 'text-[#65D1E5]  tracking-tighter',
    label: 'text-[10px]  uppercase tracking-wider text-slate-400',
    value: 'text-sm font-semibold text-slate-800',
  },
  btn: {
    primary: 'bg-[#65D1E5] hover:bg-[#57CAD9] text-white shadow-md transition-all active:scale-95',
    secondary: 'border border-slate-200 hover:border-black text-slate-600 hover:text-black transition-all',
  },
  card: 'bg-white border border-slate-100 rounded-xl overflow-hidden'
};

const fetcher = (url) => fetch(url).then(res => res.json());

const ClientProfile = () => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [buttonPosition, setButtonPosition] = useState(null);

  const { id } = useParams();
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/client/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const handleOpenNoteMenu = (note, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right,
    });
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleCloseNoteMenu = () => {
    setIsNoteModalOpen(false);
    setSelectedNote(null);
    setButtonPosition(null);
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      const response = await fetch(`/api/notes/${selectedNote.note_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        mutate();
        handleCloseNoteMenu();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  useEffect(() => {
    if (isNoteModalOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isNoteModalOpen]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50  text-[10px] uppercase tracking-widest text-slate-400">Syncing...</div>;

  // Handle 404 or Error State
  if (error || !data) return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center ${inter.className}`}>
      <h2 className="text-2xl  text-slate-900 uppercase tracking-tighter mb-2">{error?.message || "No Record"}</h2>
      <p className="text-slate-400 text-xs  uppercase tracking-widest mb-6">The requested client ID does not exist in our system.</p>
      <button
        onClick={() => router.push('/clients')}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px]  uppercase tracking-widest rounded-xl transition-transform active:scale-95"
      >
        <FiArrowLeft /> Return to Pipeline
      </button>
    </div>
  );

  const { client, notes } = data;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-10 ${inter.className}`}>
      <div className="max-w-5xl mx-auto">

        {/* ACTION BAR */}
        <div className="bg-white p-4 rounded-lg flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#65D1E5] shrink-0 overflow-hidden  bg-slate-100">
              <img src={client.profile_image_url || (
                client.gender === "Male" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
                  : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png"
              )} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h1 className={`text-xl ${UI.text.title}`}>{client.full_name}</h1>
              <span className='text-[12px]'>
                Deal:

              </span>
              <span className="text-[10px]  px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded uppercase tracking-tighter border border-emerald-100">
                {client.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddNoteOpen(true)}
              className={`${UI.btn.primary} px-4 py-2 rounded-lg text-xs flex items-center gap-2`}
            >
              <FiPlus /> New Note
            </button>
          </div>
        </div>

        <AddClientNotesModal
          clientId={id}
          isOpen={isAddNoteOpen}
          onClose={() => setIsAddNoteOpen(false)}
          onSuccess={() => mutate()}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className={` ${UI.card} p-5`}>
              <h2 className={`${UI.text.label} mb-4 flex items-center justify-between`}>
                Contact Points <FiArrowUpRight className="opacity-30" />
              </h2>
              <div className="space-y-4">
                <IconData icon={<FiMail />} label="Email" value={client.email} />
                <IconData icon={<FiPhone />} label="Mobile" value={client.phone_number} />
                <IconData icon={<FiGlobe />} label="Website" value={client.website_url} isLink />
                <IconData icon={<FiMapPin />} label="Region" value={`${client.city}, ${client.country}`} />
              </div>
            </div>

            <div className={` ${UI.card} p-5 bg-emerald-950`}>
              <h2 className="text-[10px]  uppercase tracking-widest text-emerald-500 mb-3">Lifecycle</h2>
              <p className="text-sm font-medium text-black/80 leading-relaxed">
                Stage: <span className="text-[#65D1E5] ">{client.lead_stage}</span>.
                <br />
                Source: <span className="text-black ">{client.lead_source || "Organic"}</span>.
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className={` ${UI.card} h-full`}>
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0">
                <h2 className={UI.text.label}>Activity Timeline</h2>
                <span className="text-[10px] font-mono text-slate-300">Total Entries: {notes.length}</span>
              </div>

              <div className="p-6">
                {notes.length > 0 ? (
                  <div className="space-y-6">
                    {notes.map((n) => (
                      <div key={n.note_id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1 before:w-0.5 before:h-full before:bg-slate-100 last:before:h-4">
                        <div className="absolute left-0.75 top-1 w-2 h-2 rounded-full bg-[#65D1E5] ring-4 ring-white" />
                        <div className="mb-1 text-[10px] text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                          <FiClock size={10} /> {new Date(n.created_at).toLocaleDateString()}
                        </div>
                        <div className="relative group">
                          <p className="text-sm bg-gray-100/50 py-3 px-3 rounded-lg text-slate-700 leading-relaxed font-medium pr-10">
                            {n.note}
                          </p>
                          <button
                            onClick={(e) => handleOpenNoteMenu(n, e)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 py-1 px-2 rounded text-sm"
                          >
                            ...
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-xs text-slate-300 uppercase tracking-widest">No entries yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Note Actions Modal */}
        <NoteMenu
          isOpen={isNoteModalOpen}
          note={selectedNote}
          position={buttonPosition}
          onClose={handleCloseNoteMenu}
          onDelete={handleDeleteNote}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/* COMPONENTS */
/* ─────────────────────────────────────────────────────────────────── */

const NoteMenu = ({ isOpen, note, position, onClose, onDelete }) => {
  if (!isOpen || !note || !position) return null;

  return (
    <>
      {/* Backdrop to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div
        className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-1 w-32"
        style={{
          left: `${position.left}px`,
          top: `${position.bottom + 8}px`,
        }}
      >
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
        >
          <FiTrash2 size={12} />
          Delete Note
        </button>
      </div>
    </>
  );
};

const IconData = ({ icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-[#65D1E5]">{icon}</div>
    <div className="min-w-0">
      <p className={UI.text.label}>{label}</p>
      {isLink ? (
        <a href={value} target="_blank" className="text-xs  text-slate-900 hover:text-[#65D1E5] truncate block transition-colors">
          {value?.replace(/(^\w+:|^)\/\//, '')}
        </a>
      ) : (
        <p className="text-xs  text-slate-800 truncate">{value || '—'}</p>
      )}
    </div>
  </div>
);

export default ClientProfile;

