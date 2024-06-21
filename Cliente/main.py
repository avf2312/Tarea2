import requests

url_global = 'http://localhost:3000/api'
respuesta_global = requests.get(url_global)
Flag = True

if respuesta_global.status_code == 200:
    data = respuesta_global.json()
    print("Operación exitosa")
    print(data)
else:
    print(f"Error al hacer la solicitud: {respuesta_global.status_code}")

def registrar_usuario(): # Función para registrar usuario
    print("Registro de Usuario")
    nombre = input("Ingrese su nombre: ")
    correo = input("Ingrese su dirección de correo electrónico: ")
    clave = input("Ingrese la clave: ")
    descripcion = input("Ingrese una descripción (opcional): ")

    endpoint = '/registrar'
    url = url_global + endpoint # Definición de la ruta a trabajar

    body = {'nombre': nombre, 'direccion_correo': correo, 'clave': clave, 'descripcion': descripcion} # Diccionario para desglosarlo en la API

    respuesta_api = requests.post(url, json=body) 
    if respuesta_api.status_code == 201:
        print("Usuario registrado correctamente")
    else:
        print(f"Error al registrar usuario: {respuesta_api.status_code}")

def iniciar_sesion(): # Función para iniciar sesión
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")

    endpoint = '/login'
    url = url_global + endpoint # Ruta a trabajar

    body = { # Diccionario para desglosarlo en la API
        'direccion_correo': correo,
        'clave': clave
    }
    respuesta_api = requests.post(url, json=body)

    if respuesta_api.status_code == 200:
        print("Inicio de sesión correcto")
        menu()
    else:
        print(f"Error al iniciar sesión: {respuesta_api.status_code}")

def menu(): # Menú en pantalla que se muestra al iniciar sesión correctamente
    global Flag
    while Flag:
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
            Flag = False
        else:
            print("Opción no válida, escoja una de las opciones correctas")

def enviar_correo(): 
    print("Enviando correo...")

def ver_informacion(): # Función para ver la información del correo
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
    print("Ver correos marcados como favoritos")

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
