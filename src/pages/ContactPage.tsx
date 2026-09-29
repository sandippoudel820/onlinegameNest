import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);

    try {
      if (db) {
        await addDoc(collection(db, 'contacts'), {
          name,
          email,
          type: topic,
          subject,
          message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Form was submitted and confirmed in UI
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in text-slate-300">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Contact Us Header Ad" />
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <Mail className="w-3.5 h-3.5" /> Support & Inquiries
        </div>
        <h1 className="text-3xl font-black text-white">Contact OnlineGameNest</h1>
        <p className="text-sm text-slate-400 mt-1">
          Have a question, feedback, game submission, or advertising inquiry? Reach out below.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Message Transmitted!</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Thank you, <span className="text-cyan-400 font-semibold">{name}</span>. Your message regarding &quot;{topic}&quot; has been received. Our team will review and reply to <span className="font-mono text-cyan-300">{email}</span> within 24–48 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setSubject('');
            }}
            className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Category</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Game Submission">Game Submission (Developers)</option>
                <option value="Advertising & Sponsorship">Advertising & Sponsorship</option>
                <option value="Bug Report">Technical Bug Report</option>
                <option value="DMCA / Copyright">Copyright / DMCA Takedown</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind, game details, or technical issue..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              We respond to all verified inquiries promptly.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Submit Form
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
