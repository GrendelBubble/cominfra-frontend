import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

// Décodage du token JWT
export const decodeJWT = (token: string) => {
  try {
    const decoded = jwt_decode(token);
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

// Fonction pour obtenir le token à partir des cookies
export const getTokenFromCookies = () => {
  return Cookies.get('token');
};

// Fonction pour stocker le token dans les cookies
export const setTokenInCookies = (token: string) => {
  Cookies.set('token', token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',  // sécurisé en production
    sameSite: 'Lax',  // protège contre certaines attaques
  });
};

// Fonction pour supprimer le token des cookies
export const removeTokenFromCookies = () => {
  Cookies.remove('token');
};
