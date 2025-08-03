'use client';

import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pago cancelado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No se ha procesado ningún cargo
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Qué pasó?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo 
              a tu tarjeta y no se ha activado ningún acceso al contenido.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    ¿Necesitas ayuda?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Si tuviste algún problema con el pago o tienes preguntas, 
                      no dudes en contactarnos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/cursos"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Intentar de nuevo
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>
            ¿Tienes problemas con el pago? Contacta con nuestro soporte.
          </p>
        </div>
      </div>
    </div>
  );
} 