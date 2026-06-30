import { Shield, Zap, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-black text-dark-50 mb-6">
          About <span className="gradient-text">BORHS Data</span>
        </h1>
        <p className="text-dark-300 text-lg leading-relaxed">
          BORHS Data is Nigeria's most trusted VTU and bills payment platform. We're on a mission to make digital payments
          fast, affordable, and accessible to every Nigerian — from individuals to businesses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {[
          { icon: Zap, title: 'Our Mission', desc: 'To provide the fastest and cheapest VTU services in Nigeria, empowering individuals and businesses.', color: 'text-yellow-400' },
          { icon: Shield, title: 'Our Values', desc: 'Transparency, reliability, and customer satisfaction guide every decision we make.', color: 'text-primary-400' },
          { icon: Heart, title: 'Our Community', desc: 'We\'re built for Nigerians, by Nigerians. We understand the market like no other.', color: 'text-red-400' },
          { icon: Users, title: 'Our Team', desc: 'A dedicated team of tech enthusiasts working round the clock to keep the platform running.', color: 'text-success-500' },
        ].map((item) => (
          <div key={item.title} className="card p-6 text-center">
            <div className={`w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4 ${item.color}`}>
              <item.icon size={24} />
            </div>
            <h3 className="font-bold text-dark-100 mb-2">{item.title}</h3>
            <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-12 text-center bg-gradient-to-br from-primary-600/10 to-success-500/5 border border-primary-500/20">
        <h2 className="text-3xl font-black text-dark-50 mb-4">Ready to Join Us?</h2>
        <p className="text-dark-300 mb-8 max-w-xl mx-auto">Start saving money on data and bills today. Join over 50,000 Nigerians already using BORHS Data.</p>
        <a href="/register" className="btn-primary btn-lg">Create Free Account</a>
      </div>
    </div>
  );
}
