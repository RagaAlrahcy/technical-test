const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    price: Float!
  }

  type User {
    id: ID!
    name: String!
    orders: [Order]
  }

  type Order {
    id: ID!
    user: User!
    products: [Product]!
    totalAmount: Float!
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
    users: [User]
    user(id: ID!): User
    orders: [Order]
    order(id: ID!): Order
  }
`);

const products = [
  { id: '1', name: 'Laptop', price: 15000000 },
  { id: '2', name: 'Headphone', price: 200000 },
  { id: '3', name: 'Mouse', price: 150000 },
];

const users = [
  { id: '1', name: 'Andi' },
  { id: '2', name: 'Budi' },
];

const orders = [
  { id: '101', userId: '1', productIds: ['1', '2'] },
  { id: '102', userId: '2', productIds: ['2', '3'] },
];

const root = {
  products: () => products,
  product: ({ id }) => products.find((p) => p.id === id),

  users: () => users,
  user: ({ id }) => users.find((u) => u.id === id),

  orders: () =>
    orders.map((o) => ({
      ...o,
      user: users.find((u) => u.id === o.userId),
      products: o.productIds.map((pid) => products.find((p) => p.id === pid)),
      totalAmount: o.productIds
        .map((pid) => products.find((p) => p.id === pid).price)
        .reduce((a, b) => a + b, 0),
    })),

  order: ({ id }) => {
    const o = orders.find((o) => o.id === id);
    if (!o) return null;
    return {
      ...o,
      user: users.find((u) => u.id === o.userId),
      products: o.productIds.map((pid) => products.find((p) => p.id === pid)),
      totalAmount: o.productIds
        .map((pid) => products.find((p) => p.id === pid).price)
        .reduce((a, b) => a + b, 0),
    };
  },
};

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true, // aktifkan playground UI
  })
);

app.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
});
