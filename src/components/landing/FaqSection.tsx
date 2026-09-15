'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: '¿Necesito tarjeta de crédito para comenzar la prueba gratis?',
      answer:
        'No. Puedes registrarte y comenzar a utilizar todas las funciones del Plan Pro de inmediato sin ingresar ninguna tarjeta de crédito ni compromiso de pago. Al terminar tus 14 días de prueba, tú decides si deseas continuar.',
    },
    {
      question: '¿Cómo funciona la impresión de tickets térmicos en el POS?',
      answer:
        'BarberOS genera comprobantes formateados específicamente para impresoras térmicas de punto de venta (80mm y 58mm). Puedes imprimir directamente desde cualquier computadora, laptop o tablet conectada a tu impresora vía USB, Bluetooth o Red local.',
    },
    {
      question: '¿Cómo se envían los recordatorios por WhatsApp a mis clientes?',
      answer:
        'Desde la agenda interactiva o el detalle de cualquier cita, puedes hacer clic en el botón de WhatsApp para generar y enviar al instante mensajes con plantillas personalizadas (confirmaciones, recordatorios o agradecimientos) sin tener que tipear el mensaje a mano.',
    },
    {
      question: '¿Puedo personalizar mi portal de reservas con mi logo y colores?',
      answer:
        'Sí. En la sección de Configuración de tu salón puedes subir tu logotipo oficial, seleccionar una portada de alta resolución para tu banner, elegir tu paleta de colores corporativos y redactar tu slogan. Tu portal público lucirá como tu propia aplicación web.',
    },
    {
      question: '¿Cómo controla BarberOS el dinero de caja chica y gastos?',
      answer:
        'El módulo de Caja te permite registrar con un clic cualquier salida de dinero físico durante el turno (compra de insumos, refrigerios, delivery o adelantos a barberos). Al momento del cierre, el sistema calcula el monto exacto que debe haber en la gaveta sumando el fondo inicial, las ventas en efectivo y restando los egresos.',
    },
    {
      question: '¿Qué métodos de pago aceptan para renovar la suscripción mensual?',
      answer:
        'Aceptamos pagos directos y rápidos mediante Yape, Plin y transferencia bancaria (BCP, BBVA, Interbank), además de tarjetas de crédito o débito. La activación o renovación de tu plan es instantánea.',
    },
  ]

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto border-t border-white/[0.06] scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-mono uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Resolvemos tus Dudas</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Preguntas Frecuentes
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Todo lo que necesitas saber antes de implementar BarberOS en tu negocio.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index

          return (
            <div
              key={index}
              className="rounded-2xl bg-[#0E1017] border border-white/[0.08] overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full py-5 px-6 flex items-center justify-between text-left text-sm font-bold text-white hover:text-amber-400 transition cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-white/[0.04] pt-3 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
