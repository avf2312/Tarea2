import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

// Definición de las interfaces para los body dentro de los códigos.
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

interface Body_Bloqueo {
    direccion_correo: string;
    clave: string;
    correo_bloquear: string;
}

interface Body_MarcarCorreo {
    direccion_correo: string;
    clave: string;
    id_favorito: number;
}

interface Body_DesmarcarCorreo {
    direccion_correo: string;
    clave: string;
    id_favorito: number;
}

app
    .post('/api/login', async ({ body }) => {
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
    })
    .post('/api/registrar', async ({ body }) => {
        const { nombre, direccion_correo, clave, descripcion } = body as Body_Registrar;

        if (!nombre || !direccion_correo || !clave) {
            return {
                status: 400,
                message: 'Debe rellenar todos los campos obligatorios (nombre, dirección de correo, clave)'
            };
        }

        try {
            const nuevoUsuario = await prisma.usuario.create({
                data: {
                    nombre,
                    direccion_correo,
                    clave,
                    descripcion,
                    fecha_creacion: new Date()
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
    })
    .post('/api/bloquear', async ({ body }) => {
        const { direccion_correo, clave, correo_bloquear } = body as Body_Bloqueo;

        if (!clave || !direccion_correo || !correo_bloquear) {
            return {
                status: 400,
                message: 'Debe proporcionar los campos necesarios',
            };
        }

        try {
            const usuario_bloquear = await prisma.usuario.findFirst({ where: { direccion_correo: correo_bloquear } });
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });

            if (!usuario) {
                return {
                    status: 401,
                    message: 'Clave o correo incorrecto'
                };
            }

            if (!usuario_bloquear) {
                return {
                    status: 404,
                    message: 'Correo a bloquear no existe',
                };
            }

            const correo_bloqueado_existente = await prisma.direcciones_bloqueadas.findFirst({
                where: {
                    usuario_id: usuario.id,
                    direccion_bloqueada: correo_bloquear
                }
            });

            if (correo_bloqueado_existente) {
                return {
                    status: 409,
                    message: 'Correo ya ha sido bloqueado'
                };
            }

            const correo_bloqueado = await prisma.direcciones_bloqueadas.create({
                data: {
                    direccion_bloqueada: correo_bloquear,
                    usuario_id: usuario.id,
                    fecha_bloqueo: new Date(),
                }
            });

            return {
                status: 200,
                message: 'Correo bloqueado exitosamente'
            };
        } catch (error) {
            console.error('Error al bloquear usuario', error);
            return {
                status: 500,
                message: 'Error interno al bloquear usuario'
            };
        }
    })
    .get('/api/informacion/:correo', async ({ params }) => {
        const { correo } = params;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo: correo } });
            if (!usuario) {
                return {
                    status: 404,
                    message: 'Correo no encontrado',
                };
            }

            return {
                status: 200,
                nombre: usuario.nombre,
                correo: usuario.direccion_correo,
                descripcion: usuario.descripcion,
            };

        } catch (error) {
            console.error('Error al obtener la información del usuario', error);
            return {
                status: 500,
                message: 'Error interno al intentar obtener la información del usuario',
            };
        }
    })
    .post('/api/marcarcorreo', async ({ body }) => {
        const { direccion_correo, clave, id_favorito } = body as Body_MarcarCorreo;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });
            if (!usuario) {
                return {
                    status: 404,
                    message: 'Correo no encontrado'
                };
            }

            const usuarioFavorito = await prisma.usuario.findFirst({ where: { id: id_favorito } });
            if (!usuarioFavorito) {
                return {
                    status: 404,
                    message: 'ID de favorito no encontrado',
                };
            }
            const direccionFavorita = usuarioFavorito.direccion_correo;

            const correo_favorito_existente = await prisma.direccionesFavoritas.findFirst({
                where: { usuario_id: usuario.id, direccion_favorita: direccionFavorita }
            });

            if (correo_favorito_existente) {
                return {
                    status: 409,
                    message: 'Correo ya es tu favorito'
                };
            }

            const Favorito = await prisma.direccionesFavoritas.create({
                data: {
                    usuario_id: usuario.id,
                    direccion_favorita: direccionFavorita,
                    fecha_agregado: new Date()
                }
            });

            return {
                status: 200,
                message: 'Agregado a tu lista de favoritos correctamente'
            };
        } catch (error) {
            console.error('Error al marcar el correo como favorito:', error);
            return {
                status: 500,
                message: 'Error interno al marcar el correo como favorito',
            };
        }
    })
    .delete('/api/desmarcarcorreo/', async ({ body }) => {
        const { direccion_correo, clave, id_favorito } = body as Body_DesmarcarCorreo;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });

            if (!usuario) {
                return {
                    status: 404,
                    message: 'Usuario no encontrado o credenciales inválidas'
                };
            }
            const usuarioFavorito = await prisma.direccionesFavoritas.findFirst({ where: { id: id_favorito } });

            if (!usuarioFavorito) {
                return {
                    status: 404,
                    message: 'Usuario favorito no encontrado'
                };
            }
            await prisma.direccionesFavoritas.delete({
                where: { id: id_favorito }
            });

            return {
                status: 200,
                message: 'Correo desmarcado correctamente'
            };

        } catch (error) {
            console.error('Error al desmarcar el correo:', error);
            return {
                status: 500,
                message: 'Error interno al desmarcar el correo'
            };
        }
    });

app.listen(3000);