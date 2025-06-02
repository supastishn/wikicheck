import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('wikicheck');

export const account = new Account(client);
