import { Client, clients as defaultClients } from "@/data/mockData";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ClientInput = Omit<Client, "id">;

interface ClientState {
  clients: Client[];
  addClient: (data: ClientInput) => void;
  updateClient: (id: string, data: ClientInput) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: defaultClients,
      addClient: (data) =>
        set((state) => ({
          clients: [...state.clients, { id: crypto.randomUUID(), ...data }],
        })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...data } : client,
          ),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        })),
    }),
    {
      name: "stock-control-clients",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
