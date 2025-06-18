// Utilities
import { defineStore } from 'pinia'

export const useServerStore = defineStore('server', () => {
  const getServerInfo = async () => {
    return await fetch(`${import.meta.env.VITE_API_URL}/server/getServerInfo`)
      .then(async response => {
        const data = await response.json()
        return data;
      }).catch(error => {
        throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
      })
  }

  return { 
    getServerInfo,
  }
})