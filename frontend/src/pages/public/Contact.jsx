import { Mail, Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll respond within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-dark-50 mb-4">Get In <span className="gradient-text">Touch</span></h1>
        <p className="text-dark-400 text-lg">We're here to help. Reach us through any of the channels below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="space-y-6 mb-10">
            {[
              { icon: Mail, title: 'Email Support', value: '05ahmadauwal@gmail.com', sub: 'We reply within 2 hours' },
              { icon: Phone, title: 'Phone Support', value: '+234 706 589 6598', sub: 'Mon–Fri, 8am–10pm' },
              { icon: MessageSquare, title: 'WhatsApp', value: '+234 706 589 6598', sub: '24/7 automated support' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 card p-5">
                <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-dark-100 text-sm">{item.title}</p>
                  <p className="text-primary-400 font-medium">{item.value}</p>
                  <p className="text-dark-400 text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-dark-100 mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input resize-none" rows={5} placeholder="Describe your issue..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
