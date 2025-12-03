-- AlterTable
ALTER TABLE `simulacion` MODIFY `costesNotariales` DECIMAL(12, 2) NULL DEFAULT 0,
    MODIFY `costesRegistrales` DECIMAL(12, 2) NULL DEFAULT 0,
    MODIFY `tasacion` DECIMAL(12, 2) NULL DEFAULT 0,
    MODIFY `portes` DECIMAL(12, 2) NULL DEFAULT 0,
    MODIFY `cok` DECIMAL(5, 2) NULL DEFAULT 5.0;
