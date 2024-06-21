import requests 

url_global = 'http://localhost:3000/api'
respuesta = requests.get(url_global)
Flag = True

if respuesta.status_code == 200:
    data = respuestae.json()
    print("Operación exitosa")
    print(data)
else:
    print("Error al hacer la solicitud: {respuesta.status_code}")

def registrar_usuario(): #Funcion para registrar usuario
    print("Registro de Usuario")
    nombre = input("Ingrese su nombre: ")
    correo = input("Ingrese su dirección de correo electrónico")
    clave = input("Ingrese la clave: ")
    descripcion = input("Ingrese una descripción (opcional)")

    endpoint = '/api/registrar'
    url = url_global + endpoint #Definicion de la ruta a trabajar

    body = {'nombre': nombre, 'direccion_correo': correo, 'clave': clave, 'descripcion':descripcion} #Diccionario para desglosarlo en la API

    respuesta = requests.post(url, json = body) 
    if respuesta.status_code == 201:
        print("Usuario registrado correctamente")


def iniciar_sesion(): #funcion para iniciar sesion
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")

    endpoint = '/api/login'
    url = url_global + endpoint #Ruta a trabajar

    body = { #Diccionario para desglozarlo en la API
        'direccion_correo': correo,
        'clave': clave
    }
    respuesta = requests.post(url, json=body)

    if respuesta.status_code == 200:
        print("Inicio de sesión correcto")
        menu()

def menu(): #Menu en pantalla que se muestra al iniciar sesion correctamente
    while Flag:
        print("1.- Enviar un correo")
        print("2. Ver información de una dirección de correo electrónico")
        print("3.- Ver correos marcados como favoritos")
        print("4.- Marcar correo como favorito")
        print("5.- Terminar con la ejecución del cliente")

        eleccion = input("Escoga una de las opciones (1-5)")
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
            break
        else:
            print("Opción no valida, escoja una de las opciones correctas")

def enviar_correo(): 

def ver_informacion(): #Funcion para ver la informacion del correo, sigue el mismo principio que todo el resto de funciones con requests
    print("Ver información")
    correo_usuario = input("Indique el correo del usuario:")
    
    endpoint = '/api/informacion/:correo'
    url = url_global + endpoint

    respuesta = requests.get(url)

    if respuesta.status_code == 200:
        data = respuesta.json()
        print("Informacion del Usuario:")
        print("Nombre: {data['nombre']}")
        print("Correo: {data['correo']}")
        print("Descripción: {data['descripcion]}")
    elif respuesta.status_code == 404:
        print("Usuario no encontrado")

def ver_correos_marcados():
    print("Ver correos marcados como favoritos")

def marcar_correo_favorito():
    print("Marcar correo como favorito")
    correo = input("Ingrese su correo electronico:")
    clave = input("Ingrese su clave:")
    id_favorito = input("Ingrese el ID del correo a marcar como favorito")

    endpoint = '/api/marcarcorreo'
    url = url_global + endpoint

    body = {
        'direccion_correo': correo,
        'clave': clave,
        'id_favorito': int(id_favorito) 
    }
    respuesta = requests.post(url, json=body)
    if respuesta.status_code == 200:
        print("Correo marcado exitosamente")

    
def main(): #Funcion main que activa todo el cliente, basicamente.
    print("Te damos la bienvenida a CommuniKen")
    while Flag:
        print("1.- Registrarse")
        print("2.- Iniciar sesion")
        print("3.- Salir")

        eleccion = input("Ingrese una de las opciones (1-3)")

        if eleccion == 1:
            registrar_usuario()
        elif eleccion == 2:
            iniciar_sesion()
        elif eleccion == 3:
            break
        else:
            print("Seleccione una de las opciones validas")

main()
