import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function About() {
  return (
    <div>
      <section className="mx-4 mt-4 rounded-[2rem] bg-[#e8eee7] px-6 py-16 text-center sm:mx-6 sm:px-12 sm:py-24 lg:mx-auto lg:max-w-7xl">
        <p className="public-kicker">Our reason for existing</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[#073b2a]">
          Everyday payments should feel ordinary.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#315c4d] sm:text-base">
          No confusion, no anxious waiting, no collection of disconnected
          service websites. BORHS brings the things Nigerians pay for every day
          into one dependable experience.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <img
            src="/borhs-hero-lifestyle.jpg"
            alt="A BORHS customer managing everyday payments"
            width="960"
            height="1200"
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover [border-radius:2rem_2rem_6rem_2rem]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="public-kicker">Built from frustration</p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[#073b2a] sm:text-3xl">
            We removed the parts that make digital payments feel technical.
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#557266] sm:text-base">
            BORHS began with a straightforward observation: buying data or
            paying a bill should not require expert knowledge. People need clear
            prices, a reliable balance, immediate confirmation and someone
            helpful when things go wrong.
          </p>
          <p className="mt-4 text-sm leading-6 text-[#557266] sm:text-base">
            That idea shapes the product, the language we use and every service
            we add.
          </p>
        </div>
      </section>
      <section className="mx-4 rounded-[2rem] bg-[#073b2a] px-6 py-16 text-white sm:mx-6 sm:px-12 lg:mx-auto lg:max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
          What guides us
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              ShieldCheck,
              "Dependability",
              "Transactions should be transparent, protected and easy to trace.",
            ],
            [
              HeartHandshake,
              "Human clarity",
              "We write and design for people, not payment-industry insiders.",
            ],
            [
              Users,
              "Useful growth",
              "Agents and customers should both gain meaningful value from the network.",
            ],
          ].map(([Icon, title, text]) => (
            <article key={title} className="rounded-[1.75rem] bg-white/8 p-7">
              <Icon className="text-amber-400" />
              <h3 className="mt-6 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <Sparkles className="mx-auto text-amber-500" />
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#073b2a] sm:text-3xl">
          Built for what you do every day.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#557266] sm:text-base">
          See how one BORHS wallet can simplify your data, airtime and bill
          payments.
        </p>
        <Link to="/register" className="public-btn-primary mt-8">
          Create your account <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
