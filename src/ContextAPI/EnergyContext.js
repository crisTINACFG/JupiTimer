import React, { createContext, useState, useContext } from 'react';

// Create a Context for the energy currency
const EnergyContext = createContext();

// Create a Provider component
export const EnergyProvider = ({ children }) => {
  const [energy, setEnergy] = useState(0); // Start with 0 energy

  // Function to add energy, you can create more functions like this to manage the energy
  const addEnergy = (amount) => {
    setEnergy((currentEnergy) => currentEnergy + amount);
  };

  return (
    <EnergyContext.Provider value={{ energy, addEnergy }}>
      {children}
    </EnergyContext.Provider>
  );
};

// Custom hook to use the energy context
export const useEnergy = () => useContext(EnergyContext);
