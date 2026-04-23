export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SELLER = 'seller',
}

export enum AccountStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentMethod {
  COD = 'cod',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum CouponType {
  GLOBAL = 'global',
  SHOP = 'shop',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
