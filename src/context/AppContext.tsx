import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type {
  AppState, User, Product, Order, CartItem, OrderStatus, UserRole, ProductCategory,
  PaymentMethod, Payment, DeliveryAssignment, PlatformMetrics
} from '../types';

// --- State ---
const initialState: AppState = {
  users: [],
  products: [],
  orders: [],
  cart: [],
  currentUser: null,
  isAuthenticated: false,
};

// --- Actions ---
type Action =
  | { type: 'REGISTER'; payload: User }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'TOGGLE_PRODUCT_AVAILABILITY'; payload: string }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus; note?: string } }
  | { type: 'ASSIGN_DELIVERY'; payload: { orderId: string; assignment: DeliveryAssignment } }
  | { type: 'UPDATE_PAYMENT'; payload: { orderId: string; payment: Payment } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REGISTER':
      return { ...state, users: [...state.users, action.payload], currentUser: action.payload, isAuthenticated: true };

    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };

    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, cart: [] };

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) };

    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

    case 'TOGGLE_PRODUCT_AVAILABILITY':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload ? { ...p, isAvailable: !p.isAvailable } : p)),
      };

    case 'ADD_TO_CART': {
      const existing = state.cart.find((c) => c.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.productId === action.payload.productId
              ? { ...c, quantity: c.quantity + action.payload.quantity }
              : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((c) => c.productId !== action.payload) };

    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.productId === action.payload.productId ? { ...c, quantity: action.payload.quantity } : c
        ),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'PLACE_ORDER':
      return { ...state, orders: [...state.orders, action.payload], cart: [] };

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? {
                ...o,
                status: action.payload.status,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                  ...o.statusHistory,
                  { status: action.payload.status, timestamp: new Date().toISOString(), note: action.payload.note },
                ],
              }
            : o
        ),
      };

    case 'ASSIGN_DELIVERY':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, deliveryAssignment: action.payload.assignment, updatedAt: new Date().toISOString() }
            : o
        ),
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, payment: action.payload.payment, updatedAt: new Date().toISOString() }
            : o
        ),
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
        currentUser: action.payload.id === state.currentUser?.id ? action.payload : state.currentUser,
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        products: state.products.filter((p) => p.farmerId !== action.payload),
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// --- Seed Data ---
function getSeedProducts(): Product[] {
  const farmer1Id = 'seed-farmer-1';
  const farmer2Id = 'seed-farmer-2';
  return [
    {
      id: 'seed-p-1', farmerId: farmer1Id, farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
      name: 'Fresh Baguio Beans', description: 'Freshly picked green beans from the cool highlands. Pesticide-free.',
      price: 80, unit: 'kg', category: 'vegetables',
      image: 'https://images.pexels.com/photos/4148642/pexels-photo-4148642.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 50, isAvailable: true,
      createdAt: '2026-01-15T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-2', farmerId: farmer1Id, farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
      name: 'Organic Eggplant', description: 'Large, glossy purple eggplants grown with natural compost.',
      price: 60, unit: 'kg', category: 'vegetables',
      image: 'https://images.pexels.com/photos/16732700/pexels-photo-16732700.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 40, isAvailable: true,
      createdAt: '2026-01-15T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-3', farmerId: farmer1Id, farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
      name: 'Cavendish Banana', description: 'Sweet ripe Cavendish bananas from our plantation.',
      price: 50, unit: 'kg', category: 'fruits',
      image: 'https://images.pexels.com/photos/30893281/pexels-photo-30893281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 100, isAvailable: true,
      createdAt: '2026-01-15T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-4', farmerId: farmer2Id, farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
      name: 'Fresh Tilapia', description: 'Live fresh tilapia from our fishpond. Clean and sweet-tasting.',
      price: 120, unit: 'kg', category: 'fish',
      image: 'https://images.pexels.com/photos/36618317/pexels-photo-36618317.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 30, isAvailable: true,
      createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-5', farmerId: farmer2Id, farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
      name: 'Free-Range Native Chicken', description: 'Native chicken raised free-range. Perfect for tinola.',
      price: 250, unit: 'piece', category: 'poultry',
      image: 'https://images.pexels.com/photos/30248442/pexels-photo-30248442.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 20, isAvailable: true,
      createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-6', farmerId: farmer2Id, farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
      name: 'Carabao Mangoes', description: 'Sweetest carabao mangoes from Luzon. Farm-fresh!',
      price: 150, unit: 'kg', category: 'fruits',
      image: 'https://images.pexels.com/photos/30893290/pexels-photo-30893290.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 25, isAvailable: true,
      createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-7', farmerId: 'seed-farmer-3', farmerName: 'Pedro Reyes', farmName: 'Bulacan Harvest',
      name: 'Fresh Duck Eggs (Itlog na Pato)', description: 'Farm-fresh duck eggs. Perfect for balut or salted egg.',
      price: 12, unit: 'piece', category: 'poultry',
      image: 'https://images.pexels.com/photos/32701556/pexels-photo-32701556.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 200, isAvailable: true,
      createdAt: '2026-01-17T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-p-8', farmerId: 'seed-farmer-3', farmerName: 'Pedro Reyes', farmName: 'Bulacan Harvest',
      name: 'Malagkit Rice (Glutinous)', description: 'Premium malagkit rice perfect for suman and kakanin.',
      price: 70, unit: 'kg', category: 'rice-grains',
      image: 'https://images.pexels.com/photos/18446086/pexels-photo-18446086.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
      stock: 100, isAvailable: true,
      createdAt: '2026-01-17T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
    },
  ];
}

function getSeedFarmers(): User[] {
  return [
    {
      id: 'seed-farmer-1', name: 'Juan Dela Cruz', email: 'juan@freshkart.ph', password: 'farmer123',
      role: 'farmer', address: 'Poblacion, Hinunangan, Southern Leyte', phone: '+63 912 345 6789', farmName: 'Bayanihan Farm',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'seed-farmer-2', name: 'Maria Santos', email: 'maria@freshkart.ph', password: 'farmer123',
      role: 'farmer', address: 'Brgy. San Jose, Hinunangan, Southern Leyte', phone: '+63 923 456 7890', farmName: 'Masagana Agri-Farm',
      createdAt: '2026-01-02T08:00:00Z',
    },
    {
      id: 'seed-farmer-3', name: 'Pedro Reyes', email: 'pedro@freshkart.ph', password: 'farmer123',
      role: 'farmer', address: 'Brgy. Mahayahay, Hinunangan, Southern Leyte', phone: '+63 934 567 8901', farmName: 'Bulacan Harvest',
      createdAt: '2026-01-03T08:00:00Z',
    },
  ];
}

function getSeedResidents(): User[] {
  return [
    {
      id: 'seed-resident-1', name: 'Anna Gonzales', email: 'anna@freshkart.ph', password: 'resident123',
      role: 'resident', address: 'Brgy. Catublian, Hinunangan, Southern Leyte', phone: '+63 945 678 9012',
      createdAt: '2026-01-05T08:00:00Z',
    },
    {
      id: 'seed-resident-2', name: 'Benito Reyes', email: 'ben@freshkart.ph', password: 'resident123',
      role: 'resident', address: 'Brgy. San Antonio, Hinunangan, Southern Leyte', phone: '+63 956 789 0123',
      createdAt: '2026-01-07T08:00:00Z',
    },
  ];
}

function getSeedAdmin(): User[] {
  return [
    {
      id: 'seed-admin-1', name: 'Admin FreshKart', email: 'admin@freshkart.ph', password: 'admin123',
      role: 'admin', address: 'Hinunangan, Southern Leyte', phone: '+63 999 000 1111',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
}

function getSeedOrders(): Order[] {
  const defaultPayment: Payment = { method: 'gcash', status: 'paid', reference: 'GC-2026-001', paidAt: '2026-02-01T08:05:00Z' };
  const defaultPayment2: Payment = { method: 'cod', status: 'unpaid' };
  return [
    {
      id: 'seed-order-1', residentId: 'seed-resident-1', residentName: 'Anna Gonzales',
      residentAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', residentPhone: '+63 945 678 9012',
      farmerId: 'seed-farmer-1',
      items: [
        { productId: 'seed-p-1', productName: 'Fresh Baguio Beans', quantity: 2, unitPrice: 80 },
        { productId: 'seed-p-3', productName: 'Cavendish Banana', quantity: 3, unitPrice: 50 },
      ],
      totalAmount: 310, status: 'delivered', payment: defaultPayment,
      deliveryAssignment: {
        driverName: 'Carlos Mendoza', driverPhone: '+63 917 111 2233',
        assignedAt: '2026-02-02T06:00:00Z', estimatedDelivery: '2026-02-02T14:00:00Z',
      },
      statusHistory: [
        { status: 'pending', timestamp: '2026-02-01T08:00:00Z' },
        { status: 'confirmed', timestamp: '2026-02-01T10:00:00Z' },
        { status: 'processing', timestamp: '2026-02-01T14:00:00Z' },
        { status: 'shipped', timestamp: '2026-02-02T06:00:00Z' },
        { status: 'delivered', timestamp: '2026-02-02T14:00:00Z' },
      ],
      createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-02-02T14:00:00Z',
      deliveryAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte',
    },
    {
      id: 'seed-order-2', residentId: 'seed-resident-1', residentName: 'Anna Gonzales',
      residentAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', residentPhone: '+63 945 678 9012',
      farmerId: 'seed-farmer-2',
      items: [
        { productId: 'seed-p-4', productName: 'Fresh Tilapia', quantity: 2, unitPrice: 120 },
        { productId: 'seed-p-6', productName: 'Carabao Mangoes', quantity: 1, unitPrice: 150 },
      ],
      totalAmount: 390, status: 'shipped', payment: defaultPayment2,
      deliveryAssignment: {
        driverName: 'Liza Fernandez', driverPhone: '+63 918 222 3344',
        assignedAt: '2026-02-06T06:00:00Z', estimatedDelivery: '2026-02-06T18:00:00Z',
      },
      statusHistory: [
        { status: 'pending', timestamp: '2026-02-05T08:00:00Z' },
        { status: 'confirmed', timestamp: '2026-02-05T09:00:00Z' },
        { status: 'processing', timestamp: '2026-02-05T12:00:00Z' },
        { status: 'shipped', timestamp: '2026-02-06T06:00:00Z' },
      ],
      createdAt: '2026-02-05T08:00:00Z', updatedAt: '2026-02-06T06:00:00Z',
      deliveryAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte',
    },
  ];
}

// --- Context ---
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  register: (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'farmName' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: (notes: string | undefined, paymentMethod: PaymentMethod, receiptUrl?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  assignDelivery: (orderId: string, assignment: DeliveryAssignment) => void;
  updatePaymentStatus: (orderId: string, payment: Payment) => void;
  updateUser: (user: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  registerByAdmin: (name: string, email: string, password: string, role: 'farmer' | 'resident', extra?: Partial<User>) => string | null;
  getFarmerOrders: () => Order[];
  getResidentOrders: () => Order[];
  getAllOrders: () => Order[];
  getFarmerProducts: () => Product[];
  getFilteredProducts: (search: string, category: ProductCategory | '', farmerId?: string) => Product[];
  getSalesData: () => { labels: string[]; amounts: number[]; orders: number[] };
  getPlatformMetrics: () => PlatformMetrics;
  getAssignedDeliveries: () => Order[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const saved = localStorage.getItem('freshkart_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          ...initialState,
          users: [...getSeedFarmers(), ...getSeedResidents(), ...getSeedAdmin()],
          products: getSeedProducts(),
          orders: getSeedOrders(),
        };
      }
    }
    return {
      ...initialState,
      users: [...getSeedFarmers(), ...getSeedResidents(), ...getSeedAdmin()],
      products: getSeedProducts(),
      orders: getSeedOrders(),
    };
  });

  useEffect(() => {
    localStorage.setItem('freshkart_state', JSON.stringify(state));
  }, [state]);

  const register = (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => {
    const exists = state.users.find((u) => u.email === email);
    if (exists) return 'Email already registered';
    const user: User = {
      id: `user-${Date.now()}`,
      name, email, password, role,
      address: extra?.address || '',
      phone: extra?.phone || '',
      farmName: extra?.farmName || '',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'REGISTER', payload: user });
    return null;
  };

  const login = (email: string, password: string) => {
    const user = state.users.find((u) => u.email === email && u.password === password);
    if (!user) return 'Invalid email or password';
    dispatch({ type: 'LOGIN', payload: user });
    return null;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const addProduct = (productData: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'farmName' | 'createdAt'>) => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return;
    const product: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      farmerId: state.currentUser.id,
      farmerName: state.currentUser.name,
      farmName: state.currentUser.farmName || 'Farm',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product: Product) => dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  const removeProduct = (id: string) => dispatch({ type: 'REMOVE_PRODUCT', payload: id });
  const toggleAvailability = (id: string) => dispatch({ type: 'TOGGLE_PRODUCT_AVAILABILITY', payload: id });

  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, product, quantity } });
  };

  const removeFromCart = (productId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  const updateCartQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });

  const placeOrder = (notes: string | undefined, paymentMethod: PaymentMethod, receiptUrl?: string) => {
    if (!state.currentUser || state.currentUser.role !== 'resident' || state.cart.length === 0) return;
    const farmerId = state.cart[0].product.farmerId;
    const items = state.cart.map((c) => ({
      productId: c.productId,
      productName: c.product.name,
      quantity: c.quantity,
      unitPrice: c.product.price,
    }));
    const totalAmount = state.cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
    const payment: Payment = {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      reference: paymentMethod !== 'cod' ? `REF-${Date.now().toString(36).toUpperCase()}` : undefined,
      receiptUrl: receiptUrl,
      paidAt: paymentMethod !== 'cod' ? new Date().toISOString() : undefined,
    };
    const order: Order = {
      id: `order-${Date.now()}`,
      residentId: state.currentUser.id,
      residentName: state.currentUser.name,
      residentAddress: state.currentUser.address || '',
      residentPhone: state.currentUser.phone || '',
      farmerId, items, totalAmount,
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddress: state.currentUser.address || '',
      notes, payment,
    };
    dispatch({ type: 'PLACE_ORDER', payload: order });
    // Decrease stock
    state.cart.forEach((c) => {
      const product = state.products.find((p) => p.id === c.productId);
      if (product) {
        dispatch({
          type: 'UPDATE_PRODUCT',
          payload: { ...product, stock: product.stock - c.quantity },
        });
      }
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) =>
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status, note } });

  const assignDelivery = (orderId: string, assignment: DeliveryAssignment) =>
    dispatch({ type: 'ASSIGN_DELIVERY', payload: { orderId, assignment } });

  const updateUser = (updates: Partial<User>) => {
    if (!state.currentUser) return;
    const updated: User = { ...state.currentUser, ...updates };
    dispatch({ type: 'UPDATE_USER', payload: updated });
  };

  const deleteUser = (userId: string) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const registerByAdmin = (name: string, email: string, password: string, role: 'farmer' | 'resident', extra?: Partial<User>) => {
    const exists = state.users.find((u) => u.email === email);
    if (exists) return 'Email already registered';
    const user: User = {
      id: `user-${Date.now()}`,
      name, email, password, role,
      address: extra?.address || 'Hinunangan, Southern Leyte',
      phone: extra?.phone || '',
      farmName: extra?.farmName || '',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'REGISTER', payload: user });
    return null;
  };

  const updatePaymentStatus = (orderId: string, payment: Payment) =>
    dispatch({ type: 'UPDATE_PAYMENT', payload: { orderId, payment } });

  const getFarmerOrders = () => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return [];
    return state.orders.filter((o) => o.farmerId === state.currentUser!.id);
  };

  const getResidentOrders = () => {
    if (!state.currentUser || state.currentUser.role !== 'resident') return [];
    return state.orders.filter((o) => o.residentId === state.currentUser!.id);
  };

  const getAllOrders = () => state.orders;

  const getFarmerProducts = () => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return [];
    return state.products.filter((p) => p.farmerId === state.currentUser!.id);
  };

  const getFilteredProducts = (search: string, category: ProductCategory | '', farmerId?: string) => {
    let filtered = state.products.filter((p) => p.isAvailable);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.farmName.toLowerCase().includes(s) ||
          p.farmerName.toLowerCase().includes(s)
      );
    }
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (farmerId) filtered = filtered.filter((p) => p.farmerId === farmerId);
    return filtered;
  };

  const getSalesData = () => {
    const farmerOrders = getFarmerOrders().filter((o) => o.status !== 'cancelled');
    const grouped: Record<string, { amount: number; orders: number }> = {};
    farmerOrders.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = { amount: 0, orders: 0 };
      grouped[date].amount += o.totalAmount;
      grouped[date].orders += 1;
    });
    const labels = Object.keys(grouped);
    const amounts = labels.map((l) => grouped[l].amount);
    const orders = labels.map((l) => grouped[l].orders);
    return { labels, amounts, orders };
  };

  const getPlatformMetrics = (): PlatformMetrics => {
    const allUsers = state.users;
    const allProducts = state.products;
    const allOrders = state.orders;

    const totalFarmers = allUsers.filter((u) => u.role === 'farmer').length;
    const totalResidents = allUsers.filter((u) => u.role === 'resident').length;
    const totalProducts = allProducts.length;
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

    const ordersByStatus = {
      pending: allOrders.filter((o) => o.status === 'pending').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };

    // Top farmers by revenue
    const farmerRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    allOrders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      const farmer = allUsers.find((u) => u.id === o.farmerId);
      const name = farmer?.farmName || farmer?.name || 'Unknown';
      if (!farmerRevenue[o.farmerId]) farmerRevenue[o.farmerId] = { name, revenue: 0, orders: 0 };
      farmerRevenue[o.farmerId].revenue += o.totalAmount;
      farmerRevenue[o.farmerId].orders += 1;
    });
    const topFarmers = Object.values(farmerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category distribution
    const catCount: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (!catCount[p.category]) catCount[p.category] = 0;
      catCount[p.category] += 1;
    });
    const categoryDistribution = Object.entries(catCount).map(([category, count]) => ({ category, count }));

    // Daily revenue
    const dailyRev: Record<string, number> = {};
    allOrders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      if (!dailyRev[date]) dailyRev[date] = 0;
      dailyRev[date] += o.totalAmount;
    });
    const dailyRevenue = Object.entries(dailyRev).map(([date, amount]) => ({ date, amount }));

    return {
      totalFarmers, totalResidents, totalProducts, totalOrders, totalRevenue,
      pendingOrders, ordersByStatus, topFarmers, categoryDistribution, dailyRevenue,
    };
  };

  const getAssignedDeliveries = () => {
    if (!state.currentUser) return [];
    if (state.currentUser.role === 'farmer') {
      return state.orders.filter((o) => o.farmerId === state.currentUser!.id && o.status === 'shipped' && o.deliveryAssignment);
    }
    if (state.currentUser.role === 'resident') {
      return state.orders.filter((o) => o.residentId === state.currentUser!.id && o.deliveryAssignment);
    }
    return state.orders.filter((o) => o.deliveryAssignment);
  };

  return (
    <AppContext.Provider
      value={{
        state, dispatch, register, login, logout,
        addProduct, updateProduct, removeProduct, toggleAvailability,
        addToCart, removeFromCart, updateCartQuantity,
        placeOrder, updateOrderStatus, assignDelivery, updatePaymentStatus,
        getFarmerOrders, getResidentOrders, getAllOrders,
        getFarmerProducts, getFilteredProducts,
        getSalesData, getPlatformMetrics, getAssignedDeliveries, updateUser, deleteUser, registerByAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
