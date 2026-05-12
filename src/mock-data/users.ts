export interface User {
  username: string
  password: string
  name: string
  role: "admin" | "encargado" | "general"
}

export const users: User[] = [
  // Admin
  {
    username: "admin",
    password: "123456",
    name: "Administrador",
    role: "admin",
  },
  // G1 - Encargado
  {
    username: "12345678",
    password: "123456",
    name: "Mario González",
    role: "encargado",
  },
  // G1 - Generales
  {
    username: "23456789",
    password: "123456",
    name: "Ana Martínez",
    role: "general",
  },
  {
    username: "34567890",
    password: "123456",
    name: "Luis Rodríguez",
    role: "general",
  },
  {
    username: "45678901",
    password: "123456",
    name: "Sofia Pérez",
    role: "general",
  },
  // G2 - Encargado
  {
    username: "56789012",
    password: "123456",
    name: "Carlos Leal",
    role: "encargado",
  },
  // G2 - Generales
  {
    username: "67890123",
    password: "123456",
    name: "María López",
    role: "general",
  },
  {
    username: "78901234",
    password: "123456",
    name: "José Sánchez",
    role: "general",
  },
  {
    username: "89012345",
    password: "123456",
    name: "Laura Torres",
    role: "general",
  },
  // G3 - Encargado
  {
    username: "90123456",
    password: "123456",
    name: "Pedro Ramírez",
    role: "encargado",
  },
  // G3 - Generales
  {
    username: "01234567",
    password: "123456",
    name: "Carmen Flores",
    role: "general",
  },
  {
    username: "11223344",
    password: "123456",
    name: "Miguel Díaz",
    role: "general",
  },
  {
    username: "22334455",
    password: "123456",
    name: "Elena Gómez",
    role: "general",
  },
  // TN - Encargado
  {
    username: "33445566",
    password: "123456",
    name: "Roberto Castro",
    role: "encargado",
  },
  // TN - Generales
  {
    username: "44556677",
    password: "123456",
    name: "Javier Morales",
    role: "general",
  },
  {
    username: "55667788",
    password: "123456",
    name: "Andrea Navarro",
    role: "general",
  },
  {
    username: "66778899",
    password: "123456",
    name: "Fernando Herrera",
    role: "general",
  },
]