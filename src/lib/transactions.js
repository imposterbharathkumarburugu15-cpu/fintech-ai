// src/lib/transactions.js
// DATA LAYER for transactions. All transaction DB access goes through here.

import { supabase } from '../supabaseClient'

// Storage model: amount ALWAYS positive, type 'debit'|'credit'.
// UI adds sign + color. We convert at this boundary.

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addTransaction(tx) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const row = {
    user_id: user.id,
    amount: Math.abs(Number(tx.amount)),
    type: tx.type,
    merchant: tx.merchant ?? null,
    category: tx.category ?? null,
    source: tx.source ?? 'manual',
    raw_text: tx.raw_text ?? null,
    ...(tx.occurred_at ? { occurred_at: tx.occurred_at } : {}),
  }
  const { data, error } = await supabase
    .from('transactions').insert(row).select().single()
  if (error) throw error
  return data
}

export async function addTransactionsBulk(txs) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const rows = txs.map((tx) => ({
    user_id: user.id,
    amount: Math.abs(Number(tx.amount)),
    type: tx.type,
    merchant: tx.merchant ?? null,
    category: tx.category ?? null,
    source: tx.source ?? 'upload',
    raw_text: tx.raw_text ?? null,
    ...(tx.occurred_at ? { occurred_at: tx.occurred_at } : {}),
  }))
  const { data, error } = await supabase.from('transactions').insert(rows).select()
  if (error) throw error
  return data
}

// Summary for the three top cards + category breakdown bars.
export function computeSummary(transactions) {
  const now = new Date()
  const m = now.getMonth(), y = now.getFullYear()
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.occurred_at)
    return d.getMonth() === m && d.getFullYear() === y
  })
  const spends = monthTx.filter((t) => t.type === 'debit')
  const totalSpent = spends.reduce((s, t) => s + Number(t.amount), 0)

  const byCategory = {}
  for (const t of spends) {
    const c = t.category || 'Other'
    byCategory[c] = (byCategory[c] || 0) + Number(t.amount)
  }
  let topCategory = null, topCategoryAmount = 0
  for (const [c, amt] of Object.entries(byCategory)) {
    if (amt > topCategoryAmount) { topCategory = c; topCategoryAmount = amt }
  }
  const topCategoryPct = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0
  const dayOfMonth = now.getDate()
  const avgDaily = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0

  const breakdown = Object.entries(byCategory)
    .map(([name, amount]) => ({
      name, amount,
      percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.amount - a.amount)

  return { totalSpent, topCategory, topCategoryPct, avgDaily, count: monthTx.length, breakdown }
}

export const CATEGORY_COLORS = {
  Technology: '#3b82f6',
  Groceries: '#22c55e',
  Entertainment: '#8b5cf6',
  Transportation: '#f59e0b',
  Income: '#22c55e',
  Dining: '#ef4444',
  Housing: '#06b6d4',
  Other: '#71717a',
}
