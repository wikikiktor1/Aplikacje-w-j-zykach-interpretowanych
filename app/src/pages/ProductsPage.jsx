import React, {useEffect, useRef, useState} from 'react'
import { fetchProducts, updateProduct, getSeoDescription, createProduct, deleteProduct, initializeDatabase } from '../api/products'
import { fetchCategories } from '../api/categories'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
// Dodano BiMessageDetail do ikon
import { BiCartAdd, BiEdit, BiSearch, BiPurchaseTag, BiTrash, BiCloudUpload, BiChevronDown, BiChevronUp, BiStar, BiMessageDetail, BiX } from 'react-icons/bi'

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])

    const [filterName, setFilterName] = useState('')
    const [filterCat, setFilterCat] = useState('')

    const [editId, setEditId] = useState(null)
    const [editForm, setEditForm] = useState({})

    const [isGenerating, setIsGenerating] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newProd, setNewProd] = useState({ name: '', description: '', price: '', weight: '', category: '' })

    const [expandedDescriptions, setExpandedDescriptions] = useState({})

    // --- NOWY STAN: Produkt wybrany do podglądu opinii ---
    const [viewReviewsProduct, setViewReviewsProduct] = useState(null)

    const { add } = useCart()
    const { isEmployee } = useAuth()

    const fileInputRef = useRef(null)

    useEffect(() => {
        loadData()
    }, [filterName, filterCat])

    async function loadData() {
        try {
            const cats = await fetchCategories()
            setCategories(cats)
            const prods = await fetchProducts({ search: filterName, categoryId: filterCat })
            setProducts(prods)
        } catch (err) {
            console.error(err)
        }
    }

    const toggleExpand = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // --- POMOCNIK: Renderowanie gwiazdek ---
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <BiStar key={i} className={i < Math.round(rating) ? "text-warning" : "text-muted opacity-25"} />
        ));
    }

    const getProductRating = (p) => {
        if (p.averageRating) return p.averageRating;
        if (p.opinions && p.opinions.length > 0) {
            const sum = p.opinions.reduce((acc, curr) => acc + curr.rating, 0);
            return sum / p.opinions.length;
        }
        return 0;
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            if (!newProd.category) return alert("Wybierz kategorię!")
            await createProduct({ ...newProd, price: parseFloat(newProd.price), weight: parseFloat(newProd.weight) })
            alert("Produkt dodany!")
            setNewProd({ name: '', description: '', price: '', weight: '', category: '' })
            setShowCreateForm(false)
            loadData()
        } catch (err) {
            alert("Błąd dodawania: " + (err.problem?.detail || err.message))
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const content = event.target.result
                let data
                try { data = JSON.parse(content) } catch (jsonErr) { throw new Error("Plik nie zawiera poprawnego formatu JSON.") }
                if (!Array.isArray(data)) throw new Error("Dane muszą być tablicą produktów (Array).")
                const isValidStructure = data.every(item => item.name && item.price)
                if (!isValidStructure) throw new Error("Produkty muszą mieć nazwę i cenę.")
                if (window.confirm(`Znaleziono ${data.length} produktów. Czy zainicjalizować bazę?`)) {
                    setIsInitializing(true)
                    await initializeDatabase(data)
                    alert("Baza zainicjalizowana pomyślnie!")
                    await loadData()
                }
            } catch (err) { alert("Błąd: " + (err.message || "Wystąpił problem")) } finally { setIsInitializing(false); if(fileInputRef.current) fileInputRef.current.value = "" }
        }
        reader.readAsText(file)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz trwale usunąć ten produkt?")) return
        try { await deleteProduct(id); alert("Produkt został usunięty."); loadData() } catch (err) { alert("Błąd usuwania: " + (err.problem?.detail || err.message)) }
    }

    const startEdit = (product) => {
        setEditId(product._id)
        setEditForm({ name: product.name, description: product.description, price: product.price, weight: product.weight, category: product.category?._id || product.category })
    }

    const saveEdit = async () => {
        try { await updateProduct(editId, editForm); setEditId(null); loadData(); alert("Produkt zaktualizowany!") } catch (err) { alert("Błąd aktualizacji: " + (err.problem?.detail || err.message)) }
    }

    const handleOptimize = async (productId) => {
        if(!confirm("Czy na pewno chcesz zastąpić obecny opis wersją wygenerowaną przez AI?")) return;
        setIsGenerating(true)
        try {
            const response = await getSeoDescription(productId)
            const newDescription = response.seoDescriptionHTML || response.seoDescription || response.html || "";
            if (!newDescription) { alert("Serwer zwrócił pusty opis. Sprawdź backend."); return; }
            setEditForm(prev => ({ ...prev, description: newDescription }));
        } catch (err) { alert("Błąd: " + (err.problem?.detail || err.message)) } finally { setIsGenerating(false) }
    }

    const isDatabaseEmpty = products.length === 0 && !filterName && !filterCat;

    return (
        <div className="container position-relative">
            {viewReviewsProduct && (
                <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">
                                    Opinie: {viewReviewsProduct.name}
                                </h5>
                                <button type="button" className="btn-close" onClick={()=>setViewReviewsProduct(null)}></button>
                            </div>
                            <div className="modal-body p-4" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                                <div className="d-flex align-items-center mb-4">
                                    <h2 className="mb-0 me-3 fw-bold text-primary display-4">
                                        {getProductRating(viewReviewsProduct).toFixed(1)}
                                    </h2>
                                    <div>
                                        <div className="fs-5 text-warning">
                                            {renderStars(getProductRating(viewReviewsProduct))}
                                        </div>
                                        <div className="text-muted small">
                                            Na podstawie {viewReviewsProduct.opinions?.length || 0} opinii
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                                {(!viewReviewsProduct.opinions || viewReviewsProduct.opinions.length === 0) ? (
                                    <div className="text-center py-4 text-muted">
                                        <BiMessageDetail className="fs-1 mb-2 opacity-25"/>
                                        <p>Ten produkt nie ma jeszcze opinii. Bądź pierwszy!</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {viewReviewsProduct.opinions.map((op, idx) => (
                                            <div key={idx} className="card border-0 bg-light rounded-3">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <div className="text-warning">
                                                            {renderStars(op.rating)}
                                                        </div>
                                                        <small className="text-muted">
                                                            {op.createdAt ? new Date(op.createdAt).toLocaleDateString() : 'Nieznana data'}
                                                        </small>
                                                    </div>
                                                    <p className="mb-0 fst-italic">"{op.content}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={()=>setViewReviewsProduct(null)}>Zamknij</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-md-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1">Nasze Produkty</h2>
                    <p className="text-muted">Znajdź to, czego szukasz w najlepszych cenach.</p>
                </div>
                {isEmployee && !isDatabaseEmpty && (
                    <button className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-success'} shadow-sm rounded-pill px-4`} onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? 'Anuluj' : '+ Nowy Produkt'}
                    </button>
                )}
            </div>

            {showCreateForm && isEmployee && (
                <div className="card shadow mb-5 border-0 bg-light">
                    <div className="card-body p-4">
                        <h5 className="mb-3 text-success">Dodaj nowy produkt</h5>
                        <form onSubmit={handleCreate}>
                            <div className="row g-2">
                                <div className="col-md-3"><input className="form-control" placeholder="Nazwa" value={newProd.name} onChange={e=>setNewProd({...newProd, name: e.target.value})} required /></div>
                                <div className="col-md-2"><input type="number" step="0.01" className="form-control" placeholder="Cena" value={newProd.price} onChange={e=>setNewProd({...newProd, price: e.target.value})} required /></div>
                                <div className="col-md-2"><input type="number" step="0.01" className="form-control" placeholder="Waga" value={newProd.weight} onChange={e=>setNewProd({...newProd, weight: e.target.value})} required /></div>
                                <div className="col-md-3">
                                    <select className="form-select" value={newProd.category} onChange={e=>setNewProd({...newProd, category: e.target.value})} required>
                                        <option value="">-- Kategoria --</option>
                                        {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-2"><button className="btn btn-primary w-100">Zapisz</button></div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!isDatabaseEmpty && (
                <div className="row g-3 mb-5 justify-content-center">
                    <div className="col-md-5">
                        <div className="input-group input-group-lg shadow-sm">
                            <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch/></span>
                            <input className="form-control border-start-0 ps-0" placeholder="Czego szukasz?" value={filterName} onChange={e=>setFilterName(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select form-select-lg shadow-sm text-muted" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                            <option value="">Wszystkie kategorie</option>
                            {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {isDatabaseEmpty ? (
                <div className="text-center py-5">
                    <div className="mb-4"><BiPurchaseTag className="display-1 text-muted opacity-25" /></div>
                    <h3 className="text-muted fw-bold mb-3">Baza danych produktów jest pusta</h3>
                    {isEmployee ? (
                        <div className="col-md-6 mx-auto mt-4">
                            <div className="card border-dashed border-2 bg-light">
                                <div className="card-body py-5">
                                    <h5 className="mb-3 text-primary">Inicjalizacja Bazy Danych</h5>
                                    <p className="small text-muted mb-4">Wgraj plik JSON z listą produktów.</p>
                                    <input type="file" accept=".json" className="d-none" ref={fileInputRef} onChange={handleFileChange} />
                                    <button className="btn btn-primary btn-lg shadow-sm" onClick={() => fileInputRef.current.click()} disabled={isInitializing}>
                                        {isInitializing ? 'Ładowanie...' : <><BiCloudUpload className="me-2"/> Wgraj Plik JSON</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : ( <p className="text-muted">Prosimy o cierpliwość, administrator wkrótce doda produkty.</p> )}
                </div>
            ) : (
                <div className="row g-4">
                    {products.length === 0 && (filterName || filterCat) && (
                        <div className="text-center py-5 text-muted w-100"><h3>Brak wyników wyszukiwania.</h3></div>
                    )}

                    {products.map(p => {
                        const isEditing = editId === p._id;
                        const safeDescription = p.description || "";
                        const isExpanded = expandedDescriptions[p._id];
                        const isLongDescription = safeDescription.length > 100;

                        const rating = getProductRating(p);
                        const reviewsCount = p.opinions ? p.opinions.length : 0;

                        if (isEditing) {
                            return (
                                <div className="col-12" key={p._id}>
                                    <div className="card shadow border-primary border-2">
                                        <div className="card-body">
                                            <h5 className="card-title text-primary mb-3">Edycja: {p.name}</h5>
                                            <div className="row g-3">
                                                <div className="col-md-4"><label className="small text-muted">Nazwa</label><input className="form-control" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} /></div>
                                                <div className="col-md-2"><label className="small text-muted">Cena</label><input className="form-control" type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} /></div>
                                                <div className="col-md-2"><label className="small text-muted">Waga</label><input className="form-control" type="number" value={editForm.weight} onChange={e=>setEditForm({...editForm, weight: e.target.value})} /></div>
                                                <div className="col-md-4"><label className="small text-muted">Kategoria</label><select className="form-select" value={editForm.category} onChange={e=>setEditForm({...editForm, category: e.target.value})}>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                                <div className="col-12"><label className="small text-muted">Opis</label><textarea className="form-control mb-2" rows="3" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} /><button className="btn btn-sm btn-outline-info" onClick={()=>handleOptimize(p._id)} disabled={isGenerating}>{isGenerating ? 'Generowanie...' : '✨ Ulepsz opis z AI'}</button></div>
                                                <div className="col-12 d-flex gap-2 justify-content-end"><button className="btn btn-secondary" onClick={()=>setEditId(null)}>Anuluj</button><button className="btn btn-success px-4" onClick={saveEdit}>Zapisz Zmiany</button></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div className="col-sm-6 col-lg-4 col-xl-3" key={p._id}>
                                <div className="card h-100 shadow-hover border-0 overflow-hidden" style={{transition: 'transform 0.2s, box-shadow 0.2s'}}>
                                    <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{height: '200px'}}>
                                        <BiPurchaseTag className="display-1 text-muted opacity-25" />

                                        <div className="position-absolute top-0 start-0 m-3">
                                            <span className="badge bg-white text-dark shadow-sm border rounded-pill">
                                                {p.category?.name || 'Inne'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title fw-bold text-dark mb-0 text-truncate">{p.name}</h5>
                                            <span className="fw-bold text-success fs-5 text-nowrap">{parseFloat(p.price).toFixed(2)} zł</span>
                                        </div>

                                        <div className="d-flex align-items-center mb-3 cursor-pointer"
                                             onClick={() => setViewReviewsProduct(p)}
                                             style={{cursor: 'pointer'}}
                                             title="Kliknij, aby zobaczyć opinie">
                                            <div className="d-flex text-warning small me-2">
                                                {renderStars(rating)}
                                            </div>
                                            <span className="small text-muted text-decoration-underline-hover">
                                                ({reviewsCount} opinii)
                                            </span>
                                        </div>

                                        <div className="card-text text-muted small mb-4 flex-grow-1">
                                            <div dangerouslySetInnerHTML={{
                                                __html: isExpanded
                                                    ? safeDescription
                                                    : (safeDescription.substring(0, 100) + (isLongDescription ? '...' : ''))
                                            }} />
                                            {isLongDescription && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(p._id); }}
                                                    className="btn btn-link p-0 text-decoration-none small d-flex align-items-center mt-1"
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    {isExpanded ? <>Zwiń <BiChevronUp className="ms-1"/></> : <>Czytaj więcej <BiChevronDown className="ms-1"/></>}
                                                </button>
                                            )}
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2" onClick={()=>add(p)}>
                                                <BiCartAdd className="fs-5"/> Do koszyka
                                            </button>
                                            {isEmployee && (
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={()=>startEdit(p)}>
                                                        <BiEdit /> Edytuj
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(p._id)} title="Usuń produkt">
                                                        <BiTrash />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <style>{`
                .border-dashed { border-style: dashed !important; }
                .shadow-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                .text-decoration-underline-hover:hover {
                    text-decoration: underline;
                    color: #0d6efd !important;
                }
            `}</style>
        </div>
    )
}