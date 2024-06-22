-- CreateTable
CREATE TABLE "DireccionesFavoritas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_agregado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DireccionesFavoritas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL,
    "direccion_correo" VARCHAR(45) NOT NULL,
    "descripcion" VARCHAR(45) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "clave" VARCHAR(45) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinatarios" (
    "id_correo" SERIAL NOT NULL,
    "id_destinatario" INTEGER NOT NULL,

    CONSTRAINT "destinatarios_pkey" PRIMARY KEY ("id_correo")
);

-- CreateTable
CREATE TABLE "direcciones_bloqueadas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_bloqueo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_bloqueadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correo" (
    "id" SERIAL NOT NULL,
    "remitente" INTEGER NOT NULL,
    "asunto" VARCHAR(45) NOT NULL,
    "cuerpo" VARCHAR(400) NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "correo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DireccionesFavoritas_usuario_id_key" ON "DireccionesFavoritas"("usuario_id");
