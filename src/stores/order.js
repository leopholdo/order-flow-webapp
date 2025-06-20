// Utilities
import { defineStore } from 'pinia'
import { HubConnectionBuilder } from '@microsoft/signalr'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const ordersOnHold = ref([])
  const averageTime = ref("")
  const newOrderReceived = ref(false)
  const newOrderReceivedList = ref([])
  const hubConnection = ref(false)
  const getTimeWhenOrderCompleted = ref(false)

  const getAverageTime = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/getAverageTime`)

    if(!res.ok) return "";

    const data = await res.text()
    averageTime.value = data;

    return data
  }

  const getOrders = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders?onHold=${false}`)
    const data = await res.json()

    orders.value = data;

    return data
  }

  const getOrdersOnHold = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders?onHold=${true}`)
    const data = await res.json()

    ordersOnHold.value = data;

    return data
  }

  const createOrder = async (order) => {
    return await fetch(`${import.meta.env.VITE_API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    }).then(async response => {
      const result = await response.json();

      if(!response.ok) {
        if(result.message === 'key_already_linked_to_order') 
          throw new Error("Senha já vinculada a outro pedido");
        else 
          throw new Error("Ocorreu um erro erro desconhecido. Por favor, acione um administrador.");
      }

      return result;
    })
  }

  const sendToBoard = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/sendToBoard?id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return response;
  }

  const completeOrder = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/complete?id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return response;
  }


  const connectToHub = async () => {
    if(hubConnection.value) return;

    hubConnection.value = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/orderHub`)
      .withAutomaticReconnect()
      .build()

    hubConnection.value.on('OrderReceived', (order) => {
      newOrderReceived.value = true;

      setTimeout(() => {
        newOrderReceived.value = false;
      }, 100); 

      newOrderReceivedList.value.push(order)
      setTimeout(() => {
        const index = newOrderReceivedList.value.indexOf(order);
        if (index !== -1) {
          newOrderReceivedList.value.splice(index, 1);
        }
      }, 10000);

      orders.value.push(order);
    })

    hubConnection.value.on('OrderReceivedOnHold', (order) => {      
      ordersOnHold.value.push(order)
    })

    hubConnection.value.on('SendOrderToBoard', (order) => {
      // remove order from ordersOnHold list
      const index = ordersOnHold.value.findIndex(o => o.senha === order.senha);
      if(index != -1) {
        ordersOnHold.value.splice(index, 1);
      }

      newOrderReceived.value = true;

      setTimeout(() => {
        newOrderReceived.value = false;
      }, 100); 

      newOrderReceivedList.value.push(order)
      setTimeout(() => {
        const index = newOrderReceivedList.value.indexOf(order);
        if (index !== -1) {
          newOrderReceivedList.value.splice(index, 1);
        }
      }, 10000);

      orders.value.push(order);
    })

    hubConnection.value.on('OrderCompleted', (id) => {
      const index = orders.value.findIndex(o => o.id == id);
      if(index === -1) return;

      orders.value.splice(index, 1);

      if(getTimeWhenOrderCompleted.value) {
        getAverageTime()
      }
    })

    await hubConnection.value
      .start()
      .then(() => console.log("Connected to SignalR hub"))
      .catch((err) => {
        console.error("SignalR connection error:", err);
      });
  }

  return { 
    orders, 
    ordersOnHold,
    averageTime,
    getAverageTime,
    getOrders, 
    getOrdersOnHold,
    sendToBoard,
    createOrder,
    completeOrder, 
    connectToHub,
    newOrderReceived,
    getTimeWhenOrderCompleted,
    newOrderReceivedList
  }
})
