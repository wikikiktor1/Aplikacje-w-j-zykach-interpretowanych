import React, { useEffect, useState } from 'react'
import { fetchPublicReviews } from '../api/orders'
import { Link } from 'react-router-dom'
import { BiStar, BiMessageDetail, BiLoaderAlt, BiUserCircle, BiPurchaseTag } from 'react-icons/bi'

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const data = await fetchPublicReviews()
            setReviews(data)
        } catch (err) {
            console.error("Błąd:", err)
            setError("Nie udało się pobrać opinii. Spróbuj odświeżyć stronę.")
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <BiStar key={i} className={i < rating ? "text-warning" : "text-muted opacity-25"} />
        ))
    }

    if (loading) return (
        <div className="text-center py-5 container">
            <BiLoaderAlt className="display-4 text-primary spin-animation mb-3"/>
            <p className="text-muted">Pobieranie opinii...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin-animation { animation: spin 1s linear infinite; }`}</style>
        </div>
    )

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h2 className="fw-bold mb-2">Opinie Klientów</h2>
                <p className="text-muted">Zobacz, co inni sądzą o zakupach w naszym sklepie</p>
            </div>

            {error ? (
                <div className="alert alert-danger text-center mx-auto" style={{maxWidth: '600px'}}>
                    {error}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-5">
                    <BiMessageDetail className="display-1 text-muted opacity-25 mb-3" />
                    <h3>Brak opinii</h3>
                    <p className="text-muted">Bądź pierwszy i podziel się opinią po zakupach!</p>
                    <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">Idź na zakupy</Link>
                </div>
            ) : (
                <div className="row g-4 masonry-grid">
                    {reviews.map((rev, idx) => (
                        <div className="col-md-6 col-lg-4" key={idx}>
                            <div className="card border-0 shadow-sm h-100 hover-shadow transition-all">
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2">
                                                <BiUserCircle size={24}/>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold small">{rev.author}</h6>
                                                <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="text-warning d-flex fs-5">
                                            {renderStars(rev.rating)}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <i className="text-muted opacity-50 me-1">"</i>
                                        <span className="fst-italic text-dark">{rev.content}</span>
                                        <i className="text-muted opacity-50 ms-1">"</i>
                                    </div>

                                    {rev.items && rev.items.length > 0 && (
                                        <div className="mt-auto pt-3 border-top">
                                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Kupione produkty:</small>
                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                {rev.items.slice(0, 3).map((it, i) => (
                                                    <span key={i} className="badge bg-light text-dark border fw-normal text-truncate" style={{maxWidth: '100%'}}>
                                                        <BiPurchaseTag className="me-1 text-muted"/>
                                                        {it.name}
                                                    </span>
                                                ))}
                                                {rev.items.length > 3 && (
                                                    <span className="badge bg-light text-muted border fw-normal">+{rev.items.length - 3} więcej</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    )
}