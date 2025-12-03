-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NULL,
    `tipoDocumento` VARCHAR(191) NULL,
    `numeroDocumento` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ingresoMensual` DECIMAL(12, 2) NULL,
    `creadoPorId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cliente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inmueble` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreProyecto` VARCHAR(191) NOT NULL,
    `tipoInmueble` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `moneda` VARCHAR(191) NULL,
    `areaMetrosCuadrados` DOUBLE NULL,
    `descripcion` TEXT NULL,
    `habitaciones` INTEGER NULL,
    `banos` INTEGER NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `creadoPorId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Simulacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `inmuebleId` INTEGER NOT NULL,
    `creadoPorId` INTEGER NOT NULL,
    `valorInmueble` DECIMAL(15, 2) NOT NULL,
    `moneda` VARCHAR(191) NULL,
    `montoPrestamo` DECIMAL(15, 2) NOT NULL,
    `plazoAnios` INTEGER NOT NULL,
    `tipoTasa` VARCHAR(191) NOT NULL,
    `tasaInteresAnual` DOUBLE NOT NULL,
    `capitalizacion` VARCHAR(191) NULL,
    `seguroDesgravamen` DOUBLE NOT NULL,
    `seguroInmueble` DOUBLE NOT NULL,
    `periodoGraciaTotalMeses` INTEGER NULL DEFAULT 0,
    `periodoGraciaParcialMeses` INTEGER NULL DEFAULT 0,
    `aplicaBonoTechoPropio` BOOLEAN NOT NULL DEFAULT false,
    `valorBono` DECIMAL(12, 2) NULL DEFAULT 0,
    `costesNotariales` DOUBLE NULL DEFAULT 0,
    `costesRegistrales` DOUBLE NULL DEFAULT 0,
    `tasacion` DOUBLE NULL DEFAULT 0,
    `portes` DOUBLE NULL DEFAULT 0,
    `cok` DOUBLE NULL DEFAULT 5.0,
    `cuotaMensual` DECIMAL(12, 2) NULL,
    `tcea` DOUBLE NULL,
    `van` DOUBLE NULL,
    `tir` DOUBLE NULL,
    `planDePagos` JSON NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inmueble` ADD CONSTRAINT `Inmueble_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Simulacion` ADD CONSTRAINT `Simulacion_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Simulacion` ADD CONSTRAINT `Simulacion_inmuebleId_fkey` FOREIGN KEY (`inmuebleId`) REFERENCES `Inmueble`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Simulacion` ADD CONSTRAINT `Simulacion_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
