import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  const cartStorageKey = userId ? `cart_${userId}` : null;

  const [cartItems, setCartItems] = useState([]);

  // Load the cart whenever the logged-in user changes
  useEffect(() => {
    if (!cartStorageKey) {
      setCartItems([]);
      return;
    }

    try {
      const storedCart = localStorage.getItem(cartStorageKey);

      setCartItems(storedCart ? JSON.parse(storedCart) : []);
    } catch (error) {
      console.error("LOAD CART ERROR:", error);
      setCartItems([]);
    }
  }, [cartStorageKey]);

  // Save cart for the currently logged-in user
  useEffect(() => {
    if (!cartStorageKey) {
      return;
    }

    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartStorageKey]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const itemType = item.itemType || "menu";
      const cartId = `${itemType}-${item._id}`;

      const existingItem = prevItems.find(
        (cartItem) => cartItem.cartId === cartId
      );

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.cartId === cartId
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...prevItems,
        {
          cartId,
          _id: item._id,
          itemType,
          name: item.name || item.title,
          price:
            item.itemType === "deal"
              ? item.dealPrice
              : item.discountPrice > 0
              ? item.discountPrice
              : item.price,
          imageUrl: item.imageUrl || item.image || "",
          category: item.category || "Hot Deal",
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (cartId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartId !== cartId)
    );
  };

  const clearCart = () => {
    setCartItems([]);

    if (cartStorageKey) {
      localStorage.setItem(cartStorageKey, JSON.stringify([]));
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const deliveryFee = 0;
  const totalAmount = subtotal;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}