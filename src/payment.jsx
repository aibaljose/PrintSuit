import React, { useState,useEffect } from "react";
import axios from "axios";

const Payment = () => {
  const [amount, setAmount] = useState(500); // Default ₹500
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  
  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post("http://localhost:5000/create-order", { amount });

      const options = {
        key: "rzp_test_5fIpDiq0CC4SjF",
        amount: order.amount,
        currency: "INR",
        name: "Your Company",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {
          await axios.post("http://localhost:5000/verify-payment", response);
          alert("Payment Successful!");
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div>
      <h2>Pay ₹{amount}</h2>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Payment;
