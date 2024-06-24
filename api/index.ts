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

interface Body_EnviarCorreo {
    direccion_remitente: string;
    asuntocorreo: string;
    cuerpocorreo: string;
    direccion_destinatario: string;

}

interface Body_vercorreosfav{
    direccion_correover: string;
}



app
    .post('/api/registrar', async ({ body, set }) => {                                     // Registrar hace suyo el body correspondiente, checkea si ya existe el usuario, 
        const { nombre, direccion_correo, clave, descripcion } = body as Body_Registrar;   // si no está registrado se añada a las tablas correspondientes en la base de datos
        if (!nombre || !direccion_correo || !clave) {                                      // También la api toma en cuenta los distintos errores que pueden ocurrir
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
    .post('/api/login', async ({ body, set }) => {                                       // Para login se hace el mismo proceso que para registrar, se checkea si existe el usuario, si no se encuentra se da el error correspondiente
        const { direccion_correo, clave } = body as Body_Login;                         //Si no se logea perfectamente a la plataforma de ComunniKen
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
    .post('/api/bloquear', async ({ body, set }) => {                                       //bloquear usuario a pesar de no estar inscrita en el menú, está aquí en las funciones de la api
        const { direccion_correo, clave, correo_bloquear } = body as Body_Bloqueo;          // primeramente se verifica si el usuario que queremos bloquear existe en nuestras tablas,
        if (!clave || !direccion_correo || !correo_bloquear) {                              // si es que no lo hace se da el error correspondiente y si existe, se bloquea exitosamente
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
    .get('/api/informacion/:correo', async ({ params, set }) => {                       //informacion lo que hace primeramente es verificar si existe el usuario que queremos encontrar la información
        const { correo } = params;                                                      // si existe el usuario nos devuelve un JSON con los datos respectivos del usuario que queremos saber la información

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
    .post('/api/marcarcorreo', async ({ body, set }) => {                                  //marcar correo principalmente checkea que los dos correos principales existan, como de valor nos dan el id del correo que queremos hacer favorito
        const { direccion_correo, clave, id_favorito } = body as Body_MarcarCorreo;        // encontramos mediante busqueda cual es el correo correspondiente y si este ya es favorito, se da el error correspondiente.
                                                                                            // por otro lado, si el correo aún no ha sido marcado se añade a la tabla correspondiente en la base de datos
    try {
        // Buscar el usuario por su dirección de correo y clave
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

       
        const usuario_id = usuario.id;

        
        const correo_favorito_existente = await prisma.direccionesFavoritas.findFirst({
            where: { usuario_id: usuario_id, direccion_favorita: direccionFavorita }
        });

        if (correo_favorito_existente) {
            set.status = 409;
            return { 
                message: 'Correo ya es tu favorito' 
            };
        }


        await prisma.direccionesFavoritas.create({
            data: {
                usuario_id: usuario_id,
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
    .delete('/api/desmarcarcorreo/', async ({ body, set }) => {                                 //desmarcar correo hace la misma función que marcar correo pero de manera contraria, encuentra el usuario mediante su id y borra de las tablas 
        const { direccion_correo, clave, id_favorito } = body as Body_DesmarcarCorreo;          // sus datos. 

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
    .post('/api/enviarcorreo', async ({body, set}) =>{                                                                 //enviar correo recibe como body 4 parametros, las dos verificaciones importantes que se hacen es si los correos existen en la base de datos
        const {direccion_remitente, asuntocorreo, cuerpocorreo, direccion_destinatario} = body as Body_EnviarCorreo;    // despues de esta verificación, se procede con crear los datos para la base de datos del correo correspondiente
        
        try{
            const correodestinatario = await prisma.usuario.findFirst({ where: {direccion_correo: direccion_destinatario} });
            if(!correodestinatario){
                set.status = 404;
                return{
                    message: 'Correo del destinatario no encontrado'
                }
            };
            const destinatario_id = correodestinatario.id;
            const remitente = await prisma.usuario.findFirst({where: {direccion_correo: direccion_remitente}})
            if (!remitente){
                set.status = 404;
                return{
                    message: 'Remitente no encontrado'
                }
            }
            const remitente_id = remitente.id;
            const correoCreado = await prisma.correo.create({
                data: {
                  remitente: remitente_id,
                  asunto: asuntocorreo,
                  cuerpo: cuerpocorreo,
                  fecha_envio: new Date(),
                  destinatarios: destinatario_id,
                }
              });
            set.status = 200;
            return {
                message: 'Correo enviado con éxito'
            }

        } catch(error){
            set.status = 500;
            return {
                message: 'Error interno al enviar correo'
            }
        }
    })
    .get('/api/vercorreosfavoritos/:direccioncorreo', async ({ params, set })=>{     // ver correos favoritos actúa de la misma manera que actua información, verificamos la existencia de que el correo del usuario exista y desde ahí
        const { direccioncorreo } = params;                                          // se manda al python el data para imprimirlo en la terminal

    try {
        const usuariovercorreos = await prisma.usuario.findFirst({ where: { direccion_correo: direccioncorreo } });
        if (!usuariovercorreos) {
            set.status = 404;
            return {
                message: 'Usuario no encontrado'
            };
        }

        const usuariovercorreos_id = usuariovercorreos.id;

        const direccionesfavoritas = await prisma.direccionesFavoritas.findMany({ where: { usuario_id: usuariovercorreos_id } });
        set.status = 200;
        return {
            message: 'Direcciones Favoritas mostradas correctamente',
            direccionesfav: direccionesfavoritas,
        };

    } catch (error) {
        console.error('Error interno al intentar mostrar las direcciones Favoritas', error);
        set.status = 500;
        return {
            message: 'Error interno al intentar mostrar las direcciones Favoritas'
        };
    }
    })
    .get('/api', ({ set }) => {
        set.status = 200;
        return { message: 'API is running' };  
    });

app.listen(3000);
