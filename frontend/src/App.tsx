/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Calendar, Menu as MenuIcon, MapPin,
  Phone, Mail, MessageSquare, User, X, ChevronRight, Sparkles,
  ShoppingCart, Plus, Minus, Trash2, Send, Bot, BedDouble, Users, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavItem, BookedReservation, RoomBooking } from './types';
import { useSofia } from './lib/useSofia';
import { useCart } from './lib/useCart';
import { useChat } from './lib/useChat';
import { MENU } from './data/menu';
import { ROOMS, Room } from './data/rooms';

type Page = 'Home' | 'Menu' | 'Rooms' | 'Contact';

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',    icon: Mic },
  { label: 'Rooms',   icon: BedDouble },
  { label: 'Menu',    icon: MenuIcon },
  { label: 'Contact', icon: MapPin },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState<Page>('Home');
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [bookedReservations, setBookedReservations] = useState<BookedReservation[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [mealTab, setMealTab] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingForm, setBookingForm] = useState({ guest_name: '', check_in: '', check_out: '', guests: 1, special_requests: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<RoomBooking | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { items, addToCart, removeFromCart, updateQty, clearCart, total } = useCart();
  const { messages, loading, sendMessage } = useChat();
  const { status, isCalling, isMuted, transcript, startCall, endCall, toggleMic } = useSofia();
  const transcriptBoxRef = useRef<HTMLDivElement>(null);
  const agentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript.length > 0 && transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  const fetchReservations = () => {
    fetch('/reservations')
      .then(r => r.json())
      .then(setBookedReservations)
      .catch(() => {});
  };

  const fetchRoomBookings = () => {
    fetch('/room-bookings')
      .then(r => r.json())
      .then(setRoomBookings)
      .catch(() => {});
  };

  useEffect(() => {
    if (page === 'Rooms') fetchRoomBookings();
  }, [page]);

  const submitRoomBooking = async () => {
    if (!bookingRoom) return;
    if (!bookingForm.guest_name || !bookingForm.check_in || !bookingForm.check_out) return;
    setBookingLoading(true);
    try {
      const res = await fetch('/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name:      bookingForm.guest_name,
          room_id:         bookingRoom.id,
          room_name:       bookingRoom.name,
          room_type:       bookingRoom.type,
          check_in:        bookingForm.check_in,
          check_out:       bookingForm.check_out,
          guests:          bookingForm.guests,
          price_per_night: bookingRoom.price,
          special_requests: bookingForm.special_requests,
        }),
      });
      const booking = await res.json();
      setBookingSuccess(booking);
      fetchRoomBookings();
    } catch {
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const guestMatch = transcript.find(e => e.speaker === 'You' && /for ([A-Z][a-z]+)/i.test(e.text));
  const sizeMatch  = transcript.find(e => e.speaker === 'You' && /party of (\d+)/i.test(e.text));
  const dateMatch  = transcript.find(e => e.speaker === 'You' && /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}[\/\-]\d{1,2})/i.test(e.text));

  const reservation = {
    guest:     guestMatch ? (guestMatch.text.match(/for ([A-Z][a-z]+)/i)?.[1] ?? '—') : '—',
    partySize: sizeMatch  ? (sizeMatch.text.match(/party of (\d+)/i)?.[1] ?? '—')     : '—',
    dateTime:  dateMatch  ? dateMatch.text.slice(0, 40)                                : '—',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col glass border-r border-outline-variant/15 py-8 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className={`px-4 mb-12 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && <h1 className="font-serif text-xl text-primary tracking-tight leading-tight">Lahore Hotel<br/>And Restaurant</h1>}
          <button onClick={() => setSidebarOpen(o => !o)} className="text-secondary hover:text-primary transition-colors shrink-0">
            {sidebarOpen ? <ChevronRight size={18} className="rotate-180" /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setPage(item.label as Page)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-95 ${
                page === item.label ? 'text-primary font-bold bg-primary/5' : 'text-secondary hover:bg-primary/5 hover:text-primary'
              } ${sidebarOpen ? '' : 'justify-center'}`}
            >
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`px-4 mt-auto pt-8 border-t border-outline-variant/15 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-serif italic text-lg shadow-sm shrink-0">P</div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Your Assistant</p>
                  <p className="text-xs text-secondary">Parveen is at your service</p>
                </div>
              </div>
              <button onClick={() => setPage('Home')}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-lg text-xs font-bold tracking-widest uppercase shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
                Book Now
              </button>
            </>
          ) : (
            <button onClick={() => setPage('Home')} title="Book Now"
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors">
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center px-6 py-4 glass border-b border-outline-variant/15 sticky top-0 z-20">
          <span className="font-serif text-xl italic text-primary">Lahore Hotel And Restaurant</span>
          <div className="flex gap-4 text-primary">
            <button onClick={() => setPage('Menu')}><MenuIcon size={20} /></button>
            <User size={20} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {page === 'Home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">

              {/* Hero Section */}
              <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
                    alt="Restaurant" className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                </div>
                <div className="relative z-10 px-6 max-w-4xl mx-auto">
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-[11px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-4">
                    Est. 2010 · Mall Road, Lahore
                  </motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="font-serif text-5xl md:text-7xl text-white leading-tight mb-6">
                    Lahore Hotel<br /><span className="italic text-amber-300">And Restaurant</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed mb-10">
                    Where authentic Pakistani flavours meet timeless hospitality. A landmark on Mall Road since 2010.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-4 justify-center">
                    <button onClick={() => agentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-widest uppercase rounded-full shadow-xl transition-all">
                      Reserve a Table
                    </button>
                    <button onClick={() => setPage('Rooms')}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs tracking-widest uppercase rounded-full backdrop-blur-sm transition-all">
                      Book a Room
                    </button>
                  </motion.div>
                </div>
                {/* Scroll indicator */}
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase flex flex-col items-center gap-2">
                  <span>Scroll</span>
                  <div className="w-px h-8 bg-white/30" />
                </motion.div>
              </section>

              {/* Stats Bar */}
              <section className="bg-primary text-white py-6 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { value: '15+', label: 'Years of Excellence' },
                    { value: '50+', label: 'Signature Dishes' },
                    { value: '7',   label: 'Room Categories' },
                    { value: '24/7', label: 'Guest Service' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="font-serif text-3xl text-amber-300">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Features */}
              <section className="py-20 px-6 bg-surface-container-low">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3">What We Offer</p>
                    <h2 className="font-serif text-4xl text-on-surface">A Complete Experience</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: '🍽️', title: 'Fine Dining',   desc: 'Authentic Pakistani cuisine crafted by master chefs. From Nihari to Biryani — every dish tells a story.',          action: () => setPage('Menu') },
                      { icon: '🛏️', title: 'Luxury Rooms',  desc: 'Seven categories of rooms from Standard to Presidential Suite, each designed for comfort and elegance.',           action: () => setPage('Rooms') },
                      { icon: '🤖', title: 'AI Concierge',  desc: 'Parveen, our AI voice concierge, is available 24/7 to handle reservations, menu queries, and special requests.',   action: () => agentSectionRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                    ].map(f => (
                      <div key={f.title} onClick={f.action}
                        className="bg-surface rounded-2xl p-8 ghost-border text-center space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                        <div className="text-4xl">{f.icon}</div>
                        <h3 className="font-serif text-xl text-on-surface">{f.title}</h3>
                        <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
                        <p className="text-primary text-xs font-bold uppercase tracking-widest">
                          {f.title === 'Fine Dining' ? 'View Menu →' : f.title === 'Luxury Rooms' ? 'Book a Room →' : 'Talk to Parveen →'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* AI Concierge Section */}
              <section ref={agentSectionRef} className="py-20 px-6 bg-surface">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">AI Voice Concierge</p>
                    <h2 className="font-serif text-4xl text-on-surface leading-tight">Meet Parveen,<br /><span className="italic text-primary">Your Digital Host</span></h2>
                    <p className="text-secondary leading-relaxed">Parveen is our AI-powered voice concierge available around the clock. Simply call her to make a reservation, ask about the menu, or request anything during your stay.</p>
                    <div className="space-y-3">
                      {['Make & manage table reservations', 'Answer menu & dietary questions', 'Handle special requests', 'Available in English & Urdu'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm text-on-surface">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Star size={10} className="text-primary" />
                          </div>
                          {f}
                        </div>
                      ))}
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={startCall}
                      className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary-container transition-all">
                      <Phone size={18} />
                      <span className="font-bold tracking-widest uppercase text-[10px]">Call Parveen Now</span>
                    </motion.button>
                  </div>

                  {/* Concierge Widget */}
                  <div className="bg-surface-container-low rounded-3xl p-8 ghost-border shadow-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif italic text-xl">P</div>
                        <div>
                          <p className="font-bold text-on-surface">Parveen</p>
                          <div className="flex items-center gap-1.5">
                            <motion.span animate={status !== 'Idle' ? { scale: [1, 1.3, 1], opacity: [1, 0.4, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}
                              className={`w-2 h-2 rounded-full ${status === 'Idle' ? 'bg-secondary' : status === 'Connecting' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">{status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-48 overflow-y-auto space-y-4 scrollbar-hide">
                      {transcript.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-secondary italic text-sm">Start a call to chat with Parveen...</div>
                      ) : (
                        transcript.map((entry, i) => (
                          <div key={entry.id ?? i} className={`flex ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${entry.speaker === 'Parveen' ? 'bg-primary/10 text-primary rounded-bl-sm' : entry.speaker === 'You' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-container-high text-secondary italic text-center w-full'}`}>
                              {entry.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-3">
                      {!isCalling ? (
                        <button onClick={startCall} className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                          <Phone size={14} /> Call Parveen
                        </button>
                      ) : (
                        <>
                          <button onClick={toggleMic} className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${isMuted ? 'bg-yellow-500 text-white' : 'bg-surface-container-high text-primary'}`}>
                            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                            {isMuted ? 'Unmute' : 'Mute'}
                          </button>
                          <button onClick={endCall} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                            <X size={14} /> End
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Menu Preview */}
              <section className="py-20 px-6 bg-surface-container-low">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3">Taste of Lahore</p>
                    <h2 className="font-serif text-4xl text-on-surface">Signature Dishes</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Nihari', desc: 'Slow-braised beef shank', price: '$26', emoji: '🍲' },
                      { name: 'Karahi Gosht', desc: 'Wok-cooked lamb', price: '$28', emoji: '🥘' },
                      { name: 'Mutton Biryani', desc: 'Dum-cooked basmati', price: '$27', emoji: '🍚' },
                      { name: 'Halwa Puri', desc: 'Lahori breakfast classic', price: '$10', emoji: '🫓' },
                    ].map(d => (
                      <div key={d.name} onClick={() => setPage('Menu')}
                        className="bg-surface rounded-2xl p-5 ghost-border text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all space-y-2">
                        <div className="text-3xl">{d.emoji}</div>
                        <p className="font-bold text-on-surface text-sm">{d.name}</p>
                        <p className="text-secondary text-xs">{d.desc}</p>
                        <p className="text-primary font-bold text-sm">{d.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-10">
                    <button onClick={() => setPage('Menu')} className="px-8 py-3 border-2 border-primary text-primary rounded-full text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all">
                      View Full Menu
                    </button>
                  </div>
                </div>
              </section>

              {/* Location & Hours */}
              <section className="py-16 px-6 bg-surface border-t border-outline-variant/15">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg text-on-surface">Location</h4>
                    <p className="text-secondary text-sm leading-relaxed">Mall Road, Lahore<br />Punjab, Pakistan</p>
                    <button onClick={() => setPage('Contact')} className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
                      Get Directions <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg text-on-surface">Contact</h4>
                    <div className="space-y-1 text-secondary text-sm">
                      <p className="flex items-center gap-2"><Phone size={14} /> +92 336 470 8886</p>
                      <p className="flex items-center gap-2"><Mail size={14} /> concierge@lahorehotel.com</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg text-on-surface">Hours</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-on-surface">Breakfast: 7:00 AM — 11:00 AM</p>
                      <p className="text-on-surface">Lunch: 12:00 PM — 4:00 PM</p>
                      <p className="text-on-surface">Dinner: 6:00 PM — 11:00 PM</p>
                      <p className="text-secondary text-xs">Open Daily</p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {page === 'Rooms' && (
            <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto w-full p-6 md:p-12 flex flex-col gap-10">

              <div>
                <h2 className="font-serif text-4xl text-primary">Our Rooms</h2>
                <p className="text-secondary text-sm mt-2">Luxury accommodation at Lahore Hotel And Restaurant</p>
              </div>

              {/* Room Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ROOMS.map(room => (
                  <div key={room.id} className="bg-surface-container-low rounded-2xl ghost-border overflow-hidden flex flex-col">
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary-container/30 flex items-center justify-center">
                      <BedDouble size={40} className="text-primary opacity-60" />
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-on-surface">{room.name}</p>
                          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{room.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">${room.price}</p>
                          <p className="text-[10px] text-secondary">per night</p>
                        </div>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">{room.description}</p>
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <Users size={12} /> <span>Up to {room.capacity} guests</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 4).map(a => (
                          <span key={a} className="text-[10px] px-2 py-0.5 bg-primary/8 text-primary rounded-full">{a}</span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 bg-surface-container-high text-secondary rounded-full">+{room.amenities.length - 4} more</span>
                        )}
                      </div>
                      <button
                        onClick={() => { setBookingRoom(room); setBookingSuccess(null); setBookingForm({ guest_name: '', check_in: '', check_out: '', guests: 1, special_requests: '' }); }}
                        className="mt-auto w-full py-3 bg-primary text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-primary-container transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* My Room Bookings */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-2xl text-on-surface">My Bookings</h3>
                  <button onClick={fetchRoomBookings} className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-full text-xs text-secondary hover:text-primary hover:border-primary/30 transition-colors">
                    <ChevronRight size={12} className="rotate-90" /> Refresh
                  </button>
                </div>
                {roomBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-secondary gap-3">
                    <BedDouble size={40} className="opacity-20" />
                    <p className="text-sm italic">No room bookings yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomBookings.map(b => {
                      const nights = Math.max(1, Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000));
                      return (
                        <div key={b.confirmation_code} className="p-5 bg-surface-container-low rounded-2xl ghost-border space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-on-surface">{b.guest_name}</p>
                              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{b.confirmation_code}</p>
                            </div>
                            <button onClick={() => fetch(`/room-bookings/${b.confirmation_code}`, { method: 'DELETE' }).then(fetchRoomBookings)}
                              className="text-secondary hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                          </div>
                          <p className="text-sm font-medium text-on-surface">{b.room_name} <span className="text-xs text-secondary font-normal">({b.room_type})</span></p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { label: 'Check-in',  value: b.check_in },
                              { label: 'Check-out', value: b.check_out },
                              { label: 'Guests',    value: `${b.guests}` },
                              { label: 'Total',     value: `$${(b.price_per_night * nights).toFixed(0)} (${nights}n)` },
                            ].map(row => (
                              <div key={row.label} className="bg-surface-container-high rounded-lg px-3 py-2">
                                <p className="text-[9px] uppercase tracking-widest text-secondary font-medium">{row.label}</p>
                                <p className="font-bold text-on-surface mt-0.5">{row.value}</p>
                              </div>
                            ))}
                          </div>
                          {b.special_requests && <p className="text-xs text-secondary italic border-t border-outline-variant/10 pt-2">"{b.special_requests}"</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {page === 'Contact' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto w-full p-6 md:p-12 flex flex-col gap-10">

              <div>
                <h2 className="font-serif text-4xl text-primary">Contact Us</h2>
                <p className="text-secondary text-sm mt-2">We'd love to hear from you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Cards */}
                <div className="space-y-4">
                  {[
                    {
                      icon: MapPin,
                      label: 'Address',
                      lines: ['Mall Road, Lahore', 'Punjab, Pakistan'],
                    },
                    {
                      icon: Phone,
                      label: 'Phone',
                      lines: ['+92 336 470 8886', '+92 321 554 4862'],
                    },
                    {
                      icon: Mail,
                      label: 'Email',
                      lines: ['concierge@lahorehotel.com', 'reservations@lahorehotel.com'],
                    },
                    {
                      icon: Calendar,
                      label: 'Hours',
                      lines: ['Breakfast: 7:00 AM – 11:00 AM', 'Lunch: 12:00 PM – 4:00 PM', 'Dinner: 6:00 PM – 11:00 PM'],
                    },
                  ].map(card => (
                    <div key={card.label} className="flex gap-4 p-5 bg-surface-container-low rounded-2xl ghost-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <card.icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">{card.label}</p>
                        {card.lines.map(l => <p key={l} className="text-sm text-on-surface">{l}</p>)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Form */}
                <div className="bg-surface-container-low rounded-2xl ghost-border p-6 space-y-4">
                  <h3 className="font-serif text-xl text-on-surface">Send a Message</h3>
                  {[
                    { label: 'Your Name',    type: 'text',  placeholder: 'Full name' },
                    { label: 'Email',        type: 'email', placeholder: 'your@email.com' },
                    { label: 'Phone',        type: 'tel',   placeholder: '+92 300 000 0000' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] uppercase tracking-widest text-secondary font-medium block mb-1">{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-secondary font-medium block mb-1">Message</label>
                    <textarea rows={4} placeholder="How can we help you?"
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm focus:outline-none focus:border-primary/50 resize-none" />
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl text-xs font-bold tracking-widest uppercase shadow-lg hover:opacity-90 transition-opacity">
                    Send Message
                  </button>
                </div>
              </div>

              {/* Map embed placeholder */}
              <div className="rounded-2xl overflow-hidden ghost-border h-64 bg-surface-container-low flex items-center justify-center">
                <iframe
                  title="Lahore Mall Road Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.5!2d74.3294!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904d3a5b1b1b1%3A0x1!2sMall+Road%2C+Lahore!5e0!3m2!1sen!2spk!4v1"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          )}

          {page === 'Menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto w-full p-6 md:p-12 flex flex-col gap-10"
            >
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-4xl text-primary">Our Menu</h2>
                  <p className="text-secondary text-sm mt-2">Authentic Pakistani cuisine at Lahore Hotel And Restaurant</p>
                </div>
                <button onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-container transition-all">
                  <ShoppingCart size={16} />
                  <span className="text-xs font-bold tracking-widest uppercase">Cart</span>
                  {items.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {items.reduce((s, i) => s + i.qty, 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Meal Tabs */}
              <div className="flex gap-2">
                {(['Breakfast', 'Lunch', 'Dinner'] as const).map(meal => (
                  <button key={meal} onClick={() => setMealTab(meal)}
                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                      mealTab === meal ? 'bg-primary text-white shadow-md' : 'bg-surface-container-high text-secondary hover:text-primary'
                    }`}>
                    {meal}
                  </button>
                ))}
              </div>

              {MENU.filter(s => s.meal === mealTab).map((section) => (
                <div key={section.category}>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-serif text-2xl text-on-surface">{section.category}</h3>
                    <div className="flex-1 h-px bg-outline-variant/20" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item) => {
                      const cartItem = items.find(i => i.name === item.name);
                      return (
                        <div key={item.name} className="flex justify-between items-start p-4 bg-surface-container-low rounded-xl ghost-border hover:bg-surface-container-high transition-colors">
                          <div className="flex-1 pr-4">
                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                            <p className="text-secondary text-xs mt-1 leading-relaxed">{item.description}</p>
                            <p className="text-primary font-bold text-sm mt-2">{item.price}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {cartItem ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.name, cartItem.qty - 1)}
                                  className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20">
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-bold text-on-surface w-4 text-center">{cartItem.qty}</span>
                                <button onClick={() => updateQty(item.name, cartItem.qty + 1)}
                                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container">
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-primary-container transition-colors">
                                <Plus size={10} /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="fixed inset-0 bg-black/30 z-30"
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface shadow-2xl z-40 flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/15">
                  <h3 className="font-serif text-xl text-on-surface flex items-center gap-2">
                    <ShoppingCart size={18} className="text-primary" /> Your Order
                  </h3>
                  <button onClick={() => setCartOpen(false)} className="text-secondary hover:text-on-surface transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-secondary gap-3">
                      <ShoppingCart size={40} className="opacity-30" />
                      <p className="text-sm italic">Your cart is empty</p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.name} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-on-surface">{item.name}</p>
                          <p className="text-xs text-secondary">{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.name, item.qty - 1)} className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20">
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.name, item.qty + 1)} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container">
                            <Plus size={10} />
                          </button>
                          <button onClick={() => removeFromCart(item.name)} className="w-6 h-6 rounded-full text-red-400 hover:text-red-600 flex items-center justify-center ml-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="px-6 py-5 border-t border-outline-variant/15 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary text-sm">Total</span>
                      <span className="font-bold text-on-surface text-lg">${total.toFixed(2)}</span>
                    </div>
                    <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold tracking-widest uppercase text-xs shadow-lg hover:opacity-90 transition-opacity">
                      Place Order
                    </button>
                    <button onClick={clearCart} className="w-full py-2 text-secondary text-xs hover:text-red-500 transition-colors">
                      Clear cart
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <footer className="w-full py-10 px-6 flex flex-col items-center gap-6 mt-auto border-t border-outline-variant/15 glass">
          <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-medium">© 2024 Lahore Hotel And Restaurant. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>

      {/* Room Booking Modal */}
      <AnimatePresence>
        {bookingRoom && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBookingRoom(null)}
              className="fixed inset-0 bg-black/40 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15">
                  <div>
                    <h3 className="font-serif text-xl text-on-surface">{bookingRoom.name}</h3>
                    <p className="text-xs text-secondary">${bookingRoom.price}/night · Up to {bookingRoom.capacity} guests</p>
                  </div>
                  <button onClick={() => setBookingRoom(null)} className="text-secondary hover:text-on-surface"><X size={20} /></button>
                </div>

                {bookingSuccess ? (
                  <div className="p-8 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Star size={28} className="text-green-600" />
                    </div>
                    <h4 className="font-serif text-2xl text-on-surface">Booking Confirmed!</h4>
                    <p className="text-primary font-bold text-lg tracking-widest">{bookingSuccess.confirmation_code}</p>
                    <div className="w-full space-y-2 text-sm text-left bg-surface-container-low rounded-xl p-4">
                      {[
                        ['Room',      bookingSuccess.room_name],
                        ['Guest',     bookingSuccess.guest_name],
                        ['Check-in',  bookingSuccess.check_in],
                        ['Check-out', bookingSuccess.check_out],
                        ['Guests',    String(bookingSuccess.guests)],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-secondary text-xs uppercase tracking-wider">{l}</span>
                          <span className="font-bold text-on-surface text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setBookingRoom(null)}
                      className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-primary-container transition-colors">
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Guest Name', key: 'guest_name', type: 'text', placeholder: 'Full name' },
                      { label: 'Check-in',   key: 'check_in',   type: 'date', placeholder: '' },
                      { label: 'Check-out',  key: 'check_out',  type: 'date', placeholder: '' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-[10px] uppercase tracking-widest text-secondary font-medium block mb-1">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={(bookingForm as any)[field.key]}
                          onChange={e => setBookingForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-secondary font-medium block mb-1">Guests</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setBookingForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                          className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"><Minus size={14} /></button>
                        <span className="font-bold text-on-surface w-6 text-center">{bookingForm.guests}</span>
                        <button onClick={() => setBookingForm(f => ({ ...f, guests: Math.min(bookingRoom.capacity, f.guests + 1) }))}
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container"><Plus size={14} /></button>
                        <span className="text-xs text-secondary ml-1">max {bookingRoom.capacity}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-secondary font-medium block mb-1">Special Requests</label>
                      <textarea
                        rows={2}
                        placeholder="Any special requirements..."
                        value={bookingForm.special_requests}
                        onChange={e => setBookingForm(f => ({ ...f, special_requests: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>
                    <button
                      onClick={submitRoomBooking}
                      disabled={bookingLoading || !bookingForm.guest_name || !bookingForm.check_in || !bookingForm.check_out}
                      className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl text-xs font-bold tracking-widest uppercase shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {bookingLoading ? 'Booking...' : `Confirm Booking · $${bookingRoom.price}/night`}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chat Button + Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-80 bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden"
              style={{ height: '420px' }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary-container text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-serif italic text-sm">P</div>
                  <div>
                    <p className="text-xs font-bold">Parveen</p>
                    <p className="text-[10px] opacity-75">Digital Concierge</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="opacity-75 hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-surface-container-high text-on-surface rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container-high px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(chatInput); setChatInput(''); }}
                className="flex items-center gap-2 px-3 py-3 border-t border-outline-variant/15"
              >
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask Parveen anything..."
                  className="flex-1 text-xs bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/20 focus:outline-none focus:border-primary/40"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || loading}
                  className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40"
                >
                  <Send size={13} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(o => !o)}
          className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-xl flex items-center justify-center"
        >
          {chatOpen ? <X size={22} /> : <Bot size={22} />}
        </motion.button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(119, 90, 37, 0.4); }
          70%  { box-shadow: 0 0 0 20px rgba(119, 90, 37, 0); }
          100% { box-shadow: 0 0 0 0 rgba(119, 90, 37, 0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
