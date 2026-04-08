import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { toast } from "sonner";
import StaffPageLayout from "./StaffPageLayout";
import { useStaffBooking } from "@/hooks/useStaffBooking";
import { authApi } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function StaffProfilePage() {
  const { session } = useStaffBooking();
  const { setSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(session?.user.fullName ?? "");
  const [phone, setPhone] = useState(session?.user.phone ?? "");
  const [gender, setGender] = useState(session?.user.gender ?? "");

  if (!session) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !phone.trim() || !gender.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await authApi.updateProfile(session.token, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
      });

      setSession({
        ...session,
        user: {
          ...session.user,
          fullName: updated.fullName,
          phone: updated.phone,
          gender: updated.gender,
        },
      });

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(session.user.fullName);
    setPhone(session.user.phone);
    setGender(session.user.gender);
    setIsEditing(false);
  };

  return (
    <StaffPageLayout
      title="Profile"
      subtitle="Staff Booking Operations"
    >
      <div className="flex min-h-full flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Profile
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Keep your staff profile details current and accurate.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Account</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Active</div>
            <div className="mt-2 text-sm text-slate-500">Staff access enabled</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Verification</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Complete</div>
            <div className="mt-2 text-sm text-slate-500">Email confirmed</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Role</div>
            <div className="mt-3 font-display text-4xl font-semibold text-slate-900">Staff</div>
            <div className="mt-2 text-sm text-slate-500">Current dashboard access</div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">Profile summary</div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 transition hover:bg-blue-100"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>Email: {session.user.email}</div>
              <div>Name: {session.user.fullName}</div>
              <div>Phone: {session.user.phone}</div>
              <div>Gender: {session.user.gender}</div>
              <div>Role: {session.user.role}</div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Account status</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">JWT secured session with booking access enabled.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Quick settings</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">This area can later hold profile settings and preferences.</p>
          </article>
        </section>

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-slate-500 transition hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-4">
                <label>
                  <span className="mb-2 block text-sm text-slate-600">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                    placeholder="Enter your full name"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-600">Phone</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                    placeholder="Enter your phone number"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-600">Gender</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-300"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffPageLayout>
  );
}
