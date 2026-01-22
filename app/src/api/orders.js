import api from './client'
export function createOrder(body){
  return api.post('/orders', body).then(r=>r.data)
}
export function fetchOrders(params){
  return api.get('/orders', { params }).then(r=>r.data)
}
export function updateOrderStatus(id, body){
  return api.patch(`/orders/${id}`, body).then(r=>r.data)
}
export const fetchMyOrders = async () => {
  const res = await api.get('/orders')
  return res.data
}
export const addOrderReview = async (orderId, reviewData) => {
  const res = await api.post(`/orders/${orderId}/opinions`, reviewData)
  return res.data
}
export function fetchPublicReviews() {
  return api.get('/orders/opinions').then(r => r.data)
}