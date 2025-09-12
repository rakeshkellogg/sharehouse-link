
import { Zap, Share2, Users, MessageCircle, List } from "lucide-react";
import { Link } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import AdminButton from "@/components/AdminButton";
import InstallAppButton from "@/components/InstallAppButton";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="font-extrabold tracking-tight text-lg">
              <span className="text-slate-900">LIST</span>
              <span className="text-teal-700">AND</span>
              <span className="text-slate-900">SHARE</span>
            </Link>

            <div className="flex items-center gap-2">
              <InstallAppButton />
              
              {user && (
                <Link to="/my-listings">
                  <button className="hidden sm:inline-flex items-center rounded-md bg-slate-100 px-3 py-2 text-slate-900 text-sm font-medium hover:bg-slate-200 transition">
                    <List className="w-4 h-4 mr-2" />
                    My Listings
                  </button>
                </Link>
              )}
              
              <AdminButton />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 lg:py-16">
            {/* Copy */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Your property live in <br />
                <span className="text-teal-700">2 minutes</span> — free, fast,
                everywhere.
              </h1>

              <p className="mt-4 text-lg text-slate-600">
                Post once. Share on WhatsApp, Facebook &amp; beyond.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-white font-semibold shadow-sm hover:bg-teal-800 transition"
                >
                  Create Your Listing Free
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
                >
                  Search Properties
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-2 text-slate-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-700/10 text-teal-700">
                  ✓
                </span>
                <span className="text-sm sm:text-base">
                  100% free, no middlemen
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute -inset-10 -z-10 rounded-full bg-teal-200/30 blur-3xl" />
              <img
                src="/hero-real-estate.jpg"
                alt="List & share property preview"
                className="mx-auto w-[90%] max-w-md rounded-2xl shadow-2xl ring-1 ring-black/5"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Quick Setup"
              desc="Create a listing in under 2 minutes."
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5" />}
              title="Share Anywhere"
              desc="One click to WhatsApp & Facebook groups."
            />
            <FeatureCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="Direct Contact"
              desc="No brokers. Message owners directly."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Peer-to-Peer"
              desc="Chat directly with buyers & renters."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Listandshare.com
      </footer>
    </div>
  );
};

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-teal-50 text-teal-700">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

export default Hero;
