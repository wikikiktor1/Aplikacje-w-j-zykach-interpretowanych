import React, { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext()

export function useCart(){ return useContext(CartContext) }

export function CartProvider({ children }){
  const [items, setItems] = useState(() => {
    try{
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    }catch(e){ return [] }
  })

  useEffect(()=>{
    localStorage.setItem('cart', JSON.stringify(items))
  },[items])

  function add(product, qty=1){
    setItems(prev=>{
      const found = prev.find(p=>p.product._id===product._id)
      if(found){
        return prev.map(p=>p.product._id===product._id?{...p, qty: p.qty+qty}:p)
      }
      return [...prev, { product, qty }]
    })
  }
  function remove(productId){
    setItems(prev=>prev.filter(p=>p.product._id!==productId))
  }
  function changeQty(productId, qty){
    setItems(prev=>prev.map(p=>p.product._id===productId?{...p, qty}:p))
  }
  function clear(){ setItems([]) }
  function total(){
    return items.reduce((s,it)=> s + (it.product.price || 0) * it.qty, 0)
  }

  return (
    <CartContext.Provider value={{ items, add, remove, changeQty, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}

