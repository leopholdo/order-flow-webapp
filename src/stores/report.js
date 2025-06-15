// Utilities
import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', () => {
  const getReports = async (startDate, endDate) => {
    return await fetch(`${import.meta.env.VITE_API_URL}/reports/getReport?startDate=${startDate}&endDate=${endDate}`)
      .then(async response => {
        const data = await response.json()
        return data;
      }).catch(error => {
        throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
      })
  }

  return { 
    getReports,
  }
})