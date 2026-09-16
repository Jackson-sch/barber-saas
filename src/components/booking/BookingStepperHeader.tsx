'use client'

import React from 'react'

interface BookingStepperHeaderProps {
  currentStep: number
}

const STEPS = [
  { id: 1, label: 'Servicio' },
  { id: 2, label: 'Especialista' },
  { id: 3, label: 'Horario' },
  { id: 4, label: 'Datos' },
]

export default function BookingStepperHeader({ currentStep }: BookingStepperHeaderProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((item) => {
          const isCurrent = currentStep === item.id
          const isCompleted = currentStep > item.id
          return (
            <div key={item.id} className="text-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 mb-2 ${
                  isCurrent
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isCompleted
                    ? 'bg-amber-500/40'
                    : 'bg-white/10'
                }`}
              />
              <span
                className={`text-[11px] font-medium transition ${
                  isCurrent ? 'text-amber-400 font-semibold' : isCompleted ? 'text-neutral-300' : 'text-neutral-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
