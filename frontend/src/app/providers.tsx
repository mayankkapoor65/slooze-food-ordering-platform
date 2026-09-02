"use client";

import React from "react";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";

const getGraphqlUri = () => {
  if (process.env.NEXT_PUBLIC_GRAPHQL_URI) {
    return process.env.NEXT_PUBLIC_GRAPHQL_URI;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    // On Vercel cloud deployment, use same-origin relative /graphql endpoint
    return "/graphql";
  }
  return "http://localhost:8000/graphql";
};

const httpLink = createHttpLink({
  uri: getGraphqlUri(),
});

const authLink = setContext((_, { headers }) => {
  // Get active session token from localStorage on browser
  let userId = "";
  if (typeof window !== "undefined") {
    userId = localStorage.getItem("slooze_user_id") || "";
  }
  return {
    headers: {
      ...headers,
      "X-User-Id": userId,
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
    },
    mutate: {
      fetchPolicy: "no-cache",
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
