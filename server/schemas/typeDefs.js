const { gql } = require("apollo-server-express");

const typeDefs = gql`
    type User {
        _id: ID!
        username: String!
        email: String!
        # You don't want to display the password
        ambitions: [Ambitions]
    }

    type Auth {
        token: ID!
        user: User
    }

    type Category {
        _id: ID!
        ambitionCategories: String
    }

    type Identity {
        _id: ID!
        identityCategories: String
    }

    type Ambitions {
        _id: ID!
        identity: String!
        dailyPlan: String!
        endValue: String!
        category: String!
        public: Boolean
        daysCount: Int
        events: [Events]!
    }

    type Events {
        createdAt: String!
        dataInput: Float!
        notes: String
    }

    type Query {
        user: User
        username: User
        categories: [Category]
        identities: [Identity]
        searchEvents(ambitionId: ID!): Ambitions
        searchPublicAmbitions(public: Boolean!): [Ambitions]
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        updateUser(username: String!, email: String!): Auth
        changePassword(password: String!): Auth
        deleteUser: User
        addAmbition(identity: String!, category: String!, dailyPlan: String!, endValue: String!): Ambitions
        updateAmbition(ambitionId: ID!, identity: String!, dailyPlan: String!, endValue: String!): Ambitions
        publicAmbition(ambitionId: ID!, public: Boolean!): Ambitions
        deleteAmbition(ambitionId: ID!): Ambitions
        addEvent(ambitionId: ID!, createdAt: String! dataInput: Float!, notes: String): Ambitions 
    }
`;

module.exports = typeDefs;