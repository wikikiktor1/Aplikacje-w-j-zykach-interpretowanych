import api from './client'

export function fetchCategories(){
    return api.get('/categories').then(r=>r.data)
}

export function createCategory(body){
    return api.post('/categories', body).then(r=>r.data)
}