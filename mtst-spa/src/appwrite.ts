// src/appwrite.ts
import { Client, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://sfo.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('691297070025e47e3fd6');           // Your project ID

export const account = new Account(client);
export default client;