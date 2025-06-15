// Utilities
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', () => {
  const getProducts = async () => {
    return await fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then(async response => {
        const data = await response.json()
        return data;
      }).catch(error => {
        throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
      })
  }

  const createProduct = async (product) => {
    return await fetch(`${import.meta.env.VITE_API_URL}/products/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    }).then(async response => {
      if(!response.ok) throw new Error(result.message)
        
      const result = await response.json();
      return result;
    }).catch(error => {
      if(error.message === 'product_name_already_exists') 
        throw new Error("Já existe um nome igual vinculado a outro produto");
      else 
        throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
    })
  }

  const updateProduct = async (product) => {
    return await fetch(`${import.meta.env.VITE_API_URL}/products/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    }).then(async response => {
      if(!response.ok) throw new Error(result.message)
        
      const result = await response.json();
      return result;
    }).catch(error => {
      if(error.message === 'product_name_already_exists') 
        throw new Error("Já existe um nome igual vinculado a outro produto");
      else 
        throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
    })
  }

  return { 
    getProducts,
    createProduct,
    updateProduct
  }
})
