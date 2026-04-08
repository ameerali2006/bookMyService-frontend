"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Briefcase,
  Mail,
  Phone,
  DollarSign,
  Award,
  FileText,
  Edit3,
  Eye,
  Download,
  MapPin,
  Image as ImageIcon,
  Loader2,
  KeyRound,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { workerService } from "@/api/WorkerService";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { authService } from "@/api/AuthService";
import { uploadToCloudinary } from "@/lib/cloudinaryService";
import CropImageModal from "@/components/shared/ImageCropModal.";
import { useNavigate } from "react-router-dom";

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  zone: string;
  experience: "0-1" | "2-5" | "6-10" | "10+";
  category: { _id: string; category: string };
  description?: string;
  skills?: string[];
  fees: number;
  isVerified: "pending" | "approved" | "rejected";
  documents?: string;
}
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
const stagger = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.07,
      },
    },
  } as Variants,

  item: {
    initial: { opacity: 0, y: 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },
  } as Variants,
};

const VerificationBadge = ({ status }: { status: Worker["isVerified"] }) => {
  const config = {
    approved: { icon: CheckCircle2, label: "Verified", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending:  { icon: Clock,         label: "Pending",  cls: "bg-amber-50  text-amber-700  border-amber-200"  },
    rejected: { icon: XCircle,       label: "Rejected", cls: "bg-red-50    text-red-700    border-red-200"    },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.cls}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
      <Icon size={14} className="text-gray-500" />
    </div>
    <h3 className="text-sm font-semibold text-gray-800 tracking-tight">{title}</h3>
  </div>
);

const InfoRow = ({ label, value, last = false }: { label: string; value: string; last?: boolean }) => (
  <div className={`flex items-center justify-between py-3 px-6 ${!last ? "border-b border-gray-50" : ""}`}>
    <span className="text-sm text-gray-400 font-medium">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

const WorkerProfilePage: React.FC = () => {
  const [worker, setWorker]       = useState<Worker | null>(null);
  const [loading, setLoading]     = useState(true);
  const [editOpen, setEditOpen]   = useState(false);
  const [formData, setFormData]   = useState<Partial<Worker>>({});
  const [uploading, setUploading] = useState(false);
  const [cropOpen, setCropOpen]   = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState("");

  const workerEmail = useSelector((state: RootState) => state.workerTokenSlice.worker?.email);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (!workerEmail) return;
        const res = await workerService.getProfileDetails();
        setWorker(res.data.worker);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [workerEmail]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleEditClick = () => {
    setFormData({
      name: worker?.name, phone: worker?.phone, zone: worker?.zone,
      fees: worker?.fees, experience: worker?.experience,
      profileImage: worker?.profileImage, description: worker?.description,
      skills: worker?.skills,
    });
    setEditOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setCropOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(croppedFile, "worker-documents");
      setFormData((p) => ({ ...p, profileImage: url }));
      SuccessToast("Profile image updated!");
    } catch { ErrorToast("Failed to upload image"); }
    finally { setUploading(false); setCropOpen(false); setSelectedImage(null); }
  };

  const handleSave = async () => {
    try {
      const res = await workerService.updateProfileDetails(formData);
      SuccessToast("Profile updated successfully");
      setWorker(res.data.worker);
      setEditOpen(false);
    } catch { ErrorToast("Failed to update profile"); }
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills?.includes(skillInput.trim()))
        setFormData((p) => ({ ...p, skills: [...(p.skills || []), skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setFormData((p) => ({ ...p, skills: p.skills?.filter((s) => s !== skill) }));

  /* ─── Loading / empty states ─── */
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading profile…</p>
      </div>
    );

  if (!worker)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-sm text-gray-400">Worker data not found.</p>
      </div>
    );

  /* ─── Main render ─── */
  return (
    <WorkerLayout>
      <Navbar />

      {/* Page background */}
      <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-4">

            {/* ── Hero card ── */}
            <motion.div variants={stagger.item}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Top accent strip */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6">
                  {/* Avatar */}
                  <div className="relative shrink-0 group">
                    {worker.profileImage ? (
                      <img
                        src={worker.profileImage}
                        alt={worker.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                        {getInitials(worker.name)}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900 tracking-tight">{worker.name}</h1>
                      <VerificationBadge status={worker.isVerified} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={13} />
                        {worker.category?.category}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} />
                        {worker.zone}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <DollarSign size={13} />
                        ₹{worker.fees}/visit
                      </span>
                    </div>
                    {worker.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 max-w-lg">
                        {worker.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={handleEditClick}
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 size={13} />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate("/worker/profile/change-password")}
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <KeyRound size={13} />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Two-column grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Personal Info */}
              <motion.div variants={stagger.item}>
                <SectionCard>
                  <SectionHeader icon={User} title="Personal Information" />
                  <InfoRow label="Email" value={worker.email} />
                  <InfoRow label="Phone" value={worker.phone} />
                  <InfoRow label="Zone" value={worker.zone} last />
                </SectionCard>
              </motion.div>

              {/* Professional Info */}
              <motion.div variants={stagger.item}>
                <SectionCard>
                  <SectionHeader icon={Briefcase} title="Professional Details" />
                  <InfoRow label="Category" value={worker.category?.category} />
                  <InfoRow label="Experience" value={`${worker.experience} years`} />
                  <InfoRow label="Service Fee" value={`₹${worker.fees}`} last />
                </SectionCard>
              </motion.div>
            </div>

            {/* ── Skills ── */}
            <motion.div variants={stagger.item}>
              <SectionCard>
                <SectionHeader icon={Sparkles} title="Skills" />
                <div className="px-6 py-4">
                  {worker.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No skills added yet.</p>
                  )}
                </div>
              </SectionCard>
            </motion.div>

            {/* ── Description ── */}
            <motion.div variants={stagger.item}>
              <SectionCard>
                <SectionHeader icon={FileText} title="About" />
                <div className="px-6 py-4">
                  {worker.description ? (
                    <p className="text-sm text-gray-600 leading-relaxed">{worker.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400">No description added yet.</p>
                  )}
                </div>
              </SectionCard>
            </motion.div>

            {/* ── Documents ── */}
            <motion.div variants={stagger.item}>
              <SectionCard>
                <SectionHeader icon={FileText} title="Documents" />
                <div className="px-6 py-4">
                  {worker.documents ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText size={15} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                            {worker.documents.split("/").pop()}
                          </p>
                          <p className="text-xs text-gray-400">PDF document</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(worker.documents!, "_blank")}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => alert("Download not implemented")}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No documents uploaded.</p>
                  )}
                </div>
              </SectionCard>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl bg-white border border-gray-100 shadow-2xl rounded-2xl p-0 overflow-hidden gap-0">
          {/* Modal header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Edit Profile</h2>
              <p className="text-sm text-gray-400 mt-0.5">Update your personal and professional details</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
            {/* Avatar column */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <img
                  src={formData.profileImage || worker?.profileImage || "/placeholder-user.png"}
                  alt="profile"
                  className="w-32 h-32 rounded-2xl object-cover border border-gray-100 shadow-sm"
                />
                <label className="absolute inset-0 bg-gray-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all gap-1">
                  {uploading
                    ? <Loader2 className="animate-spin text-white" size={20} />
                    : <><ImageIcon className="text-white" size={18} /><span className="text-white text-xs font-medium">Change</span></>
                  }
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{formData.name || worker?.name}</p>
                <p className="text-xs text-gray-400">{worker?.email}</p>
              </div>
            </div>

            {/* Fields column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</label>
                  <Input
                    value={formData.experience || ""}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value as any })}
                    className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fees (₹)</label>
                  <Input
                    type="number"
                    value={formData.fees || ""}
                    onChange={(e) => setFormData({ ...formData, fees: Number(e.target.value) })}
                    className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Zone (disabled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zone</label>
                <Input
                  value={formData.zone || ""}
                  disabled
                  className="rounded-xl border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.skills?.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Type a skill and press Enter…"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-300"
                  placeholder="Tell clients about your expertise…"
                />
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
            <button
              onClick={() => setEditOpen(false)}
              className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <><Loader2 className="animate-spin" size={14} /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <CropImageModal
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </WorkerLayout>
  );
};

export default WorkerProfilePage;