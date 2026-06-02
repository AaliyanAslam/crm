"use client"
import AddClientFormModal from '@/app/component/client-component/AddClientFormModel';
import ClientsDataTable from '@/app/component/client-component/ClientsDataTable';
import React, { useState } from 'react'
import { inter } from '@/app/fonts';

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={`min-h-screen bg-[#f7f7f7] ${inter.className} pb-10 sm:pb-14 md:pb-20`}>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">

          {/* Left Side: Text Content */}
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black/70 tracking-tight leading-tight">
              <span className="hidden sm:inline">Devskarnel Customer Relation Management</span>
              <span className="sm:hidden">Devskarnel CRM</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-gray-500 mt-1">
              View and manage your agency's client database
            </p>
          </div>

          {/* Right Side: Button */}
          <button
            onClick={openModal}
            className="w-full sm:w-auto cursor-pointer group flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all hover:bg-gray-800 active:scale-95 shadow-md shrink-0"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span className="whitespace-nowrap">Create Client</span>
          </button>
        </div>
      </header>

      <main className="max-w-425 mx-auto px-3 sm:px-5 md:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8">

        {/* Table Container */}
        <div className="bg-white  rounded-xl overflow-hidden p-2 sm:p-3 md:p-4">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Recent Clients</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full sm:w-56 text-xs sm:text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <ClientsDataTable />
        </div>
      </main>

      {/* Modal Component */}
      <div className='model-post'>
        <AddClientFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  )
}

const StatCard = ({ label, count, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline gap-2 mt-2">
      <h4 className="text-3xl font-bold text-gray-900">{count}</h4>
      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
  </div>
);

export default Page