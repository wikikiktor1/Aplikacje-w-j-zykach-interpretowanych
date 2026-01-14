import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { BiUser, BiLockAlt, BiLogInCircle, BiUserPlus } from 'react-icons/bi'

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({ login: '', password: '' })
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    const { login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/";

    async function submit(e) {
        e.preventDefault();
        setError(null); setSuccessMsg(null);
        try {
            if (isRegister) {
                await register(form.login, form.password)
                setSuccessMsg("Konto założone! Możesz się teraz zalogować.")
                setIsRegister(false)
                setForm({ login: '', password: '' })
            } else {
                await login(form.login, form.password)
                navigate(from, { replace: true })
            }
        } catch (err) {
            setError(err.problem?.detail || err.message || "Błąd logowania")
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center" style={{minHeight: '80vh'}}>
            <div className="col-md-5 col-lg-4">
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                    <div className={`p-5 text-center text-white ${isRegister ? 'bg-success' : 'bg-primary'}`}
                         style={{background: isRegister
                                 ? 'linear-gradient(135deg, #198754 0%, #20c997 100%)'
                                 : 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)'}}>
                        <div className="mb-3">
                            {isRegister ? <BiUserPlus size={50}/> : <BiLogInCircle size={50}/>}
                        </div>
                        <h3 className="fw-bold mb-0">{isRegister ? 'Rejestracja' : 'Witaj ponownie'}</h3>
                        <p className="opacity-75 small">
                            {isRegister ? 'Stwórz darmowe konto klienta' : 'Zaloguj się, aby kontynuować zakupy'}
                        </p>
                    </div>

                    <div className="card-body p-4 p-md-5 bg-white">
                        {error && <div className="alert alert-danger d-flex align-items-center"><BiLockAlt className="me-2"/> {error}</div>}
                        {successMsg && <div className="alert alert-success">{successMsg}</div>}

                        <form onSubmit={submit}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text" className="form-control rounded-3" id="loginInput" placeholder="Login"
                                    value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} required
                                />
                                <label htmlFor="loginInput" className="text-muted">Nazwa użytkownika</label>
                            </div>
                            <div className="form-floating mb-4">
                                <input
                                    type="password" className="form-control rounded-3" id="passInput" placeholder="Hasło"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                                />
                                <label htmlFor="passInput" className="text-muted">Hasło</label>
                            </div>

                            <button className={`btn btn-lg w-100 rounded-3 py-3 fw-bold shadow-sm text-white ${isRegister ? 'btn-success' : 'btn-primary'}`}
                                    style={{transition: 'all 0.3s'}}>
                                {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
                            </button>
                        </form>
                    </div>

                    <div className="card-footer bg-light text-center py-3 border-0">
                        <button className="btn btn-link text-decoration-none text-muted" onClick={() => { setIsRegister(!isRegister); setError(null); }}>
                            {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}