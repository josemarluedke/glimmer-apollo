# Introduction

This library integrates Apollo Client in your Ember or Glimmer app with declarative API to query, mutate and access GraphQL data.

## What is GraphQL?

[GraphQL](https://graphql.org/) is a query language for APIs and a runtime for fulfilling those queries
with your existing data. GraphQL provides a complete and understandable description
of the data in your API, gives clients the power to ask for exactly what they
need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.

## What is Apollo Client?

[Apollo Client](https://www.apollographql.com/docs/react/) is a declarative data fetching library for GraphQL.
It is one of the most popular options to execute GraphQL queries and mutations in JavaScript.

## Why Glimmer Apollo?

Glimmer Apollo uses the concept of [Resources](https://www.pzuraq.com/introducing-use/) to allow easy integration of Glimmer's auto-tracking system with Apollo Client. It's built on top of public primitives available in Ember and Glimmer.js.

The alternative in Ember, [ember-apollo-client](https://github.com/ember-graphql/ember-apollo-client/), is built using services and their own concept of query manager using decorators. While ember-apollo-client has been working for many applications in production just fine, it has a different take on how to fetch data. There is no reactive system to refetch queries when arguments change, for example. Glimmer Apollo takes full advantage of the auto-tracking system that Glimmer provides, allowing us to have a declarative API to query, mutate and access GraphQL data.

Glimmer Apollo also provides [TypeScript](https://www.typescriptlang.org/) support by default, while ember-apollo-client does not have any types.

> Disclosure: The author of glimmer-apollo is one of the active maintainers of ember-apollo-client.
