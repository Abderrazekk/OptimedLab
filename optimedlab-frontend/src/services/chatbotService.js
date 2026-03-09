import api from './api'; // your existing axios instance

export const sendMessage = async (message) => {
  try {
    const response = await api.post('/chatbot/message', { message });
    return response.data.reply;
  } catch (error) {
    console.error('Chatbot API error:', error);
    throw error;
  }
};