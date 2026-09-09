'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductInput {
  id?: string
  organization_id: string
  name: string
  sku?: string | null
  barcode?: string | null
  cost_price: number
  sale_price: number
  stock: number
  min_stock: number
  is_internal_use?: boolean
  slug: string
}

export async function createProductAction(input: ProductInput) {
  const supabase = await createClient()

  if (!input.name?.trim() || !input.organization_id) {
    return { error: 'El nombre del producto y la organización son requeridos.' }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: input.organization_id,
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      barcode: input.barcode?.trim() || null,
      cost_price: Number(input.cost_price) || 0,
      sale_price: Number(input.sale_price) || 0,
      stock: Math.max(0, parseInt(String(input.stock), 10) || 0),
      min_stock: Math.max(0, parseInt(String(input.min_stock), 10) || 0),
      is_internal_use: !!input.is_internal_use,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { error: 'Error al registrar el producto.' }
  }

  revalidatePath(`/app/${input.slug}/inventario`)
  revalidatePath(`/app/${input.slug}/pos`)
  return { success: true, id: data.id }
}

export async function updateProductAction(input: ProductInput) {
  const supabase = await createClient()

  if (!input.id || !input.name?.trim() || !input.organization_id) {
    return { error: 'Datos incompletos para actualizar el producto.' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      barcode: input.barcode?.trim() || null,
      cost_price: Number(input.cost_price) || 0,
      sale_price: Number(input.sale_price) || 0,
      stock: Math.max(0, parseInt(String(input.stock), 10) || 0),
      min_stock: Math.max(0, parseInt(String(input.min_stock), 10) || 0),
      is_internal_use: !!input.is_internal_use,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('organization_id', input.organization_id)

  if (error) {
    console.error('Error updating product:', error)
    return { error: 'Error al actualizar el producto.' }
  }

  revalidatePath(`/app/${input.slug}/inventario`)
  revalidatePath(`/app/${input.slug}/pos`)
  return { success: true }
}

export async function adjustStockAction(
  productId: string,
  organizationId: string,
  delta: number,
  slug: string
) {
  const supabase = await createClient()

  const { data: prod, error: fetchErr } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .eq('organization_id', organizationId)
    .single()

  if (fetchErr || !prod) {
    return { error: 'Producto no encontrado.' }
  }

  const newStock = Math.max(0, (prod.stock || 0) + delta)

  const { error } = await supabase
    .from('products')
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error adjusting stock:', error)
    return { error: 'No se pudo actualizar el stock.' }
  }

  revalidatePath(`/app/${slug}/inventario`)
  revalidatePath(`/app/${slug}/pos`)
  return { success: true, newStock }
}

export async function deleteProductAction(
  id: string,
  organizationId: string,
  slug: string
) {
  const supabase = await createClient()

  // Verificar si tiene ventas asociadas
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('id')
    .eq('product_id', id)
    .limit(1)

  if (saleItems && saleItems.length > 0) {
    // Si tiene ventas, no se borra físicamente para no corromper la contabilidad; se desactiva
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      return { error: 'Error al desactivar el producto con ventas previas.' }
    }

    revalidatePath(`/app/${slug}/inventario`)
    revalidatePath(`/app/${slug}/pos`)
    return { success: true, archived: true }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: 'No se pudo eliminar el producto.' }
  }

  revalidatePath(`/app/${slug}/inventario`)
  revalidatePath(`/app/${slug}/pos`)
  return { success: true }
}
