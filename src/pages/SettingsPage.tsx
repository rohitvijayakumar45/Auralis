import { useState } from "react";
import { 
  UserRound, HardDrive, Palette, Settings, Shield, Info, 
  LogOut, KeyRound, Download, Trash2, CheckCircle2 
} from "lucide-react";
import { 
  useCurrentUser, useDashboardStats, useSettings, useUpdateSettings 
} from "../hooks/usePhotoData";
import { useServices } from "../hooks/useServices";
import { ModalOverlay } from "./AlbumsPage";

export function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10 pb-32">
      <section className="rounded-[2.5rem] bg-grain-wash p-8 shadow-soft md:p-12 mb-8">
        <Settings className="h-9 w-9 text-olive" />
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
          Account & Preferences
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-charcoal/62">
          Manage your personal data, privacy, and application settings.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <AccountCard />
          <StorageCard />
          <AppearanceCard />
        </div>
        <div className="flex flex-col gap-8">
          <ApplicationCard />
          <PrivacySecurityCard />
          <AboutCard />
        </div>
      </div>
    </div>
  );
}

function AccountCard() {
  const { data: user } = useCurrentUser();
  const services = useServices();

  if (!user) return <CardPlaceholder />;

  const initials = user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";

  return (
    <section className="rounded-[2rem] bg-bone p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <UserRound className="h-6 w-6 text-charcoal/40" />
        <h2 className="font-serif text-2xl font-semibold">Account</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-charcoal/10 pb-6 mb-6">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover shadow-soft" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-linen flex items-center justify-center text-2xl font-serif text-charcoal/60 shadow-soft">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-charcoal">{user.name}</h3>
          <p className="text-sm text-charcoal/60 mt-1">{user.email}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-semibold text-olive">Premium Plan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Username</p>
          <p className="mt-1 font-medium text-charcoal">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Member Since</p>
          <p className="mt-1 font-medium text-charcoal">Not Available</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button disabled className="flex items-center justify-center gap-2 rounded-full border border-charcoal/10 bg-ivory px-6 py-3 font-semibold text-charcoal/40 transition">
          <KeyRound className="h-4 w-4" />
          Change Password (Coming Soon)
        </button>
        <button 
          onClick={() => services.auth.logout()}
          className="flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 font-semibold text-bone transition hover:scale-105"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </section>
  );
}

function StorageCard() {
  const { data: user } = useCurrentUser();
  const { data: stats } = useDashboardStats();

  if (!user || !stats) return <CardPlaceholder />;

  const percentUsed = Math.min(100, (user.storageUsedGb / user.storageLimitGb) * 100);

  return (
    <section className="rounded-[2rem] bg-charcoal p-8 shadow-soft text-bone">
      <div className="flex items-center gap-4 mb-8">
        <HardDrive className="h-6 w-6 text-bone/40" />
        <h2 className="font-serif text-2xl font-semibold">Storage</h2>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <p className="text-3xl font-semibold leading-none">{user.storageUsedGb.toFixed(2)} <span className="text-xl font-normal text-bone/60">GB</span></p>
          <p className="text-sm font-medium text-bone/60">of {user.storageLimitGb.toFixed(0)} GB total</p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-bone/20 relative">
          <div 
            className="absolute left-0 top-0 bottom-0 rounded-full bg-olive transition-all duration-1000 ease-out" 
            style={{ width: `${percentUsed}%` }} 
          />
        </div>
        <p className="mt-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
          {(user.storageLimitGb - user.storageUsedGb).toFixed(2)} GB Remaining
        </p>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-bone/40">Photos</p>
          <p className="mt-1 text-xl font-medium">{stats.photoCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-bone/40">Albums</p>
          <p className="mt-1 text-xl font-medium">{stats.albumCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-bone/40">Favorites</p>
          <p className="mt-1 text-xl font-medium">{stats.favoriteCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-bone/40">Largest Album</p>
          <p className="mt-1 text-xl font-medium text-bone/40">Not Enabled</p>
        </div>
      </div>
    </section>
  );
}

function AppearanceCard() {
  const { data: rawSettings } = useSettings();
  const updateSettings = useUpdateSettings();

  if (!rawSettings) return <CardPlaceholder />;
  const settings = rawSettings as Record<string, string>;

  return (
    <section className="rounded-[2rem] bg-bone p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Palette className="h-6 w-6 text-charcoal/40" />
        <h2 className="font-serif text-2xl font-semibold">Appearance</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Theme</label>
          <select 
            value={settings.theme} 
            onChange={e => updateSettings.mutate({ theme: e.target.value })}
            className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-olive"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Gallery Density</label>
          <select 
            value={settings.galleryDensity} 
            onChange={e => updateSettings.mutate({ galleryDensity: e.target.value })}
            className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-olive"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Sort Order</label>
          <select 
            value={settings.sortOrder} 
            onChange={e => updateSettings.mutate({ sortOrder: e.target.value })}
            className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-olive"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Accent Color</label>
          <div className="flex gap-3">
            <button className="h-10 w-10 rounded-full bg-olive ring-2 ring-offset-2 ring-charcoal/10"></button>
            <button disabled className="h-10 w-10 rounded-full bg-charcoal/10 flex items-center justify-center cursor-not-allowed">
              <span className="sr-only">Coming Soon</span>
            </button>
            <button disabled className="h-10 w-10 rounded-full bg-charcoal/10 flex items-center justify-center cursor-not-allowed">
              <span className="sr-only">Coming Soon</span>
            </button>
            <button disabled className="h-10 w-10 rounded-full bg-charcoal/10 flex items-center justify-center cursor-not-allowed">
              <span className="sr-only">Coming Soon</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-charcoal/40">Custom colors coming soon.</p>
        </div>
      </div>
    </section>
  );
}

function ApplicationCard() {
  const toggles = [
    { id: "reduced-motion", label: "Reduced Motion", description: "Disable decorative animations." },
    { id: "thumb-quality", label: "Thumbnail Quality", description: "High-res gallery previews." },
    { id: "upload-quality", label: "Original Upload Quality", description: "Never compress uploads." },
    { id: "auto-play", label: "Auto Play Videos", description: "Automatically play live photos/videos." },
    { id: "parallel-uploads", label: "Parallel Uploads", description: "Upload up to 6 files concurrently." },
    { id: "lazy-load", label: "Aggressive Lazy Loading", description: "Conserve bandwidth on mobile." }
  ];

  return (
    <section className="rounded-[2rem] bg-bone p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Settings className="h-6 w-6 text-charcoal/40" />
        <h2 className="font-serif text-2xl font-semibold">Application</h2>
      </div>

      <div className="space-y-6">
        {toggles.map(t => (
          <div key={t.id} className="flex items-center justify-between gap-4 border-b border-charcoal/5 pb-6 last:border-0 last:pb-0">
            <div>
              <p className="font-medium text-charcoal">{t.label}</p>
              <p className="text-sm text-charcoal/60 mt-0.5">{t.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/30">Coming Soon</span>
              <div className="h-6 w-11 rounded-full bg-charcoal/10 relative opacity-50 cursor-not-allowed">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-bone" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrivacySecurityCard() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <section className="rounded-[2rem] bg-bone p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Shield className="h-6 w-6 text-charcoal/40" />
        <h2 className="font-serif text-2xl font-semibold">Privacy & Security</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <div className="col-span-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Authentication Provider</p>
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-olive" />
            <p className="font-medium text-charcoal">Signed in with Amazon Cognito</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Current Session</p>
          <p className="mt-1 font-medium text-charcoal">Active Desktop Session</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Last Login</p>
          <p className="mt-1 font-medium text-charcoal">Today</p>
        </div>
        
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Email Verified</p>
          <p className="mt-1 font-medium text-charcoal/40">Not Enabled</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Two-Factor Authentication</p>
          <p className="mt-1 font-medium text-charcoal/40">Not Enabled</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-charcoal/10">
        <button disabled className="flex flex-1 items-center justify-center gap-2 rounded-full border border-charcoal/10 bg-ivory px-6 py-3 font-semibold text-charcoal/40 transition">
          <Download className="h-4 w-4" />
          Download Data
        </button>
        <button 
          onClick={() => setDeleteOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 text-red-600 px-6 py-3 font-semibold transition hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>

      {deleteOpen && (
        <ModalOverlay onClose={() => setDeleteOpen(false)}>
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-red-600">Delete Account?</h2>
              <p className="mt-2 leading-relaxed text-charcoal/70">
                Are you absolutely sure you want to delete your account? This action cannot be undone, and all of your photos and albums will be permanently erased.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="rounded-full px-6 py-3 font-semibold text-charcoal/60 hover:bg-charcoal/5"
              >
                Cancel
              </button>
              <button
                disabled
                className="rounded-full bg-red-600 px-6 py-3 font-semibold text-bone opacity-50 cursor-not-allowed"
              >
                Deletion Currently Disabled
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </section>
  );
}

function AboutCard() {
  const systems = [
    { label: "Database", status: "Healthy" },
    { label: "Storage", status: "Healthy" },
    { label: "Thumbnail Service", status: "Healthy" },
    { label: "Authentication", status: "Healthy" }
  ];

  return (
    <section className="rounded-[2rem] bg-bone p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Info className="h-6 w-6 text-charcoal/40" />
        <h2 className="font-serif text-2xl font-semibold">About Auralis</h2>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xl font-semibold">Version 0.1.0</p>
          <p className="text-sm text-charcoal/60 mt-1">Beta Release</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory shadow-soft">
          <div className="h-6 w-6 rounded-sm border-2 border-charcoal bg-charcoal/10" />
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-4">Backend Status</p>
      <div className="space-y-3">
        {systems.map(sys => (
          <div key={sys.label} className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal/80">{sys.label}</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-olive animate-pulse" />
              <span className="text-xs font-semibold text-olive uppercase tracking-wider">{sys.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CardPlaceholder() {
  return (
    <div className="h-64 rounded-[2rem] bg-bone shadow-soft animate-pulse p-8">
      <div className="h-8 w-1/3 bg-linen rounded-xl mb-6" />
      <div className="h-32 w-full bg-linen rounded-2xl" />
    </div>
  );
}
