"use client";

import Image from "next/image";
import { useState } from "react";

export default function ContactoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error] = useState("");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="relative flex flex-1 min-h-[80vh]">
        {/* Imagen de fondo cubriendo toda la sección */}
        <Image
          src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/CONTACTO.png"
          alt="Chica contacto"
          fill
          className="object-cover object-center z-0"
          priority
          style={{ filter: 'brightness(0.85)' }}
        />
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#181c3a]/70 via-[#2a2e6e]/60 to-[#3a1e7e]/40 z-10" />
        {/* Contenido principal en dos columnas */}
        <div className="relative z-20 w-full flex flex-1">
          {/* Mitad izquierda: Formulario */}
          <div className="w-full md:w-1/2 flex items-center justify-center min-h-[600px]">
            <div className="relative z-20 w-full max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20 mt-12 mb-12">
              <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow">Contacto</h1>
              <p className="text-white/80 mb-8 max-w-lg">Si tienes cualquier pregunta, sugerencia, o simplemente quieres contactar con nosotros no dudes en hacerlo.</p>
              <form className="space-y-6" onSubmit={e => { e.preventDefault(); setSent(true); }}>
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-1">Nombre</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full rounded-md border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full rounded-md border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    placeholder="Tu email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-1">Mensaje</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="block w-full rounded-md border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none"
                    placeholder="Escribe tu mensaje"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  Enviar
                </button>
                {sent && (
                  <div className="text-green-300 text-center mt-2">¡Mensaje enviado! (demo UI)</div>
                )}
                {error && (
                  <div className="text-red-400 text-center mt-2">{error}</div>
                )}
              </form>
              <div className="mt-10">
                <h2 className="text-white font-bold text-lg mb-1">Email</h2>
                <a href="mailto:contacto@indomath.com" className="text-white/80 hover:underline">contacto@indomath.com</a>
              </div>
            </div>
          </div>
          {/* Mitad derecha: Menú */}
          <div className="hidden md:flex flex-col items-end gap-8 w-1/2 justify-end p-12">
            <div className="text-white/90 text-right">
              <span className="font-semibold text-lg">Menú</span>
              <ul className="mt-2 space-y-1">
                <li>Condiciones y Términos</li>
                <li>Política de privacidad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Footer simple */}
 
    </div>
  );
} 