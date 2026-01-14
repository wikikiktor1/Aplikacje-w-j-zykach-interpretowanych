import React from 'react'
import { useCart } from '../contexts/CartContext'
import { Link } from 'react-router-dom'
import { BiTrash, BiMinus, BiPlus, BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

export default function CartPage(){
    const { items, remove, changeQty, total } = useCart()

    if(items.length === 0) {
        return (
            <div className="text-center py-5">
                <h2 className="text-muted mb-4">Twój koszyk jest pusty</h2>
                <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">
                    <BiLeftArrowAlt className="me-2"/> Wróć do sklepu
                </Link>
            </div>
        )
    }

    return (
        <div className="container">
            <h2 className="mb-4 fw-bold border-bottom pb-2">Twój Koszyk</h2>
            <div className="row g-5">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4 py-3">Produkt</th>
                                        <th className="text-center">Ilość</th>
                                        <th className="text-end">Cena</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.map(it=> (
                                        <tr key={it.product._id}>
                                            <td className="ps-4 py-3">
                                                <span className="fw-bold text-dark">{it.product.name}</span>
                                                <div className="small text-muted">{it.product.price} PLN / szt.</div>
                                            </td>
                                            <td style={{width: '150px'}}>
                                                <div className="input-group input-group-sm bg-light rounded-pill border">
                                                    <button className="btn btn-link text-dark text-decoration-none" onClick={()=>changeQty(it.product._id, Math.max(1, it.qty-1))}><BiMinus/></button>
                                                    <input className="form-control text-center bg-transparent border-0 p-0" value={it.qty} readOnly style={{maxWidth: '40px'}} />
                                                    <button className="btn btn-link text-dark text-decoration-none" onClick={()=>changeQty(it.product._id, it.qty+1)}><BiPlus/></button>
                                                </div>
                                            </td>
                                            <td className="text-end fw-bold">{(it.product.price * it.qty).toFixed(2)} zł</td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-outline-danger btn-sm rounded-circle p-2" onClick={()=>remove(it.product._id)} title="Usuń">
                                                    <BiTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow border-0 bg-light">
                        <div className="card-body p-4">
                            <h4 className="card-title fw-bold mb-4">Podsumowanie</h4>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Wartość produktów:</span>
                                <span className="fw-bold">{total().toFixed(2)} PLN</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Dostawa:</span>
                                <span className="text-success fw-bold">Gratis</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 align-items-center">
                                <span className="fs-5">Do zapłaty:</span>
                                <span className="fs-3 fw-bold text-primary">{total().toFixed(2)} PLN</span>
                            </div>
                            <Link className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm d-flex justify-content-center align-items-center" to="/checkout">
                                Przejdź do dostawy <BiRightArrowAlt className="ms-2 fs-5"/>
                            </Link>
                            <Link to="/" className="btn btn-link text-muted w-100 mt-2 text-decoration-none">
                                Kontynuuj zakupy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}