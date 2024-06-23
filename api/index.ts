import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

// Definición de las interfaces para los body dentro de los códigos
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
    .post('/api/registrar', async ({ body, set }) => {
        const { nombre, direccion_correo, clave, descripcion } = body as Body_Registrar;
        if (!nombre || !direccion_correo || !clave) {
            set.status = 400;
            return { 
                message: 'Debe rellenar todos los campos obligatorios (nombre, dirección de correo, clave)' 
            };
        }

        const direccioncorreo = await prisma.usuario.findFirst({ where: { direccion_correo } });
        if (direccioncorreo) {
            set.status = 400;
            return { 
                message: 'Usuario ya registrado' 
            };
        }

        try {
            await prisma.usuario.create({
                data: {
                    nombre,
                    direccion_correo,
                    clave,
                    descripcion,
                    fecha_creacion: new Date()
                }
            });
            set.status = 200;
            return { 
                message: 'Usuario registrado correctamente' 
            };
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            set.status = 500;
            return { 
                message: 'Error interno al registrar usuario' 
            };
        }
    })
    .post('/api/login', async ({ body, set }) => {
        const { direccion_correo, clave } = body as Body_Login;
        if (!direccion_correo || !clave) {
            set.status = 400;
            return { 
                message: 'Debe proporcionar dirección de correo y clave' 
            };
        }
        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });
            if (!usuario) {
                set.status = 401;
                return {
                     message: 'Correo o clave incorrecta' 
                    };
            }
            set.status = 200;
            return {
                 message: 'Inicio de sesión exitoso', data: usuario 
                };
        } catch (error) {
            console.error('Error al iniciar sesión:', error);

            set.status = 500;
            return { 
                message: 'Error interno al iniciar sesión' 
            };
        }
    })
    .post('/api/bloquear', async ({ body, set }) => {
        const { direccion_correo, clave, correo_bloquear } = body as Body_Bloqueo;
        if (!clave || !direccion_correo || !correo_bloquear) {
            set.status = 400;
            return { 
                message: 'Debe proporcionar los campos necesarios' 
            };
        }

        try {
            const usuario_bloquear = await prisma.usuario.findFirst({ where: { direccion_correo: correo_bloquear } });
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });

            if (!usuario) {
                set.status = 401;
                return { 
                    message: 'Clave o correo incorrecto' 
                };
            }

            if (!usuario_bloquear) {
                set.status = 404;
                return { 
                    message: 'Correo a bloquear no existe' 
                };
            }

            const correo_bloqueado_existente = await prisma.direcciones_bloqueadas.findFirst({
                where: {
                    usuario_id: usuario.id,
                    direccion_bloqueada: correo_bloquear
                }
            });

            if (correo_bloqueado_existente) {
                set.status = 409;
                return { 
                    message: 'Correo ya ha sido bloqueado' 
                };
            }

            await prisma.direcciones_bloqueadas.create({
                data: {
                    direccion_bloqueada: correo_bloquear,
                    usuario_id: usuario.id,
                    fecha_bloqueo: new Date(),
                }
            });

            set.status = 200;
            return { 
                message: 'Correo bloqueado exitosamente' 
            };
        } catch (error) {
            console.error('Error al bloquear usuario', error);
            set.status = 500;
            return { 
                message: 'Error interno al bloquear usuario' 
            };
        }
    })
    .get('/api/informacion/:correo', async ({ params, set }) => {
        const { correo } = params;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo: correo } });
            if (!usuario) {
                set.status = 404;
                return {
                     message: 'Correo no encontrado' 
                    };
            }

            set.status = 200;
            return {
                nombre: usuario.nombre,
                correo: usuario.direccion_correo,
                descripcion: usuario.descripcion,
            };

        } catch (error) {
            console.error('Error al obtener la información del usuario', error);
            set.status = 500;
            return { 
                message: 'Error interno al intentar obtener la información del usuario' 
            };
        }
    })
    .post('/api/marcarcorreo', async ({ body, set }) => {
        const { direccion_correo, clave, id_favorito } = body as Body_MarcarCorreo;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });
            if (!usuario) {
                set.status = 401;
                return { 
                    message: 'Correo o clave incorrecta' 
                };
            }

            const usuarioFavorito = await prisma.usuario.findFirst({ where: { id: id_favorito } });
            if (!usuarioFavorito) {
                set.status = 404;
                return { 
                    message: 'ID de favorito no encontrado'
                };
            }
            const direccionFavorita = usuarioFavorito.direccion_correo;

            const correo_favorito_existente = await prisma.direccionesFavoritas.findFirst({where: { usuario_id: usuario.id, direccion_favorita: direccionFavorita }});

            if (correo_favorito_existente) {
                set.status = 409;
                return { 
                    message: 'Correo ya es tu favorito' 
                };
            }

            await prisma.direccionesFavoritas.create({
                data: {
                    usuario_id: usuario.id,
                    direccion_favorita: direccionFavorita,
                    fecha_agregado: new Date()
                }
            });
            set.status = 200;
            return { 
                message: 'Agregado a tu lista de favoritos correctamente' 
            };
        } catch (error) {
            console.error('Error al marcar el correo como favorito:', error);
            set.status = 500;
            return {
                 message: 'Error interno al marcar el correo como favorito' 
                };
        }
    })
    .delete('/api/desmarcarcorreo/', async ({ body, set }) => {
        const { direccion_correo, clave, id_favorito } = body as Body_DesmarcarCorreo;

        try {
            const usuario = await prisma.usuario.findFirst({ where: { direccion_correo, clave } });

            if (!usuario) {
                set.status = 401;
                return { 
                    message: 'Usuario no encontrado o credenciales inválidas' 
                };
            }
            const usuarioFavorito = await prisma.direccionesFavoritas.findFirst({ where: { id: id_favorito } });

            if (!usuarioFavorito) {
                set.status = 404;
                return {
                     message: 'Usuario favorito no encontrado' 
                    };
            }
            await prisma.direccionesFavoritas.delete({
                where: { id: id_favorito }
            });
            set.status = 200;
            return { 
                message: 'Correo desmarcado correctamente' 
            };

        } catch (error) {
            console.error('Error al desmarcar el correo:', error);
            set.status = 500;
            return { 
                message: 'Error interno al desmarcar el correo' 
            };
        }
    })
    .get('/api', ({ set }) => {
        set.status = 200;
        return { message: 'API is running' };  
    });

app.listen(3000);
