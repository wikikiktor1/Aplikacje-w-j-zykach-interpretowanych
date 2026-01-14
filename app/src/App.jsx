import React from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { useCart } from './contexts/CartContext'
import { BiStore, BiCart, BiLogOut, BiUser, BiLogIn } from 'react-icons/bi'
import ClientOrdersPage from "./pages/ClientOrdersPage";

export default function App() {
    const { user, logout } = useAuth()
    const { items } = useCart()
    const navigate = useNavigate()
    const location = useLocation()
    const handleLogout = () => { logout(); navigate('/'); }

    const cartCount = items.reduce((acc, item) => acc + item.qty, 0)

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm"
                 style={{ background: 'linear-gradient(90deg, #1a202c 0%, #2d3748 100%)' }}>
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center fw-bold text-uppercase spacing-1" to="/">
                        <BiStore className="me-2 fs-4 text-info" /> Sklep
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <div className="d-flex gap-3 align-items-center">
                            <Link to="/cart" className="position-relative btn btn-outline-light border-0 d-flex align-items-center">
                                <BiCart className="fs-4" />
                                <span className="ms-1 d-none d-md-inline">Koszyk</span>
                                {cartCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <div className="vr text-white opacity-25 mx-1"></div>

                            {user ? (
                                <div className="dropdown">
                                    <button className="btn btn-outline-info dropdown-toggle border-0" type="button" data-bs-toggle="dropdown">
                                        <BiUser className="me-1" /> {user.sub || user.login || 'Konto'}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                        <li><Link className="dropdown-item" to="/complete-profile">Profil</Link></li>
                                        {user.role === 'PRACOWNIK' && (
                                            <li><Link className="dropdown-item text-primary" to="/admin">Panel Admina</Link></li>
                                        )}
                                        {user.role === 'KLIENT' && (
                                            <li><Link className="dropdown-item" to="/my-orders">Moje Zamówienia</Link></li>
                                        )}
                                        <li><hr className="dropdown-divider"/></li>
                                        <li>
                                            <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center">
                                                <BiLogOut className="me-2" /> Wyloguj
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <Link to="/login" className="btn btn-primary px-4 rounded-pill shadow-sm d-flex align-items-center">
                                    <BiLogIn className="me-2" /> Zaloguj
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container py-5 flex-grow-1">
                <div className="fade-in-up">
                    <Routes>
                        <Route path="/" element={<ProductsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute roles={['PRACOWNIK']}><AdminPage /></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute><ClientOrdersPage /></ProtectedRoute>}/>
                    </Routes>
                </div>
            </main>
        </div>
    )
}