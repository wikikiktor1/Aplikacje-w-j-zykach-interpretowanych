import React, { useEffect, useState } from 'react'
import { fetchOrders, updateOrderStatus } from '../api/orders'
import api from '../api/client'
import { BiStar } from 'react-icons/bi'

export default function AdminPage() {
    const [orders, setOrders] = useState([])
    const [statuses, setStatuses] = useState([])
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => { loadStatuses(); loadOrders() }, [selectedStatusFilter])

    async function loadStatuses() {
        try {
            const res = await api.get('/status')
            setStatuses(res.data)
        } catch (err) { console.error("Błąd statusów", err) }
    }

    async function loadOrders() {
        try {
            let data;
            if (selectedStatusFilter) {
                const res = await api.get(`/orders/status/${selectedStatusFilter}`)
                data = res.data
            } else {
                data = await fetchOrders()
            }
            setOrders(data)
        } catch (err) { setError(err.problem?.detail || err.message) }
    }

    async function changeStatus(orderId, newStatusId) {
        try {
            await updateOrderStatus(orderId, { status: newStatusId })
            loadOrders()
        } catch (err) { alert("Błąd: " + (err.problem?.detail || err.message)) }
    }

    return (
        <div className="container">
            <h2 className="mb-4">Zarządzanie Zamówieniami</h2>

            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Filtruj po statusie:</label>
                    <select className="form-select" value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)}>
                        <option value="">-- Wszystkie --</option>
                        {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead className="table-dark">
                    <tr>
                        <th>Data</th>
                        <th>Klient</th>
                        <th>Status</th>
                        <th style={{minWidth: '200px'}}>Opinia Klienta</th>
                        <th>Akcja</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(o => {
                        const clientReview = (o.opinions && o.opinions.length > 0) ? o.opinions[0] : null;

                        return (
                            <tr key={o._id}>
                                <td>{o.approvedAt ? new Date(o.approvedAt).toLocaleDateString() : 'Nowe'}</td>
                                <td>{o.userName}<br/><small className="text-muted">{o.email}</small></td>
                                <td><span className="badge bg-info text-dark">{o.status?.name}</span></td>

                                <td>
                                    {clientReview ? (
                                        <div className="small border rounded p-2 bg-white">
                                            <div className="text-warning fw-bold">
                                                {clientReview.rating}/5 <BiStar/>
                                            </div>
                                            <div className="text-dark fst-italic">"{clientReview.content}"</div>
                                            <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                                {new Date(clientReview.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted small">- brak -</span>
                                    )}
                                </td>

                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{width: 'auto'}}
                                        onChange={(e) => changeStatus(o._id, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Zmień status...</option>
                                        {statuses.map(s => (
                                            <option key={s._id} value={s._id} disabled={s._id === o.status?._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    )
}