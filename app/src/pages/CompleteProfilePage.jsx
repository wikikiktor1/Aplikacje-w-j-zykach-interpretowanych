import React, { useState, useEffect } from 'react'
import { updateProfile, getProfile } from '../api/user'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function CompleteProfilePage() {
    const [form, setForm] = useState({ fullName: '', email: '', phone: '' })
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        if(user) {
            getProfile().then(data => {
                setForm({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || ''
                })
            }).catch(console.error)
        }
    }, [user])

    async function submit(e) {
        e.preventDefault()
        try {
            await updateProfile(form)
            alert("Dane zostały zapisane.")
            navigate('/')
        } catch (err) {
            setError(err.problem?.detail || err.message || 'Błąd zapisu')
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-info text-white">
                            <h4 className="mb-0">Uzupełnij swoje dane</h4>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small">
                                Aby móc składać zamówienia, prosimy o uzupełnienie danych kontaktowych.
                            </p>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label">Imię i Nazwisko</label>
                                    <input
                                        className="form-control"
                                        required
                                        value={form.fullName}
                                        onChange={e=>setForm({...form, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        value={form.email}
                                        onChange={e=>setForm({...form, email: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Telefon</label>
                                    <input
                                        className="form-control"
                                        required
                                        value={form.phone}
                                        onChange={e=>setForm({...form, phone: e.target.value})}
                                    />
                                </div>
                                <button className="btn btn-primary w-100">Zapisz i Przejdź do Sklepu</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}