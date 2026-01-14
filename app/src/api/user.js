import api from './client'

export function getProfile() {
    return api.get('/me').then(r => r.data)
}

export function updateProfile(data) {
    return api.put('/me', data).then(r => r.data)
}