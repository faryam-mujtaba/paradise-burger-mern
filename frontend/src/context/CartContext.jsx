import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const storedCart = localStorage.getItem("cart");

  const [cartItems, setCartItems] = useState(
    storedCart ? JSON.parse(storedCart) : []
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

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
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
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
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (cartId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity - 1 }
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
    localStorage.setItem("cart", JSON.stringify([]));
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