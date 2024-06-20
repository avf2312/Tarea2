import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

// Definicion de las interfaces para los body dentro de los códigos.
interface Body_Registrar {
    nombre: string;
    direccion_correo: string;
    clave: string;
    descripcion: string;
}
interface Body_Login {
    direccion_correo: string;
    clave: string;
}

interface Body_Bloqueo{
  correo: string;
  clave: string;
  correo_bloquear: string;
}

app.post('/api/login', async ({ body }) => {
    const { direccion_correo, clave } = body as Body_Login;
    if (!direccion_correo || !clave) {
        return {
            status: 400,
            message: 'Debe proporcionar dirección de correo y clave',
        };
    }
    try {
        const usuario = await prisma.usuario.findFirst({
            where: { direccion_correo, clave }
        });
        return {
            status: 200,
            message: 'Inicio de sesión exitoso',
            data: usuario
        };
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return {
            status: 500,
            message: 'Error interno al iniciar sesión'
        };
    }
});

// Función que permite registrar un usuario en la aplicación, verificando que se cumplan un par de condiciones para el correcto funcionamiento de esta.
app.post('/api/registrar', async ({ body }) => {
    const { nombre, direccion_correo, clave, descripcion } = body as Body_Registrar;

    // Validación de que los campos no estén vacíos
    if (!nombre || !direccion_correo || !clave) {
        return {
            status: 400,
            message: 'Debe rellenar todos los campos obligatorios (nombre, dirección de correo, clave)'
        };
    }

    try {
        // Crear un nuevo usuario en la base de datos utilizando Prisma
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                direccion_correo,
                clave,
                descripcion,
                fecha_creacion: new Date() // Asignar la fecha de creación actual
            }
        });

        return {
            status: 201,
            message: 'Usuario registrado correctamente',
            data: nuevoUsuario
        };
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return {
            status: 500,
            message: 'Error interno al registrar usuario'
        };
    }

});

app.post('/api/bloquear', async ({ body }) =>{
    const {clave, correo, correo_bloquear} = body as Body_Bloqueo;

    try{
      const usuario_bloquear = await prisma.usuario.findFirst({where: { direccion_correo: correo_bloquear }});
      const usuario = await prisma.usuario.findFirst({where: {correo, clave}});

      if (!usuario_bloquear){
        return{
          status: 404,
          message: 'Correo a bloquear no encontrado',
        };
      }

      const correo_bloqueado = await prisma.direcciones_bloqueadas.create({
        data: {
          direccion_bloqueada: correo_bloquear,
          usuario_id: usuario.id,
          fecha_bloqueo: new Date(),
        }
      });

      return{
        status: 200,
        message: 'Correo bloqueado succesfully'
      }
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return {
          status: 500,
          message: 'Error interno al registrar usuario'
      };
  }



});
