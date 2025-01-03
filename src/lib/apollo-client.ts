import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// 1. Définir la connexion HTTP vers votre serveur GraphQL
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // Endpoint GraphQL
  credentials: 'include', // Inclut les cookies avec les requêtes
});

// 2. Créer un lien d'authentification (si nécessaire)
const authLink = setContext((_, { headers }) => {
  // Vérifier si nous sommes côté client (navigateur)
  let tokenValue = null;
  if (typeof window !== 'undefined') {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    tokenValue = token ? token.split('=')[1] : null;
  }

  return {
    headers: {
      ...headers,
      Authorization: tokenValue ? `Bearer ${tokenValue}` : "",
    },
  };
});

// 3. Gérer les erreurs avec Apollo Client (GraphQL + Network)
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Vous pouvez aussi gérer des erreurs spécifiques ici
      if (message.includes('Internal server error')) {
        // Par exemple, affichez un message d'erreur global pour l'utilisateur
        if (typeof window !== 'undefined') {
          alert("Il y a un problème avec le serveur. Veuillez réessayer plus tard.");
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`);
    
    // Vérifier si on est dans un environnement client (navigateur)
    if (typeof window !== "undefined") {
      alert("Erreur réseau. Veuillez vérifier votre connexion.");
    }
  }
});

// 4. Initialiser le client Apollo avec les liens
const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)), // Chaîner les liens : error, auth et http
  cache: new InMemoryCache(), // Cache pour les résultats des requêtes
});

export default client;
