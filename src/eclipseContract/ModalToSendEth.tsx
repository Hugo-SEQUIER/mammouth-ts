import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import client from "./client";
import { useGaming } from "../context/GamingContext";
export default function ModalToSendEth() {
    const { wallet } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [clickAmount, setClickAmount] = useState("0");
    const ethRequired = parseInt(clickAmount) * 0.00000005; // Example rate: 0.001 ETH per click
    const { dispatch } = useGaming();
    const handleSendEth = async () => {
        await client(wallet?.adapter as any, parseInt(clickAmount)* 0.00000005, dispatch);
    }

    return (
        <div>
            {isOpen ? (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add More Clicks</h2>
                        
                        <div>
                            <label>
                                Amount of Clicks:
                            </label>
                            <input
                                type="number"
                                value={clickAmount}
                                onChange={(e) => setClickAmount(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div>
                            <p>
                                ETH Required: {ethRequired ? ethRequired.toFixed(8) : "0"} ETH
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await handleSendEth();
                                    setIsOpen(false);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            ) : <button 
                    onClick={() => setIsOpen(true)}
                >
                    Add Click
                </button>
            }
        </div>
    );
}