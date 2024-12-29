import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    credentials: 'include', // Permet d'inclure les cookies avec les requêtes
});

const authLink = setContext((_, { headers }) => {
    // Les cookies sont automatiquement envoyés avec chaque requête HTTP
    return {
        headers: {
            ...headers,
            // Pas besoin d'ajouter le token ici, Apollo s'en charge automatiquement via cookies
        }
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
