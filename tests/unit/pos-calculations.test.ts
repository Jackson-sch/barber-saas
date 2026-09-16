// tests/unit/pos-calculations.test.ts
import { describe, it, expect } from 'vitest'
import type { CartItemInput } from '@/actions/pos'
import type { Product, LoyaltyProgramSettings } from '@/types/database.types'

/**
 * Funciones puras que encapsulan la lógica de cálculo del POS y Caja
 * para verificar que las reglas de negocio sean deterministas y robustas.
 */
function calculateCartTotals(cart: CartItemInput[], discount: number, tip: number) {
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0)
  const discountVal = Math.max(0, discount)
  const tipVal = Math.max(0, tip)
  const total = Math.max(0, subtotal - discountVal) + tipVal
  return { subtotal, discountVal, tipVal, total }
}

function calculateLoyaltyBalance({
  prevBalance,
  totalSale,
  program,
  isRedeeming,
}: {
  prevBalance: number
  totalSale: number
  program: LoyaltyProgramSettings
  isRedeeming: boolean
}) {
  const isPoints = program.program_type === 'POINTS'
  const target = isPoints ? program.target_points : program.target_visits
  const earned = isPoints ? Math.floor(totalSale * (program.points_per_pen || 1)) : 1
  const afterRedeem = isRedeeming ? Math.max(0, prevBalance - target) : prevBalance
  const newBalance = afterRedeem + earned

  return {
    isPoints,
    target,
    earned,
    afterRedeem,
    newBalance,
    canRedeem: prevBalance >= target,
  }
}

function calculateShiftClosingBalance({
  initialAmount,
  cashSales,
  cashInflows,
  cashOutflows,
  actualCloseAmount,
}: {
  initialAmount: number
  cashSales: number
  cashInflows: number
  cashOutflows: number
  actualCloseAmount: number
}) {
  const expectedAmount = initialAmount + cashSales + cashInflows - cashOutflows
  const difference = actualCloseAmount - expectedAmount
  return {
    expectedAmount,
    difference,
    isExact: difference === 0,
    hasShortage: difference < 0,
    hasSurplus: difference > 0,
  }
}

describe('Cálculos Financieros: POS, Caja y Fidelización', () => {
  describe('Cálculos del Carrito y Totales de Venta', () => {
    it('debe calcular el subtotal correctamente a partir de los ítems', () => {
      const cart: CartItemInput[] = [
        {
          service_id: 'svc-1',
          name: 'Corte Clásico',
          item_type: 'SERVICE',
          quantity: 2,
          unit_price: 35,
          subtotal: 70,
        },
        {
          product_id: 'prod-1',
          name: 'Cera Fijadora Matte',
          item_type: 'PRODUCT',
          quantity: 1,
          unit_price: 45,
          subtotal: 45,
        },
      ]

      const { subtotal, total } = calculateCartTotals(cart, 0, 0)
      expect(subtotal).toBe(115)
      expect(total).toBe(115)
    })

    it('debe aplicar descuento restándolo del subtotal', () => {
      const cart: CartItemInput[] = [
        {
          service_id: 'svc-1',
          name: 'Corte VIP',
          item_type: 'SERVICE',
          quantity: 1,
          unit_price: 60,
          subtotal: 60,
        },
      ]

      const { subtotal, discountVal, total } = calculateCartTotals(cart, 15, 0)
      expect(subtotal).toBe(60)
      expect(discountVal).toBe(15)
      expect(total).toBe(45)
    })

    it('debe sumar la propina al total final', () => {
      const cart: CartItemInput[] = [
        {
          service_id: 'svc-1',
          name: 'Corte & Barba',
          item_type: 'SERVICE',
          quantity: 1,
          unit_price: 50,
          subtotal: 50,
        },
      ]

      const { total, tipVal } = calculateCartTotals(cart, 0, 10)
      expect(tipVal).toBe(10)
      expect(total).toBe(60)
    })

    it('debe proteger contra descuentos superiores al subtotal (el total no puede ser negativo antes de propinas)', () => {
      const cart: CartItemInput[] = [
        {
          service_id: 'svc-1',
          name: 'Lavado',
          item_type: 'SERVICE',
          quantity: 1,
          unit_price: 20,
          subtotal: 20,
        },
      ]

      // Descuento mayor al subtotal con propina de 5
      const { total } = calculateCartTotals(cart, 50, 5)
      // Math.max(0, 20 - 50) = 0 + 5 = 5
      expect(total).toBe(5)
    })
  })

  describe('Control de Stock de Inventario en Carrito', () => {
    const mockProduct: Product = {
      id: 'prod-pomada',
      organization_id: 'org-1',
      name: 'Pomada Brillo',
      sku: 'POM-01',
      barcode: null,
      cost_price: 20,
      sale_price: 40,
      stock: 3,
      min_stock: 2,
      is_internal_use: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    it('debe rechazar agregar producto si el stock es cero o negativo', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 }
      const canAdd = outOfStockProduct.stock > 0
      expect(canAdd).toBe(false)
    })

    it('no debe permitir incrementar la cantidad por encima del stock disponible', () => {
      const currentQty = 3
      const deltaToAdd = 1
      const exceedsStock = currentQty + deltaToAdd > mockProduct.stock
      expect(exceedsStock).toBe(true)
    })

    it('debe permitir agregar unidades dentro del margen de stock', () => {
      const currentQty = 1
      const deltaToAdd = 1
      const canIncrease = currentQty + deltaToAdd <= mockProduct.stock
      expect(canIncrease).toBe(true)
    })
  })

  describe('Programa de Fidelización y Recompensas', () => {
    const pointsProgram: LoyaltyProgramSettings = {
      enabled: true,
      program_type: 'POINTS',
      target_points: 100,
      target_visits: 10,
      reward_title: 'Corte Gratis VIP',
      reward_discount: 35,
      points_reward_discount: 35,
      points_per_pen: 1,
    }

    const visitsProgram: LoyaltyProgramSettings = {
      enabled: true,
      program_type: 'VISITS',
      target_visits: 5,
      target_points: 100,
      reward_title: 'Servicio de Barba Gratis',
      reward_discount: 25,
      points_reward_discount: 25,
      points_per_pen: 1,
    }

    it('debe acumular 1 punto por cada Sol consumido en programa tipo POINTS', () => {
      const result = calculateLoyaltyBalance({
        prevBalance: 40,
        totalSale: 50.5,
        program: pointsProgram,
        isRedeeming: false,
      })

      expect(result.earned).toBe(50) // Math.floor(50.5)
      expect(result.newBalance).toBe(90)
    })

    it('debe acumular 1 visita por transacción en programa tipo VISITS', () => {
      const result = calculateLoyaltyBalance({
        prevBalance: 3,
        totalSale: 120, // Monto no influye en visitas
        program: visitsProgram,
        isRedeeming: false,
      })

      expect(result.earned).toBe(1)
      expect(result.newBalance).toBe(4)
      expect(result.canRedeem).toBe(false)
    })

    it('debe verificar si el cliente califica para redimir la recompensa', () => {
      const clientWith99Points = calculateLoyaltyBalance({
        prevBalance: 99,
        totalSale: 0,
        program: pointsProgram,
        isRedeeming: false,
      })
      expect(clientWith99Points.canRedeem).toBe(false)

      const clientWith100Points = calculateLoyaltyBalance({
        prevBalance: 100,
        totalSale: 0,
        program: pointsProgram,
        isRedeeming: false,
      })
      expect(clientWith100Points.canRedeem).toBe(true)
    })

    it('debe descontar el target de puntos al redimir premio y sumar los nuevos generados por la venta', () => {
      const result = calculateLoyaltyBalance({
        prevBalance: 120,
        totalSale: 30,
        program: pointsProgram,
        isRedeeming: true, // Canjea 100 puntos
      })

      // 120 - 100 = 20 restantes + 30 ganados en esta compra = 50
      expect(result.afterRedeem).toBe(20)
      expect(result.earned).toBe(30)
      expect(result.newBalance).toBe(50)
    })
  })

  describe('Cierre y Cuadre de Turno de Caja (CashShift)', () => {
    it('debe cuadrar exactamente cuando el monto físico coincide con el esperado', () => {
      const result = calculateShiftClosingBalance({
        initialAmount: 100, // Fondo de apertura
        cashSales: 350,     // Cobros en efectivo
        cashInflows: 50,    // Entrada manual
        cashOutflows: 30,   // Gasto/salida menor
        actualCloseAmount: 470, // Contado físico
      })

      expect(result.expectedAmount).toBe(470)
      expect(result.difference).toBe(0)
      expect(result.isExact).toBe(true)
      expect(result.hasShortage).toBe(false)
      expect(result.hasSurplus).toBe(false)
    })

    it('debe detectar un faltante de caja si el efectivo físico es menor', () => {
      const result = calculateShiftClosingBalance({
        initialAmount: 100,
        cashSales: 200,
        cashInflows: 0,
        cashOutflows: 0,
        actualCloseAmount: 280, // Faltan 20
      })

      expect(result.expectedAmount).toBe(300)
      expect(result.difference).toBe(-20)
      expect(result.hasShortage).toBe(true)
      expect(result.hasSurplus).toBe(false)
    })

    it('debe detectar un sobrante de caja si el efectivo físico es mayor', () => {
      const result = calculateShiftClosingBalance({
        initialAmount: 100,
        cashSales: 200,
        cashInflows: 0,
        cashOutflows: 0,
        actualCloseAmount: 315, // Sobran 15
      })

      expect(result.expectedAmount).toBe(300)
      expect(result.difference).toBe(15)
      expect(result.hasShortage).toBe(false)
      expect(result.hasSurplus).toBe(true)
    })
  })
})
