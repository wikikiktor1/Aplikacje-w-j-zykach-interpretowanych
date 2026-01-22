import React, { useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import ClientOrdersPage from "./pages/ClientOrdersPage"
import ReviewsPage from "./pages/ReviewsPage" // <--- 1. IMPORT
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { useCart} from './contexts/CartContext'
import { BiStore, BiCart, BiLogOut, BiUser, BiLogIn, BiChevronDown, BiStar } from 'react-icons/bi' // <--- 2. Ikona gwiazdki

export default function App() {
    const { user, logout } = useAuth()
    const { items, clear } = useCart()
    const navigate = useNavigate()

    const [isNavExpanded, setIsNavExpanded] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleLogout = () => {
        setIsDropdownOpen(false);
        setIsNavExpanded(false);
        clear();
        logout();
        navigate('/');
    }

    const closeNav = () => setIsNavExpanded(false)
    const cartCount = items.reduce((acc, item) => acc + item.qty, 0)

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', zIndex: 1050 }}>
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center fw-bold text-uppercase spacing-1 text-white"
                          to="/" onClick={closeNav}>
                        <BiStore className="me-2 fs-3 text-info" />
                        <span style={{ letterSpacing: '1px' }}>Sklep</span>
                    </Link>

                    <button
                        className={`navbar-toggler border-0 ${!isNavExpanded ? 'collapsed' : ''}`}
                        type="button"
                        onClick={() => setIsNavExpanded(!isNavExpanded)}
                        aria-expanded={isNavExpanded}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse justify-content-end ${isNavExpanded ? 'show' : ''}`} id="navbarNav">
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0">

                            {/* --- 3. LINK DO OPINII --- */}
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center text-white-50 hover-text-white" to="/reviews" onClick={closeNav}>
                                        <BiStar className="me-1"/> Opinie
                                    </Link>
                                </li>
                            </ul>

                            <Link to="/cart" onClick={closeNav} className="position-relative btn btn-outline-light border-0 rounded-pill d-flex align-items-center justify-content-center px-3 py-2 hover-scale">
                                <BiCart className="fs-4" />
                                <span className="ms-2">Koszyk</span>
                                {cartCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info text-dark shadow-sm border border-light">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            <div className="vr text-white opacity-25 mx-1 d-none d-lg-block"></div>
                            <hr className="d-lg-none text-white opacity-25 my-1"/>

                            {user ? (
                                <div className="dropdown">
                                    <button className="btn btn-dark bg-opacity-25 border-0 rounded-pill d-flex align-items-center w-100 justify-content-between justify-content-lg-start px-3 py-2" type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                        <span className="d-flex align-items-center text-truncate" style={{maxWidth: '150px'}}>
                                            <BiUser className="me-2" />
                                            {user.sub || user.login || 'Konto'}
                                        </span>
                                        <BiChevronDown className={`ms-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 ${isDropdownOpen ? 'show' : ''}`}>
                                        <li><Link className="dropdown-item rounded py-2" to="/complete-profile" onClick={() => { closeNav(); setIsDropdownOpen(false); }}>Profil</Link></li>
                                        {user.role === 'KLIENT' && <li><Link className="dropdown-item rounded py-2" to="/my-orders" onClick={() => { closeNav(); setIsDropdownOpen(false); }}>Moje Zamówienia</Link></li>}
                                        {user.role === 'PRACOWNIK' && <li><Link className="dropdown-item rounded py-2 text-primary fw-bold" to="/admin" onClick={() => { closeNav(); setIsDropdownOpen(false); }}>Panel Admina</Link></li>}
                                        <li><hr className="dropdown-divider"/></li>
                                        <li><button onClick={handleLogout} className="dropdown-item rounded py-2 text-danger d-flex align-items-center"><BiLogOut className="me-2" /> Wyloguj</button></li>
                                    </ul>
                                </div>
                            ) : (
                                <Link to="/login" onClick={closeNav} className="btn btn-info fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center justify-content-center text-dark">
                                    <BiLogIn className="me-2" /> Zaloguj
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container pb-5 pt-4 flex-grow-1">
                <div className="fade-in-up">
                    <Routes>
                        <Route path="/" element={<ProductsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/reviews" element={<ReviewsPage />} /> {/* <--- 4. TRASA */}
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute roles={['PRACOWNIK']}><AdminPage /></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute><ClientOrdersPage /></ProtectedRoute>}/>
                    </Routes>
                </div>
            </main>

            <style>{`
                .hover-text-white:hover { color: #fff !important; }
            `}</style>
        </div>
    )
}