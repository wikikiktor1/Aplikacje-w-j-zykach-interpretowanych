import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../api/orders'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProfile } from '../api/user'

export default function CheckoutPage(){
    const { items, total, clear, changeQty, remove } = useCart()
    const { user } = useAuth()
    const [form, setForm] = useState({ userName:'', email:'', phone:'' })
    const [errors, setErrors] = useState(null)
    const [serverError, setServerError] = useState(null)
    const nav = useNavigate()

    useEffect(() => {
        if (user) {
            getProfile()
                .then(data => {
                    setForm({
                        userName: data.fullName || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    })
                })
                .catch(err => console.error("Nie udało się pobrać danych profilu", err))
        }
    }, [user])

    function validate(){
        const e = {}
        if(!form.userName) e.userName = 'Nazwa wymagana'
        if(!form.email || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Nieprawidłowy email'
        if(!form.phone || !/^\d+$/.test(form.phone)) e.phone = 'Numer telefonu nieprawidłowy (tylko cyfry)'
        if(items.length===0) e.items = 'Koszyk jest pusty'
        return e
    }

    async function submit(e){
        e.preventDefault()
        const eobj = validate()
        if(Object.keys(eobj).length){ setErrors(eobj); return }
        try{
            const body = {
                userName: form.userName,
                email: form.email,
                phone: form.phone,
                items: items.map(it=>({
                    product: it.product._id,
                    quantity: it.qty,
                    price: it.product.price
                }))
            }
            await createOrder(body)
            clear()
            nav('/')
        }catch(err){
            if(err.problem){
                setServerError(err.problem.detail || err.problem.title)
            }else{
                setServerError(err.message)
            }
        }
    }

    return (
        <div>
            <h1>Składanie zamówienia</h1>
            {serverError && <div className="alert alert-danger">{serverError}</div>}
            <div className="row">
                <div className="col-md-7">
                    <table className="table">
                        <thead><tr><th>Nazwa</th><th>Ilość</th><th>Cena</th><th></th></tr></thead>
                        <tbody>
                        {items.map(it=> (
                            <tr key={it.product._id}>
                                <td>{it.product.name}</td>
                                <td>
                                    <div className="input-group input-group-sm" style={{width:120}}>
                                        <button className="btn btn-outline-secondary" onClick={()=>changeQty(it.product._id, Math.max(1, it.qty-1))}>-</button>
                                        <input className="form-control text-center" value={it.qty} readOnly />
                                        <button className="btn btn-outline-secondary" onClick={()=>changeQty(it.product._id, it.qty+1)}>+</button>
                                    </div>
                                </td>
                                <td>{(it.product.price * it.qty).toFixed(2)} PLN</td>
                                <td><button className="btn btn-danger btn-sm" onClick={()=>remove(it.product._id)}>Usuń</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-md-5">
                    <form onSubmit={submit}>
                        <div className="mb-3">
                            <label className="form-label">Nazwa</label>
                            <input className={`form-control ${errors?.userName? 'is-invalid':''}`} value={form.userName} onChange={e=>setForm({...form,userName:e.target.value})} />
                            <div className="invalid-feedback">{errors?.userName}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input className={`form-control ${errors?.email? 'is-invalid':''}`} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                            <div className="invalid-feedback">{errors?.email}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Telefon</label>
                            <input className={`form-control ${errors?.phone? 'is-invalid':''}`} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                            <div className="invalid-feedback">{errors?.phone}</div>
                        </div>
                        <h4>Razem: {total().toFixed(2)} PLN</h4>
                        <button className="btn btn-success w-100" type="submit">Wyślij zamówienie</button>
                    </form>
                </div>
            </div>
        </div>
    )
}