import { Link } from "react-router-dom";
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon 
} from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-[#A3A3A3] pt-24 pb-12 relative overflow-hidden border-t border-white/5">
      {/* Background Decorative Text */}
      <div className="absolute top-10 right-0 text-[12rem] font-serif text-white/[0.02] select-none pointer-events-none tracking-tighter">
        Heritage
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        
        {/* --- VIP NEWSLETTER SECTION --- */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 pb-20 border-b border-white/5 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
              Join the <span className="text-amber-500 italic">Inner Circle</span>
            </h2>
            <p className="text-sm tracking-wide max-w-md">
              Receive early access to seasonal vault openings and private bridal styling invitations.
            </p>
          </div>
          <form className="flex group border-b border-neutral-700 focus-within:border-amber-500 transition-colors py-2">
            <input 
              type="email" 
              placeholder="Your Email Address" 
              className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-neutral-700 py-2"
            />
            <button className="text-amber-500 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors">
              Subscribe
            </button>
          </form>
        </div>

        {/* --- MAIN LINKS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand & Mission */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif tracking-tighter text-white">
              THE <span className="text-amber-500 italic">VAULT</span>
            </h2>
            <p className="text-xs leading-relaxed uppercase tracking-widest text-neutral-500">
              Redefining the Indian bridal experience. Heritage craftsmanship, curated for the modern legacy.
            </p>
            <div className="flex gap-4">
               {/* Fake Social Icons with Glow */}
               {['IG', 'PI', 'FB'].map(social => (
                 <span key={social} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold hover:border-amber-500 hover:text-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer">
                   {social}
                 </span>
               ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-8">The Collection</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest">
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">Bridal Selection</Link></li>
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">Temple Gold Vault</Link></li>
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">The Polki Room</Link></li>
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">Minimalist Fine</Link></li>
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-8">Assistance</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest">
              <li><Link to="/how-it-works" className="hover:text-amber-500 transition-colors">How it Works</Link></li>
              <li><Link to="/safety" className="hover:text-amber-500 transition-colors">Safety & Insurance</Link></li>
              <li><Link to="/concierge" className="hover:text-amber-500 transition-colors">Virtual Concierge</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Rental Terms</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-8">Headquarters</h3>
            <div className="space-y-6 text-[11px] uppercase tracking-widest">
              <div className="flex items-start gap-4">
                <MapPinIcon className="w-5 h-5 text-amber-500" />
                <p>Private Studio, South Mumbai, India</p>
              </div>
              <div className="flex items-center gap-4">
                <PhoneIcon className="w-5 h-5 text-amber-500" />
                <p>+91 (800) VAULT-01</p>
              </div>
              <div className="flex items-center gap-4">
                <EnvelopeIcon className="w-5 h-5 text-amber-500" />
                <p>concierge@thevault.luxury</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
              100% Insured Authentic Heritage Jewellery
            </span>
          </div>
          
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
            © {new Date().getFullYear()} The Vault International. All Rights Reserved.
          </div>

          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;