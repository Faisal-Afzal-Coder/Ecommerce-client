import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart_items');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product === product._id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.product === product._id
            ? { ...item, qty: Math.min(product.stock, item.qty + qty) }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
            stock: product.stock,
            qty: Math.min(product.stock, qty)
          }
        ];
      }
    });
    toast.success(`${product.name} added to your cart.`);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product !== productId));
    toast.success('Item removed from your cart.');
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId ? { ...item, qty: Math.min(item.stock, qty) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart_items');
    toast.success('Your cart has been cleared.');
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const getShippingFee = (paymentMethod) => {
    return paymentMethod === 'COD' ? 100 : 0;
  };

  const getCartTotal = (paymentMethod) => {
    return getCartSubtotal() + getShippingFee(paymentMethod);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSubtotal,
        getShippingFee,
        getCartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
