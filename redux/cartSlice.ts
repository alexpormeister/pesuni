import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // LISÄÄ TUOTE KORIIN
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const productToAdd = action.payload;
      // Tarkistetaan onko tuote jo korissa
      const existingItem = state.items.find(item => item.id === productToAdd.id);

      if (existingItem) {
        // Jos on, kasvatetaan määrää yhdellä
        existingItem.quantity += 1;
      } else {
        // Jos ei, lisätään se uutena tuotteena määrällä 1
        state.items.push({ ...productToAdd, quantity: 1 });
      }
    },
    // POISTA TUOTE KOKONAAN KORISTA
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      const idToRemove = action.payload;
      // Suodatetaan pois tuote, jonka ID täsmää poistettavaan
      state.items = state.items.filter(item => item.id !== idToRemove);
    },
    // KASVATA MÄÄRÄÄ YHDELLE TUOTTEELLE (+)
    incrementQuantity: (state, action: PayloadAction<string | number>) => {
        const item = state.items.find(item => item.id === action.payload);
        if (item) {
            item.quantity++;
        }
    },
    // VÄHENNÄ MÄÄRÄÄ YHDELLE TUOTTEELLE (-)
    decrementQuantity: (state, action: PayloadAction<string | number>) => {
        const item = state.items.find(item => item.id === action.payload);
        // Vähennetään vain, jos määrä on suurempi kuin 1.
        // Jos määrä on 1, käyttäjän pitää painaa poisto-nappia (roskakori).
        if (item && item.quantity > 1) {
            item.quantity--;
        }
    },
    // TYHJENNÄ KOKO OSTOSKORI
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart
} = cartSlice.actions;


export const selectTotalCartItems = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// Laskee ostoskorin loppusumman
export const selectCartTotalPrice = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

// Hakee itse listan tuotteista
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

// Viedään reducer storen konfigurointia varten
export default cartSlice.reducer;