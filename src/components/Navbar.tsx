'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthContext } from './AuthProvider'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Cursos', href: '/cursos' },
  { name: 'Contacto', href: '/contacto' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut } = useAuthContext()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  const filteredNavigation = navigation;

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    return user?.email?.split('@')[0] || 'Usuario'
  }

  return (
    <header className="bg-black">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 sm:p-4 lg:px-6" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <Image
              src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/sign/logo/Copy%20of%20Add%20a%20heading%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQwNGZkYi0xZGY4LTQzODQtYmJjOS0xNDdmMTU5Njk5NzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL0NvcHkgb2YgQWRkIGEgaGVhZGluZyAoMSkucG5nIiwiaWF0IjoxNzUyNzk0NjM4LCJleHAiOjE3ODQzMzA2Mzh9.FPNV5q_xig8QJgSnrDjel1JPwWzhXPVtgNcI8cWEZ3Y"
              alt="Indomath Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
              style={{ maxHeight: 48 }}
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menú principal</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white hover:text-indigo-400"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {getUserInitials(user.email || '')}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{getUserName()}</p>
                  <p className="text-xs text-gray-300">{user.email}</p>
                </div>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    href="/mis-chats"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Mis Chats
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-semibold leading-6 text-white border border-white hover:bg-white hover:text-black px-4 py-2 rounded transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold leading-6 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition-colors">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center">
              <Image
                src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/sign/logo/Copy%20of%20Add%20a%20heading%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MThiNzZhZC1lYzRhLTQwNDEtYWQ5Ny04NmZjZjdhN2FlY2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL0NvcHkgb2YgQWRkIGEgaGVhZGluZyAoMSkucG5nIiwiaWF0IjoxNzUyMDk4MTQ2LCJleHAiOjE3ODM2MzQxNDZ9.05N5RHpiZPDNBX2WZEypkQ1eVs4jgGGpF_KWObvH6vg"
                alt="Indomath Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                style={{ maxHeight: 48 }}
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:text-indigo-400 hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {getUserInitials(user.email || '')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{getUserName()}</p>
                        <p className="text-xs text-gray-300">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/perfil"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-indigo-400 hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/mis-chats"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-indigo-400 hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mis Chats
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-400 hover:bg-red-900/20"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white border border-white hover:bg-white hover:text-black transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-indigo-600 hover:bg-indigo-700 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
} 