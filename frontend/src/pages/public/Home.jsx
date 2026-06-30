import { Link } from 'react-router-dom';
import { Wifi, Phone, Zap, Tv, GraduationCap, Shield, Clock, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';

const services = [
  { icon: Wifi, label: 'Data Bundles', desc: 'SME, Corporate & Gifting data at cheapest rates', color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
  { icon: Phone, label: 'Airtime', desc: 'Top up any network instantly', color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400' },
  { icon: Zap, label: 'Electricity', desc: 'Pay IKEDC, EKEDC, AEDC & more', color: 'from-yellow-500/20 to-yellow-500/5', iconColor: 'text-yellow-400' },
  { icon: Tv, label: 'Cable TV', desc: 'DStv, GOtv & Startimes subscriptions', color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
  { icon: GraduationCap, label: 'Exam PINs', desc: 'WAEC, NECO, NABTEB & JAMB ePIN', color: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-400' },
  { icon: Users, label: 'Referral Program', desc: 'Earn up to 5% on every referral purchase', color: 'from-success-500/20 to-success-500/5', iconColor: 'text-success-500' },
];

const stats = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '₦500M+', label: 'Transactions Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Customer Support' },
];

const testimonials = [
  { name: 'Adebayo Okonkwo', role: 'Agent', text: 'BORHS Data has completely transformed my business. The cheapest data rates and instant delivery keep my customers coming back!', stars: 5 },
  { name: 'Chioma Eze', role: 'Customer', text: 'Been using for 6 months. Never had a failed transaction. The app is super fast and easy to use.', stars: 5 },
  { name: 'Ibrahim Musa', role: 'Reseller', text: 'The referral commissions alone cover my monthly subscription. Legit and reliable platform.', stars: 5 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-dark-950 to-success-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-primary-400 text-sm font-medium">Nigeria's #1 VTU Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-dark-50 leading-tight mb-6">
              Buy <span className="gradient-text">Data, Airtime</span> & Pay Bills
              <br />Instantly in Nigeria
            </h1>

            <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Cheapest data plans, instant delivery, reliable service. MTN, Airtel, Glo, 9mobile, electricity bills, cable TV and more — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary btn-lg text-base gap-2 group">
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/pricing" className="btn-secondary btn-lg text-base">View Pricing</Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-dark-400">
              {['No registration fee', 'Instant delivery', '24/7 support'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-dark-700/50 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black gradient-text mb-2">{stat.value}</div>
                <div className="text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-dark-50 mb-4">
            Everything You Need,<br /><span className="gradient-text">One Platform</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            From data and airtime to electricity and cable TV — we've got all your digital payment needs covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.label} className={`card-hover p-6 bg-gradient-to-br ${service.color} border border-dark-700/50`}>
              <div className={`w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mb-4 ${service.iconColor}`}>
                <service.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mb-2">{service.label}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-dark-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-dark-50 mb-6">
                Why Thousands Choose <span className="gradient-text">BORHS Data</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Clock, title: 'Instant Delivery', desc: 'Data and airtime delivered in under 10 seconds, 24/7.' },
                  { icon: Shield, title: 'Bank-Level Security', desc: 'Your funds are protected with military-grade encryption.' },
                  { icon: Star, title: 'Best Prices', desc: 'We offer the cheapest VTU rates in Nigeria, guaranteed.' },
                  { icon: Users, title: 'Earn While You Share', desc: 'Refer friends and earn commissions on every transaction they make.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-100 mb-1">{item.title}</h4>
                      <p className="text-dark-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div key={t.name} className="card p-5">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-dark-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <span className="text-primary-400 font-bold text-xs">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-100">{t.name}</p>
                      <p className="text-xs text-dark-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-600/20 via-dark-800 to-success-500/10 border border-primary-500/20 p-12 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary-500/10 blur-3xl rounded-full" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-black text-dark-50 mb-4">
              Start Saving Money Today
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
              Join 50,000+ Nigerians who trust BORHS Data for their daily VTU needs.
            </p>
            <Link to="/register" className="btn-primary btn-lg gap-2 group">
              Create Free Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
