"use client"
import { hachiMaruPop, inter } from '@/app/fonts'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import Image from 'next/image'

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Login Successful!")
                window.location.href = '/dashboard'
            } else {
                toast.error(data.message || "Invalid credentials")
            }
        } catch (error) {
            toast.error("Something went wrong!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`min-h-screen bg-[#F3F5F7] flex items-center justify-center p-4 select-none ${inter?.className}`}>
            <div className="bg-[#ffffff] w-full max-w-95 rounded-2xl p-8">

                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className=" rounded-sm flex items-center justify-center">
                            <Image src="/logo/dklogo.png" alt="Logo" width={24} height={24} />
                        </div>
                        <span className={`text-2xl ${hachiMaruPop.className} text-gray-900`}>
                            evskarnel
                        </span>
                    </div>
                    <h1 className="text-[17px] font-bold text-gray-900 text-center leading-snug mb-1.5">
                        Built by Collectors, Designed for Artists
                    </h1>
                    <p className="text-[13px] text-gray-500 text-center leading-relaxed">
                        Sign in to your dashboard and take charge of your bookings,
                        clients, and schedule today
                    </p>
                </div>

                {/* Social Buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        disabled={true}
                        type="button"
                        className="flex-1 cursor-not-allowed opacity-30 flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-sm text-xs font-medium transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Log In with Google
                    </button>
                    <button
                        type="button"
                        className="flex-1 cursor-not-allowed opacity-30 flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-sm text-xs font-medium transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.18 4.97z" />
                        </svg>
                        Log In with Apple
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">or continue with email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
                        <div className="relative flex items-center">
                            <svg
                                className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m2 7 10 7 10-7" />
                            </svg>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="Enter your email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-gray-200 focus:outline-none focus:border-[#54C7D7] focus:ring-2 focus:ring-[#54C7D7]/10 text-sm placeholder:text-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
                        <div className="relative flex items-center">
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                                className="w-full pl-4 pr-10 py-2.5 rounded-sm border border-gray-200 focus:outline-none focus:border-[#54C7D7] focus:ring-2 focus:ring-[#54C7D7]/10 text-sm placeholder:text-gray-400 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <a href="#" className="text-xs text-gray-700 hover:text-[#54C7D7] transition-colors">
                            Forgot your password?
                        </a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-sm bg-gray-900 text-white text-sm font-semibold hover:bg-[#54C7D7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Sign Up"}
                    </button>

                    <p className="text-center text-xs text-gray-500 pt-1">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-gray-900 font-semibold hover:text-[#54C7D7] transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default LoginPage