import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      role
      country
      avatarUrl
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      role
      country
      avatarUrl
    }
  }
`;

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($search: String) {
    restaurants(search: $search) {
      id
      name
      cuisine
      country
      rating
      deliveryTime
      imageUrl
      menuItems {
        id
        restaurantId
        name
        category
        price
        currency
        description
        dietaryTag
        imageUrl
      }
    }
    orders {
      id
      userId
      country
      status
      totalAmount
      currency
      createdAt
      paymentMethodId
      paymentMethod {
        id
        country
        methodType
        details
      }
      items {
        id
        menuItemId
        quantity
        price
        menuItem {
          id
          name
          category
        }
      }
      user {
        id
        name
        role
        country
        avatarUrl
      }
    }
    paymentMethods {
      id
      country
      methodType
      details
    }
  }
`;

export const GET_ADMIN_ANALYTICS = gql`
  query GetAdminAnalytics {
    adminAnalytics {
      totalUsers
      totalOrders
      totalPending
      totalPaid
      totalCancelled
      regionalMetrics {
        country
        totalOrders
        totalGmv
        currency
        activeRestaurants
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($country: String!, $items: [OrderItemInput!]!) {
    createOrder(country: $country, items: $items) {
      id
      status
      totalAmount
      currency
      country
    }
  }
`;

export const PAY_ORDER = gql`
  mutation PayOrder($orderId: Int!) {
    payOrder(orderId: $orderId) {
      id
      status
      paymentMethod {
        id
        methodType
        details
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: Int!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($id: Int!, $methodType: String!, $details: String!) {
    updatePaymentMethod(id: $id, methodType: $methodType, details: $details) {
      id
      methodType
      details
    }
  }
`;
