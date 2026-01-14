import React, { useEffect, useState } from 'react'
import { fetchMyOrders, addOrderReview } from '../api/orders'
import { BiMessageSquareDetail, BiStar, BiCheckCircle } from 'react-icons/bi'

export default function ClientOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const [reviewTarget, setReviewTarget] = useState(null)
    const [reviewForm, setReviewForm] = useState({rating: 5, content: ''})

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        try {
            const data = await fetchMyOrders()
            setOrders(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmitReview(e) {
        e.preventDefault()
        try {
            await addOrderReview(reviewTarget, reviewForm)
            alert("Dziękujemy za opinię!")
            setReviewTarget(null)
            setReviewForm({rating: 5, content: ''})
            await loadOrders()
        } catch (err) {
            alert("Błąd: " + (err.problem?.detail || err.message))
        }
    }

    if (loading) return <div className="text-center mt-5">Ładowanie...</div>

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Moje Zamówienia</h2>
            {orders.length === 0 && <p className="text-muted">Nie złożyłeś jeszcze żadnych zamówień.</p>}

            <div className="row g-4">
                {orders.map(o => {
                    const statusName = o.status?.name?.toUpperCase() || '';
                    const isCompleted = ['ZREALIZOWANE', 'COMPLETED'].includes(statusName);
                    const isCancelled = ['ANULOWANE', 'CANCELLED'].includes(statusName);
                    const dateDisplay = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Brak daty';

                    // POPRAWKA: Pobieramy opinię z tablicy opinions (pierwszy element)
                    const userReview = (o.opinions && o.opinions.length > 0) ? o.opinions[0] : null;

                    return (
                        <div className="col-12" key={o._id}>
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Zamówienie #{o._id.slice(-6)}</strong>
                                        <br/><small className="text-muted">{dateDisplay}</small>
                                    </div>
                                    <span className={`badge ${isCompleted ? 'bg-success' : 'bg-secondary'}`}>
                                        {o.status?.name || 'W trakcie'}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p>Kwota: <strong>{o.items?.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)} PLN</strong></p>
                                    <hr/>

                                    {/* Logika wyświetlania opinii */}
                                    {userReview ? (
                                        <div className="bg-light p-3 rounded">
                                            <h6 className="text-success"><BiCheckCircle/> Twoja opinia:</h6>
                                            <div className="text-warning mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <BiStar key={i} className={i < userReview.rating ? "text-warning" : "text-muted"}/>
                                                ))}
                                                <span className="ms-2 text-dark fw-bold">{userReview.rating}/5</span>
                                            </div>
                                            <p className="mb-0 small fst-italic">"{userReview.content}"</p>
                                            <small className="text-muted" style={{fontSize: '0.7em'}}>
                                                Dodano: {new Date(userReview.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ) : (
                                        (isCompleted || isCancelled) ? (
                                            reviewTarget === o._id ? (
                                                <form onSubmit={handleSubmitReview} className="bg-light p-3 rounded border border-primary">
                                                    <h6 className="mb-3">Dodaj opinię</h6>
                                                    <div className="mb-3">
                                                        <label className="form-label small">Ocena (1-5)</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={reviewForm.rating}
                                                            onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                                                        >
                                                            <option value="5">5 - Rewelacja</option>
                                                            <option value="4">4 - Dobrze</option>
                                                            <option value="3">3 - Przeciętnie</option>
                                                            <option value="2">2 - Słabo</option>
                                                            <option value="1">1 - Tragicznie</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label small">Treść opinii</label>
                                                        <textarea
                                                            className="form-control form-control-sm"
                                                            rows="2"
                                                            required
                                                            value={reviewForm.content}
                                                            onChange={e => setReviewForm({...reviewForm, content: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-sm btn-primary">Wyślij opinię</button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setReviewTarget(null)}>Anuluj</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => setReviewTarget(o._id)}>
                                                    <BiMessageSquareDetail className="me-2"/> Oceń obsługę
                                                </button>
                                            )
                                        ) : (
                                            <small className="text-muted">Ocena możliwa po zakończeniu zamówienia.</small>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}