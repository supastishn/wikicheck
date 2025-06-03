import { Client, Account, Functions } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('wikicheck');

export const account = new Account(client);
export const functions = new Functions(client);
