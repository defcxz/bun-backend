import { Serve } from "bun";

// Interfaces para tipado
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  timestamp: Date;
}

// Datos de ejemplo
const users: User[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: "María García",
    email: "maria@ejemplo.com",
    createdAt: new Date('2024-01-02')
  }
];

// Función helper para crear respuestas API consistentes
function createResponse<T>(
  data?: T,
  status: 'success' | 'error' = 'success',
  message?: string
): ApiResponse<T> {
  return {
    status,
    data,
    message,
    timestamp: new Date()
  };
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Respuesta simple de texto
    if (url.pathname === "/") {
      return new Response("¡Bienvenido a la API de ejemplo de Bun!");
    }

    // Respuesta de fecha actual
    if (url.pathname === "/date") {
      return Response.json(createResponse(new Date()));
    }

    // Respuesta de objeto simple
    if (url.pathname === "/status") {
      const status = {
        serverName: "BunServer",
        version: "1.0.0",
        uptime: process.uptime()
      };
      return Response.json(createResponse(status));
    }

    // Respuesta de array de objetos
    if (url.pathname === "/users") {
      return Response.json(createResponse(users));
    }

    // Respuesta con manejo de parámetros URL
    if (url.pathname.startsWith("/users/")) {
      const userId = parseInt(url.pathname.split("/")[2]);
      const user = users.find(u => u.id === userId);

      if (!user) {
        return Response.json(
          createResponse(null, 'error', 'Usuario no encontrado'),
          { status: 404 }
        );
      }

      return Response.json(createResponse(user));
    }

    // Manejo de POST con JSON
    if (url.pathname === "/users" && req.method === "POST") {
      try {
        const body = await req.json();
        const newUser: User = {
          id: users.length + 1,
          name: body.name,
          email: body.email,
          createdAt: new Date()
        };
        users.push(newUser);
        return Response.json(createResponse(newUser), { status: 201 });
      } catch (error) {
        return Response.json(
          createResponse(null, 'error', 'Error al procesar la petición'),
          { status: 400 }
        );
      }
    }

    // Respuesta para rutas no encontradas
    return Response.json(
      createResponse(null, 'error', 'Ruta no encontrada'),
      { status: 404 }
    );
  },
});

console.log(`🦊 Servidor Bun corriendo en http://localhost:${server.port}`);