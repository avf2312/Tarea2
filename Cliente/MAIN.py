import requests 
Flag = True

url_global = 'http://localhost:3000/api'
respuesta_global = requests.get(url_global)

if respuesta_global.status_code == 200:
    data = respuesta_global.json()
    print("Operación exitosa")
    print(data)
else:
    print(f"Error al hacer la solicitud: {respuesta_global.status_code}")
    
    
def menu(): 
    global Flag
    while Flag:
        print("Menu: \n ")
        print("1.- Enviar un correo")
        print("2.- Ver información de una dirección de correo electrónico")
        print("3.- Ver correos marcados como favoritos")
        print("4.- Marcar correo como favorito")
        print("5.- Terminar con la ejecución del cliente")

        eleccion = input("Escoja una de las opciones (1-5): ")
        if eleccion == '1':
            enviar_correo()
        elif eleccion == '2':
            ver_informacion()
        elif eleccion == '3':
            ver_correos_marcados()
        elif eleccion == '4':
            marcar_correo_favorito()
        elif eleccion == '5':
            print("Cerrando cliente")
            print("\n")
            print("Muchas gracias por usar ComunniKen")
            Flag = False
            break
        else:
            print("Opción no válida, escoja una de las opciones correctas")   

def iniciar_sesion(): 
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")

    endpoint = '/login'
    url = url_global + endpoint 

    body = { 
        'direccion_correo': correo,
        'clave': clave
    }
    respuesta_api = requests.post(url, json=body)

    if respuesta_api.status_code == 200:
        print("Inicio de sesión correcto")
        menu()
    else:
        print(f"Error al iniciar sesión: {respuesta_api.status_code}")


def registrar_usuario(): 
    print("Registro de Usuario")
    nombre = input("Ingrese su nombre: ")
    correo = input("Ingrese su dirección de correo electrónico: ")
    clave = input("Ingrese la clave: ")
    descripcion = input("Ingrese una descripción (opcional): ")

    endpoint = '/registrar'
    url = url_global + endpoint 

    body = {'nombre': nombre, 'direccion_correo': correo, 'clave': clave, 'descripcion': descripcion} # Diccionario para desglosarlo en la API

    respuesta_api = requests.post(url, json=body) 
    if respuesta_api.status_code == 200:
        print("Usuario registrado correctamente")
    else:
        print(f"Error al registrar usuario: {respuesta_api.status_code}")


def enviar_correo(): 
    print("\n")
    remitente = input('Ingrese su correo electronico: ')
    asunto = input('Ingrese asunto: ')
    cuerpo = input('Ingrese cuerpo: ')
    destinatario = input('Ingrese destinatario: ')
    
    endpoint = '/enviarcorreo'
    url = url_global + endpoint
    body = { 
        'direccion_remitente': remitente,
        'asuntocorreo': asunto,
        'cuerpocorreo': cuerpo,
        'direccion_destinatario': destinatario,
    }
    
    respuesta_api = requests.post(url, json=body)
    if respuesta_api.status_code == 200:
        print("Correo enviado correctamente")
        print("\n")
        menu()
    else:
        print(f"Error al enviar correo: {respuesta_api.status_code}")
    
    

def ver_informacion(): 
    print("Ver información")
    correo_usuario = input("Indique el correo del usuario: ")
    
    endpoint = f'/informacion/{correo_usuario}'
    url = url_global + endpoint

    respuesta_api = requests.get(url)

    if respuesta_api.status_code == 200:
        data = respuesta_api.json()
        print("Información del Usuario:")
        print(f"Nombre: {data['nombre']}")
        print(f"Correo: {data['correo']}")
        print(f"Descripción: {data['descripcion']}")
    elif respuesta_api.status_code == 404:
        print("Usuario no encontrado")
    else:
        print(f"Error al obtener información: {respuesta_api.status_code}")

def ver_correos_marcados():
    correo = input('Ingrese su correo electrónico: ')
    endpoint = f'/vercorreosfavoritos/{correo}'
    url = url_global + endpoint

    respuesta_api = requests.get(url)
    
    if respuesta_api.status_code == 200:
        data = respuesta_api.json()
        print("Direcciones Favoritas mostradas correctamente:")
        for direccion in data.get('direccionesfav', []):
            print(f"ID: {direccion.get('id')}, Dirección: {direccion.get('direccion_favorita')}")
        
        if data.get('direccionesfav'):
            print("¿Desea desmarcar alguno de estos correos?")
            print("0. No")
            print("1. Sí")
            respuestapregunta = input()
            if respuestapregunta == "1":
                desmarcarcorreo()
            else:
                print("Volviendo al Menú")
        else:
            print("No se encontraron direcciones favoritas.")
            
    elif respuesta_api.status_code == 404:
        print("Usuario no encontrado")
    else:
        print(f"Error al mostrar direcciones favoritas: {respuesta_api.status_code}")

    

def marcar_correo_favorito():
    print("Marcar correo como favorito")
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")
    id_favorito = input("Ingrese el ID del correo a marcar como favorito: ")

    endpoint = '/marcarcorreo'
    url = url_global + endpoint

    body = {
        'direccion_correo': correo,
        'clave': clave,
        'id_favorito': int(id_favorito)
    }
    respuesta_api = requests.post(url, json=body)
    if respuesta_api.status_code == 200:
        print("Correo marcado exitosamente")
    else:
        print(f"Error al marcar correo: {respuesta_api.status_code}")
        
def desmarcarcorreo():
    print("Proceso para desmarcar")
    
    endpoint = '/desmarcarcorreo'
    url = url_global + endpoint
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")
    id_favorito = input("Ingrese el ID del correo a desmarcar: ")
    
    body = {
        'direccion_correo': correo,
        'clave': clave,
        'id_favorito': int(id_favorito)
    }
    respuesta_api = requests.delete(url, json=body)
    if respuesta_api.status_code == 200:
        print("Correo desmarcado exitosamente")
    else:
        print(f"Error al desmarcar correo: {respuesta_api.status_code}")
    
def main(): # Función main que activa todo el cliente
    global Flag
    print("Te damos la bienvenida a CommuniKen")
    while Flag:
        print("1.- Registrarse")
        print("2.- Iniciar sesión")
        print("3.- Salir")

        eleccion = input("Ingrese una de las opciones (1-3): ")

        if eleccion == "1":
            registrar_usuario()
        elif eleccion == "2":
            iniciar_sesion()
        elif eleccion == "3":
            Flag = False
        else:
            print("Seleccione una de las opciones válidas")

main()