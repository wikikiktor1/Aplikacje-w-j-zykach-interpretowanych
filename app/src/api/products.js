import api from './client'

export function fetchProducts(params){
    return api.get('/products', { params }).then(r=>r.data)
}
export function fetchProduct(id){
    return api.get(`/products/${id}`).then(r=>r.data)
}
export function createProduct(body){
    return api.post('/products', body).then(r=>r.data)
}
export function updateProduct(id, body){
    return api.put(`/products/${id}`, body).then(r=>r.data)
}
export function initProducts(body, headers){
    return api.post('/products/init', body, { headers }).then(r=>r.data)
}
export function getSeoDescription(id) {
    return api.get(`/products/${id}/seo-description`).then(r => r.data)
}
export function deleteProduct(id){
    return api.delete(`/products/${id}`).then(r=>r.data)
}
export const initializeDatabase = async (productsData) => {
    const res = await api.post('/init', productsData)
    return res.data
}