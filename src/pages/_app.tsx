import '../styles/globals.css'; // Styles globaux
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
    const newLocal = <header className="header bg-blue-600 text-white p-4">
    </header>;
  return (
    <ApolloProvider client={client}>
      <div className="app-wrapper bg-gray-50 min-h-screen flex flex-col">
        {/* Header commun */}
        {newLocal}

        {/* Contenu principal */}
        <main className="main-content flex-grow p-4">
          {/* Affiche la page courante */}
          <Component {...pageProps} />
        </main>

        {/* Footer commun */}
      </div>
    </ApolloProvider>
  );
}

export default MyApp;
