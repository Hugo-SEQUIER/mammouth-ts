import { createContext, useContext, useState } from 'react';

export const PublicKeyContext = createContext<PublicKeyContextType>({
    publicKey: "",
    updatePublicKey: () => {}
});

interface PublicKeyContextType {
    publicKey: string;
    updatePublicKey: (newPublicKey: string) => void;
}

export function PublicKeyProvider({children}: {children: React.ReactNode}) {
	const [publicKey, setPublicKey] = useState<string>("");

    const updatePublicKey = (newPublicKey: string) => {
        setPublicKey(newPublicKey);
    }

    return (
        <PublicKeyContext.Provider value={{publicKey, updatePublicKey}}>
            {children}
        </PublicKeyContext.Provider>
    );
}

export const usePublicKey = () => {
	return useContext(PublicKeyContext);
};