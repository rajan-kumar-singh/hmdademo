import Cookies from 'js-cookie'

export default function getAuthToken(){
    return Cookies.get('token')
}