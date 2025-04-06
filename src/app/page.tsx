"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectWallet } from "../utils/connectWallet"; // adjust the path if needed


// Extend the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LandingPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleWalletConnection = async () => {
    try {
      const wallet = await connectWallet();

      if (!wallet) {
        setErrorMessage("Failed to connect wallet. Please try again.");
        return;
      }

      const { address, signer } = wallet;
      setWalletAddress(address);
      setIsConnected(true);
      setErrorMessage("");

      // Sign a message
      const message = `Sign up for MEV Analyzer with wallet: ${address}`;
      const signature = await signer.signMessage(message);

      // Store wallet in DB (backend should handle deduplication)
      const response = await fetch("/api/store-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sign up.");

      alert(data.message);

      await fetch("/api/sandwitch-csv")
      .then(res => res.json())
      .then(data => {
        console.log("CSV generation:", data.message || data);
      })
      .catch(err => {
        console.error("Error calling sandwichCSV API:", err);
      });

      // Redirect or next step
      router.push("/graph");

    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to connect/sign up. Please try again."
      );
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-center mb-6">MEV Analyzer</h1>
      <p className="text-lg text-center mb-4">
        Connect your wallet to access the MEV dashboard.
      </p>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={handleWalletConnection}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="text-green-600 font-medium text-center">
          Wallet Connected: {walletAddress}
        </p>
      )}
    </div>
  );
}
