import React from 'react';
import { cookies } from "next/headers";
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import { ShieldAlert, LogOut, Database, FormInput, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { loginAdmin, logoutAdmin } from './actions';
import { formatDistanceToNow } from 'date-fns';

export default async function Admin69Page({ searchParams }: { searchParams: { error?: string } }) {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get("admin69_session")?.value === "authenticated";

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-6 animate-in fade-in zoom-in duration-500">
                <div className="glass p-12 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.1)] w-full">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
                        <ShieldAlert className="w-10 h-10 text-purple-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Superadmin Access</h1>
                    <p className="text-muted-foreground">Enter passkey to manage all forms.</p>
                    
                    {searchParams?.error === 'invalid' && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                            Invalid passkey. Please try again.
                        </div>
                    )}

                    <form action={loginAdmin} className="space-y-4">
                        <input 
                            type="password" 
                            name="passkey" 
                            placeholder="Enter Passkey" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                            required
                        />
                        <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3">
                            Authenticate
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    await dbConnect();
    const forms = await Form.find().sort({ createdAt: -1 }).lean();

    return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                        <Database className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">All Forms</h1>
                        <p className="text-sm text-muted-foreground">Superadmin overview of all created forms</p>
                    </div>
                </div>
                <form action={logoutAdmin}>
                    <Button type="submit" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                        <LogOut className="w-4 h-4" />
                        Exit Superadmin
                    </Button>
                </form>
            </div>

            <div className="glass rounded-[2rem] border-white/5 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Form Title
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Creator ID
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Created
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {forms.map((form: any) => (
                                <tr key={form._id.toString()} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <FormInput className="w-4 h-4 text-purple-400" />
                                            <span className="text-white font-medium">{form.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {form.userId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${form.settings?.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {form.settings?.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin69/responses/${form._id.toString()}`}>
                                            <Button variant="ghost" size="sm" className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 gap-2">
                                                <Eye className="w-4 h-4" />
                                                View Responses
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
